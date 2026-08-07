import { Router, Response } from 'express'
import { db } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/transactions?limit=20&offset=0&type=all|in|out
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
  const offset = parseInt(req.query.offset as string) || 0
  const dir = req.query.type as string // 'in' | 'out' | 'all'

  let whereClause = 'WHERE t.user_id = $1'
  const params: any[] = [req.userId]

  if (dir === 'in' || dir === 'out') {
    whereClause += ` AND t.direction = $${params.length + 1}`
    params.push(dir)
  }

  const result = await db.query(
    `SELECT
       t.id,
       t.type,
       t.direction,
       t.currency,
       t.amount,
       t.commission_amount,
       t.network_fee_usdt,
       t.dest_type,
       t.dest_address,
       t.dest_currency,
       t.dest_amount,
       t.status,
       t.payment_id,
       t.created_at,
       u2.phone AS counterpart_phone
     FROM transactions t
     LEFT JOIN users u2 ON u2.id = t.counterpart_user_id
     ${whereClause}
     ORDER BY t.created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  )

  // Format for the frontend Transaction type
  const transactions = result.rows.map(row => ({
    id: row.id,
    type: row.direction as 'in' | 'out',
    title: titleForType(row.type, row.direction),
    subtitle: row.counterpart_phone || row.dest_address || '',
    amount: formatAmount(row.amount, row.currency),
    currency: row.currency as 'rial' | 'usdt',
    date: formatPersianDate(row.created_at),
    status: row.status,
  }))

  res.json({ transactions })
})

function titleForType(type: string, direction: string): string {
  const map: Record<string, string> = {
    deposit_usdt: 'واریز تتر',
    deposit_rial: 'واریز ریال',
    withdraw_usdt: 'برداشت تتر',
    withdraw_rial: 'برداشت ریال',
    transfer_rial: direction === 'in' ? 'دریافت ریال' : 'انتقال ریال',
    transfer_usdt: direction === 'in' ? 'دریافت تتر' : 'انتقال تتر',
    swap_rial_usdt: 'تبدیل ریال به تتر',
    swap_usdt_rial: 'تبدیل تتر به ریال',
    bill_payment: 'پرداخت قبض',
    telecom_charge: 'خرید شارژ',
    telecom_internet: 'خرید بسته اینترنت',
  }
  return map[type] || type
}

function formatAmount(amount: string | number, currency: string): string {
  const n = parseFloat(amount.toString())
  if (currency === 'rial') return n.toLocaleString('fa-IR')
  return n.toFixed(2)
}

// Convert JS Date to Persian date string (Jalali approximation)
// In production use a proper jalali library like 'jalaali-js'
function formatPersianDate(d: Date): string {
  const date = new Date(d)
  return date.toLocaleDateString('fa-IR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default router
