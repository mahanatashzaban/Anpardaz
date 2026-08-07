import { Router, Request, Response } from 'express'
import fetch from 'node-fetch'
import { db } from '../db'

const router = Router()

let cached: { price: number; ts: number } | null = null
const CACHE_MS = 30_000 // 30 seconds

async function fetchFromNobitex(): Promise<number | null> {
  try {
    const r = await fetch(
      'https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls',
      { headers: { 'User-Agent': 'kelid-app/1.0' }, timeout: 5000 } as any
    )
    const d: any = await r.json()
    const raw = d?.stats?.['usdt-rls']?.lastTradePrice
    if (raw) return Math.round(parseFloat(raw))
  } catch {}
  return null
}

async function fetchFromWallex(): Promise<number | null> {
  try {
    const r = await fetch('https://api.wallex.ir/v1/markets', { timeout: 5000 } as any)
    const d: any = await r.json()
    // Wallex returns USDTTMN market (Toman); multiply by 10 for Rials
    const market = d?.result?.symbols?.USDTTMN
    if (market?.stats?.lastPrice) {
      return Math.round(parseFloat(market.stats.lastPrice) * 10)
    }
  } catch {}
  return null
}

// GET /api/price/usdt
router.get('/usdt', async (_req: Request, res: Response) => {
  const now = Date.now()

  if (cached && now - cached.ts < CACHE_MS) {
    res.json({ price: cached.price, source: 'cache' })
    return
  }

  let price = await fetchFromNobitex()
  let source = 'nobitex'

  if (!price) {
    price = await fetchFromWallex()
    source = 'wallex'
  }

  if (price) {
    cached = { price, ts: now }
    // Persist to DB for audit trail
    db.query(
      `INSERT INTO price_cache (symbol, price, source) VALUES ('usdt_rial', $1, $2)`,
      [price, source]
    ).catch(() => {})
    res.json({ price, source })
  } else {
    // Return last cached value from DB if live fetch fails
    const row = await db.query(
      `SELECT price, source FROM price_cache WHERE symbol = 'usdt_rial' ORDER BY fetched_at DESC LIMIT 1`
    )
    if (row.rowCount && row.rowCount > 0) {
      res.json({ price: row.rows[0].price, source: row.rows[0].source + '_stale' })
    } else {
      res.status(503).json({ error: 'price_unavailable' })
    }
  }
})

export default router
