import { Router, Response } from 'express'
import { db } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// ─── Package catalog ──────────────────────────────────────────────────────────
const PACKAGES = [
  { id: 'mtn-6g-monthly',  op: 'mtn',     name: 'ماهانه ۶ گیگ',  type: 'internet', price_rial: 523900 },
  { id: 'mtn-4g-weekly',   op: 'mtn',     name: 'هفتگی ۴ گیگ',   type: 'internet', price_rial: 304400 },
  { id: 'mci-10g-monthly', op: 'mci',     name: 'ماهانه ۱۰ گیگ', type: 'internet', price_rial: 850000 },
  { id: 'mci-3g-weekly',   op: 'mci',     name: 'هفتگی ۳ گیگ',   type: 'internet', price_rial: 220000 },
  { id: 'rgt-1g-daily',    op: 'rightel', name: 'روزانه ۱ گیگ',   type: 'internet', price_rial: 85000  },
  { id: 'mtn-charge-10k',  op: 'mtn',     name: 'شارژ ۱۰,۰۰۰ تومانی', type: 'charge', price_rial: 100000 },
  { id: 'mtn-charge-20k',  op: 'mtn',     name: 'شارژ ۲۰,۰۰۰ تومانی', type: 'charge', price_rial: 200000 },
  { id: 'mci-charge-50k',  op: 'mci',     name: 'شارژ ۵۰,۰۰۰ تومانی', type: 'charge', price_rial: 500000 },
]

// ─── Stub operator API caller ─────────────────────────────────────────────────
// Replace the body with real operator SDK calls (Irancell / MTN, MCI, etc.)
async function callOperatorApi(params: {
  op: string; phone: string; packageId: string; type: string; priceRial: number
}): Promise<{ success: boolean; refCode: string }> {
  // TODO: integrate real operator APIs
  // MTN Irancell: https://developer.mtnirancell.ir
  // MCI (Hamrah Aval): their MVNO portal API
  // Rightel: their reseller API
  console.log(`[TELECOM] ${params.op} | ${params.type} | ${params.phone} | ${params.packageId}`)
  await new Promise(r => setTimeout(r, 500)) // simulate latency
  return { success: true, refCode: `REF-${Date.now()}` }
}

// GET /api/telecom/packages
router.get('/packages', requireAuth, (_req: AuthRequest, res: Response) => {
  res.json({ packages: PACKAGES })
})

// POST /api/telecom/internet
router.post('/internet', requireAuth, async (req: AuthRequest, res: Response) => {
  const { phone, packageId } = req.body as { phone?: string; packageId?: string }
  if (!phone || !packageId) {
    res.status(400).json({ error: 'missing_fields' })
    return
  }
  const pkg = PACKAGES.find(p => p.id === packageId && p.type === 'internet')
  if (!pkg) { res.status(404).json({ error: 'package_not_found' }); return }

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const wallet = await client.query(
      `SELECT rial_balance FROM wallets WHERE user_id = $1 FOR UPDATE`,
      [req.userId]
    )
    if (wallet.rowCount === 0 || wallet.rows[0].rial_balance < pkg.price_rial) {
      await client.query('ROLLBACK')
      res.status(400).json({ error: 'insufficient_balance' })
      return
    }

    const result = await callOperatorApi({ op: pkg.op, phone, packageId, type: 'internet', priceRial: pkg.price_rial })
    if (!result.success) {
      await client.query('ROLLBACK')
      res.status(502).json({ error: 'operator_error' })
      return
    }

    await client.query(
      `UPDATE wallets SET rial_balance = rial_balance - $1, updated_at = NOW() WHERE user_id = $2`,
      [pkg.price_rial, req.userId]
    )
    await client.query(
      `INSERT INTO telecom_orders (user_id, target_phone, operator, package_id, order_type, amount_rial, status, ref_code)
       VALUES ($1,$2,$3,$4,'internet',$5,'completed',$6)`,
      [req.userId, phone, pkg.op, packageId, pkg.price_rial, result.refCode]
    )
    await client.query(
      `INSERT INTO transactions (user_id, type, direction, currency, amount, status, notes)
       VALUES ($1,'telecom_internet','out','rial',$2,'completed',$3)`,
      [req.userId, pkg.price_rial, `${pkg.name} for ${phone}`]
    )

    await client.query('COMMIT')
    res.json({ success: true, refCode: result.refCode })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Internet purchase error:', err)
    res.status(500).json({ error: 'purchase_failed' })
  } finally {
    client.release()
  }
})

// POST /api/telecom/charge
router.post('/charge', requireAuth, async (req: AuthRequest, res: Response) => {
  const { phone, packageId } = req.body as { phone?: string; packageId?: string }
  if (!phone || !packageId) {
    res.status(400).json({ error: 'missing_fields' })
    return
  }
  const pkg = PACKAGES.find(p => p.id === packageId && p.type === 'charge')
  if (!pkg) { res.status(404).json({ error: 'package_not_found' }); return }

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    const wallet = await client.query(
      `SELECT rial_balance FROM wallets WHERE user_id = $1 FOR UPDATE`,
      [req.userId]
    )
    if (wallet.rowCount === 0 || wallet.rows[0].rial_balance < pkg.price_rial) {
      await client.query('ROLLBACK')
      res.status(400).json({ error: 'insufficient_balance' })
      return
    }

    const result = await callOperatorApi({ op: pkg.op, phone, packageId, type: 'charge', priceRial: pkg.price_rial })
    if (!result.success) {
      await client.query('ROLLBACK')
      res.status(502).json({ error: 'operator_error' })
      return
    }

    await client.query(
      `UPDATE wallets SET rial_balance = rial_balance - $1, updated_at = NOW() WHERE user_id = $2`,
      [pkg.price_rial, req.userId]
    )
    await client.query(
      `INSERT INTO telecom_orders (user_id, target_phone, operator, package_id, order_type, amount_rial, status, ref_code)
       VALUES ($1,$2,$3,$4,'charge',$5,'completed',$6)`,
      [req.userId, phone, pkg.op, packageId, pkg.price_rial, result.refCode]
    )
    await client.query(
      `INSERT INTO transactions (user_id, type, direction, currency, amount, status, notes)
       VALUES ($1,'telecom_charge','out','rial',$2,'completed',$3)`,
      [req.userId, pkg.price_rial, `شارژ ${pkg.name} for ${phone}`]
    )

    await client.query('COMMIT')
    res.json({ success: true, refCode: result.refCode })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Charge purchase error:', err)
    res.status(500).json({ error: 'purchase_failed' })
  } finally {
    client.release()
  }
})

export default router
