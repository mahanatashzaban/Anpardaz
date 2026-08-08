"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/wallet/balance
router.get('/balance', auth_1.requireAuth, async (req, res) => {
    const result = await db_1.db.query(`SELECT rial_balance, usdt_balance FROM wallets WHERE user_id = $1`, [req.userId]);
    if (result.rowCount === 0) {
        res.json({ rial_balance: 0, usdt_balance: '0.000000' });
        return;
    }
    res.json(result.rows[0]);
});
// GET /api/wallet/cards
router.get('/cards', auth_1.requireAuth, async (req, res) => {
    const result = await db_1.db.query(`SELECT id, card_number, card_holder, created_at FROM bank_cards WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC`, [req.userId]);
    res.json({ cards: result.rows });
});
// POST /api/wallet/cards
router.post('/cards', auth_1.requireAuth, async (req, res) => {
    const { card_number, card_holder } = req.body;
    if (!card_number) {
        res.status(400).json({ error: 'card_number_required' });
        return;
    }
    const clean = card_number.replace(/\D/g, '');
    if (clean.length !== 16) {
        res.status(400).json({ error: 'invalid_card_number' });
        return;
    }
    const result = await db_1.db.query(`INSERT INTO bank_cards (user_id, card_number, card_holder) VALUES ($1, $2, $3) RETURNING id`, [req.userId, clean, card_holder || '']);
    res.json({ success: true, id: result.rows[0].id });
});
// POST /api/wallet/deposit/usdt
// Called after user sends USDT to the app wallet — mark pending deposit
router.post('/deposit/usdt', auth_1.requireAuth, async (req, res) => {
    const { tx_hash, amount } = req.body;
    if (!tx_hash || !amount || amount <= 0) {
        res.status(400).json({ error: 'invalid_params' });
        return;
    }
    // In production: verify tx_hash on the blockchain before crediting
    // For now we record it as 'pending' and admin confirms it
    await db_1.db.query(`INSERT INTO transactions (user_id, type, direction, currency, amount, dest_address, tx_hash, status)
     VALUES ($1, 'deposit_usdt', 'in', 'usdt', $2, $3, $4, 'pending')`, [req.userId, amount, process.env.APP_WALLET_ADDRESS, tx_hash]);
    res.json({ success: true, status: 'pending', message: 'deposit recorded — pending confirmation' });
});
exports.default = router;
