"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
let cached = null;
const CACHE_MS = 30000; // 30 seconds
async function fetchFromNobitex() {
    try {
        const r = await (0, node_fetch_1.default)('https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls', { headers: { 'User-Agent': 'kelid-app/1.0' }, timeout: 5000 });
        const d = await r.json();
        const raw = d?.stats?.['usdt-rls']?.lastTradePrice;
        if (raw)
            return Math.round(parseFloat(raw));
    }
    catch { }
    return null;
}
async function fetchFromWallex() {
    try {
        const r = await (0, node_fetch_1.default)('https://api.wallex.ir/v1/markets', { timeout: 5000 });
        const d = await r.json();
        // Wallex returns USDTTMN market (Toman); multiply by 10 for Rials
        const market = d?.result?.symbols?.USDTTMN;
        if (market?.stats?.lastPrice) {
            return Math.round(parseFloat(market.stats.lastPrice) * 10);
        }
    }
    catch { }
    return null;
}
// GET /api/price/usdt
router.get('/usdt', async (_req, res) => {
    const now = Date.now();
    if (cached && now - cached.ts < CACHE_MS) {
        res.json({ price: cached.price, source: 'cache' });
        return;
    }
    let price = await fetchFromNobitex();
    let source = 'nobitex';
    if (!price) {
        price = await fetchFromWallex();
        source = 'wallex';
    }
    if (price) {
        cached = { price, ts: now };
        // Persist to DB for audit trail
        db_1.db.query(`INSERT INTO price_cache (symbol, price, source) VALUES ('usdt_rial', $1, $2)`, [price, source]).catch(() => { });
        res.json({ price, source });
    }
    else {
        // Return last cached value from DB if live fetch fails
        const row = await db_1.db.query(`SELECT price, source FROM price_cache WHERE symbol = 'usdt_rial' ORDER BY fetched_at DESC LIMIT 1`);
        if (row.rowCount && row.rowCount > 0) {
            res.json({ price: row.rows[0].price, source: row.rows[0].source + '_stale' });
        }
        else {
            res.status(503).json({ error: 'price_unavailable' });
        }
    }
});
exports.default = router;
