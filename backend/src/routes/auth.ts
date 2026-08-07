import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db'

const router = Router()

// Generate a random N-digit numeric code
function randomCode(digits = 5): string {
  return Array.from({ length: digits }, () => Math.floor(Math.random() * 10)).join('')
}

// Send OTP via Kavenegar Verify Lookup API
async function sendSms(phone: string, code: string) {
  const apiKey = process.env.SMS_API_KEY
  if (!apiKey) {
    console.log(`[DEV] OTP for ${phone}: ${code}`)
    return
  }
  const template = process.env.KAVENEGAR_TEMPLATE || 'anpardaz-otp'
  try {
    const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`
    const body = new URLSearchParams({ receptor: phone, token: code, template })
    const res = await fetch(url, { method: 'POST', body })
    const json = await res.json() as { return?: { status: number; message: string } }
    if (json.return?.status !== 200) {
      console.error('[Kavenegar] Error:', json.return?.message)
    }
  } catch (err) {
    console.error('[Kavenegar] Request failed:', err)
  }
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body as { phone?: string }
  if (!phone || !/^09\d{9}$/.test(phone)) {
    res.status(400).json({ error: 'invalid_phone' })
    return
  }

  const code = randomCode(5)
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes

  await db.query(
    `INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1, $2, $3)`,
    [phone, code, expiresAt]
  )

  await sendSms(phone, code)
  res.json({ sent: true })
})

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, code } = req.body as { phone?: string; code?: string }
  if (!phone || !code) {
    res.status(400).json({ error: 'missing_fields' })
    return
  }

  // In development, accept '12345' as a bypass code
  const isDev = process.env.NODE_ENV !== 'production'
  const isBypass = isDev && code === '12345'

  if (!isBypass) {
    const result = await db.query(
      `SELECT id FROM otp_codes
       WHERE phone = $1 AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone, code]
    )
    if (result.rowCount === 0) {
      res.status(401).json({ error: 'invalid_code' })
      return
    }
    await db.query(`UPDATE otp_codes SET used = true WHERE id = $1`, [result.rows[0].id])
  }

  // Upsert user
  const upsert = await db.query(
    `INSERT INTO users (phone) VALUES ($1)
     ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
     RETURNING id, phone, full_name, kelid_id`,
    [phone]
  )
  const user = upsert.rows[0]

  const token = jwt.sign(
    { userId: user.id, phone: user.phone },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '30d' }
  )

  res.json({ token, user })
})

export default router
