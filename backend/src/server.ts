import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import priceRoutes from './routes/price'
import walletRoutes from './routes/wallet'
import transactionRoutes from './routes/transactions'
import transferRoutes from './routes/transfer'
import telecomRoutes from './routes/telecom'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '3000')

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true,
}))
app.use(express.json())

// Basic request logger
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/price', priceRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/transfer', transferRoutes)
app.use('/api/telecom', telecomRoutes)

// User lookup (used by transfer flow to check if recipient is a Kelid user)
app.get('/api/users/lookup', (req, res, next) => {
  req.url = '/lookup-user?' + new URLSearchParams(req.query as any).toString()
  transferRoutes(req, res, next)
})

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'internal_server_error' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Kelid API running on port ${PORT}`)
  console.log(`App wallet: ${process.env.APP_WALLET_ADDRESS || '(not set)'}`)
})

export default app
