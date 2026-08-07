import { Router, Response } from 'express'
import { db } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const COMMISSION = parseFloat(process.env.COMMISSION_RATE || '0.003')
const NET_FEE_USDT = parseFloat(process.env.NETWORK_FEE_USDT || '1')

// POST /api/transfer
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { srcCurrency, destType, destValue, amount, destCurrency, paymentId } = req.body as {
    srcCurrency: 'rial' | 'usdt'
    destType: 'kelid' | 'card' | 'crypto'
    destValue: string
    amount: number
    destCurrency: 'rial' | 'usdt'
    paymentId?: string
  }

  if (!srcCurrency || !destType || !destValue || !amount || amount <= 0) {
    res.status(400).json({ error: 'invalid_params' })
    return
  }

  const client = await db.connect()
  try {
    await client.query('BEGIN')

    // Get sender wallet with lock
    const walletResult = await client.query(
      `SELECT rial_balance, usdt_balance FROM wallets WHERE user_id = $1 FOR UPDATE`,
      [req.userId]
    )
    if (walletResult.rowCount === 0) {
      await client.query('ROLLBACK')
      res.status(400).json({ error: 'wallet_not_found' })
      return
    }
    const wallet = walletResult.rows[0]

    // Validate balance
    if (srcCurrency === 'rial' && wallet.rial_balance < amount) {
      await client.query('ROLLBACK')
      res.status(400).json({ error: 'insufficient_rial_balance' })
      return
    }
    if (srcCurrency === 'usdt' && parseFloat(wallet.usdt_balance) < amount) {
      await client.query('ROLLBACK')
      res.status(400).json({ error: 'insufficient_usdt_balance' })
      return
    }

    // Get current USDT price for swap calculations
    const priceRow = await client.query(
      `SELECT price FROM price_cache WHERE symbol = 'usdt_rial' ORDER BY fetched_at DESC LIMIT 1`
    )
    const usdtPrice = priceRow.rowCount && priceRow.rowCount > 0 ? priceRow.rows[0].price : 700000

    // Compute fees and destination amount
    let deductRial = 0
    let deductUsdt = 0
    let commissionAmount = 0
    let networkFee = 0
    let destAmount = 0
    let txType = ''

    if (srcCurrency === 'rial' && destCurrency === 'rial') {
      commissionAmount = Math.round(amount * COMMISSION)
      deductRial = amount + commissionAmount
      destAmount = amount
      txType = 'transfer_rial'
    } else if (srcCurrency === 'usdt' && destCurrency === 'usdt') {
      commissionAmount = amount * COMMISSION
      networkFee = destType === 'crypto' ? NET_FEE_USDT : 0
      deductUsdt = amount
      destAmount = amount - commissionAmount - networkFee
      txType = 'transfer_usdt'
    } else if (srcCurrency === 'rial' && destCurrency === 'usdt') {
      const usdtOut = amount / usdtPrice
      commissionAmount = usdtOut * COMMISSION
      networkFee = destType === 'crypto' ? NET_FEE_USDT : 0
      deductRial = amount
      destAmount = usdtOut - commissionAmount - networkFee
      txType = 'swap_rial_usdt'
    } else {
      // usdt -> rial
      const rialOut = amount * usdtPrice
      commissionAmount = rialOut * COMMISSION
      deductUsdt = amount
      destAmount = rialOut - commissionAmount
      txType = 'swap_usdt_rial'
    }

    // Deduct from sender
    if (deductRial > 0) {
      await client.query(
        `UPDATE wallets SET rial_balance = rial_balance - $1, updated_at = NOW() WHERE user_id = $2`,
        [Math.round(deductRial), req.userId]
      )
    }
    if (deductUsdt > 0) {
      await client.query(
        `UPDATE wallets SET usdt_balance = usdt_balance - $1, updated_at = NOW() WHERE user_id = $2`,
        [deductUsdt, req.userId]
      )
    }

    // Credit receiver if Kelid-to-Kelid
    let counterpartUserId: number | null = null
    if (destType === 'kelid') {
      const receiverResult = await client.query(
        `SELECT u.id FROM users u WHERE u.phone = $1 AND u.is_active = true`,
        [destValue]
      )
      if (receiverResult.rowCount && receiverResult.rowCount > 0) {
        counterpartUserId = receiverResult.rows[0].id
        if (destCurrency === 'rial' && destAmount > 0) {
          await client.query(
            `UPDATE wallets SET rial_balance = rial_balance + $1, updated_at = NOW() WHERE user_id = $2`,
            [Math.round(destAmount), counterpartUserId]
          )
        }
        if (destCurrency === 'usdt' && destAmount > 0) {
          await client.query(
            `UPDATE wallets SET usdt_balance = usdt_balance + $1, updated_at = NOW() WHERE user_id = $2`,
            [destAmount, counterpartUserId]
          )
        }
      }
    }

    // Record sender transaction
    const txResult = await client.query(
      `INSERT INTO transactions
         (user_id, counterpart_user_id, type, direction, currency, amount,
          commission_amount, network_fee_usdt, dest_type, dest_address,
          dest_currency, dest_amount, usdt_price_rial, payment_id, status)
       VALUES ($1,$2,$3,'out',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'completed')
       RETURNING id`,
      [
        req.userId, counterpartUserId, txType, srcCurrency, amount,
        commissionAmount, networkFee, destType, destValue,
        destCurrency, destAmount, usdtPrice, paymentId || null,
      ]
    )

    // Record receiver transaction (Kelid-to-Kelid only)
    if (counterpartUserId) {
      await client.query(
        `INSERT INTO transactions
           (user_id, counterpart_user_id, type, direction, currency, amount,
            dest_type, dest_currency, usdt_price_rial, payment_id, status)
         VALUES ($1,$2,$3,'in',$4,$5,$6,$7,$8,$9,'completed')`,
        [
          counterpartUserId, req.userId, txType, destCurrency, destAmount,
          'kelid', srcCurrency, usdtPrice, paymentId || null,
        ]
      )
    }

    await client.query('COMMIT')
    res.json({ success: true, id: txResult.rows[0].id })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Transfer error:', err)
    res.status(500).json({ error: 'transfer_failed' })
  } finally {
    client.release()
  }
})

// GET /api/users/lookup?phone=09...
router.get('/lookup-user', requireAuth, async (req: AuthRequest, res: Response) => {
  const { phone } = req.query as { phone?: string }
  if (!phone) { res.status(400).json({ error: 'phone_required' }); return }
  const result = await db.query(
    `SELECT id, kelid_id FROM users WHERE phone = $1 AND is_active = true`,
    [phone]
  )
  res.json({ found: (result.rowCount ?? 0) > 0, kelidId: result.rows[0]?.kelid_id })
})

export default router
