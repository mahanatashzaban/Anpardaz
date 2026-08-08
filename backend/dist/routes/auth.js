"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Generate a random N-digit numeric code (secure)
function randomCode(digits = 5) {
    const crypto = require('crypto');
    let code = '';
    for (let i = 0; i < digits; i++) {
        const randomDigit = crypto.randomInt(0, 10);
        code += randomDigit.toString();
    }
    return code;
}
// Send OTP via Kavenegar Verify Lookup API
async function sendSms(phone, code) {
    const apiKey = process.env.SMS_API_KEY;
    if (!apiKey) {
        console.log(`[DEV] OTP for ${phone}: ${code}`);
        return;
    }
    const template = process.env.KAVENEGAR_TEMPLATE || 'template';
    try {
        const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;
        const body = new URLSearchParams({ receptor: phone, token: code, template });
        const res = await fetch(url, { method: 'POST', body });
        const json = await res.json();
        if (json.return?.status !== 200) {
            console.error('[Kavenegar] Error:', json.return?.message);
        }
        else {
            console.log('[Kavenegar] SMS sent successfully to:', phone);
        }
    }
    catch (err) {
        console.error('[Kavenegar] Request failed:', err);
    }
}
// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone || !/^09\d{9}$/.test(phone)) {
        res.status(400).json({ error: 'invalid_phone' });
        return;
    }
    const code = randomCode(5);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await db_1.db.query(`INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1, $2, $3)`, [phone, code, expiresAt]);
    await sendSms(phone, code);
    res.json({ sent: true });
});
// POST /api/auth/verify-otp - NO BYPASS CODE
router.post('/verify-otp', async (req, res) => {
    const { phone, code } = req.body;
    if (!phone || !code) {
        res.status(400).json({ error: 'missing_fields' });
        return;
    }
    // NO BYPASS CODE - Production security
    const result = await db_1.db.query(`SELECT id FROM otp_codes
     WHERE phone = $1 AND code = $2 AND used = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`, [phone, code]);
    if (result.rowCount === 0) {
        res.status(401).json({ error: 'invalid_code' });
        return;
    }
    await db_1.db.query(`UPDATE otp_codes SET used = true WHERE id = $1`, [result.rows[0].id]);
    // Upsert user
    const upsert = await db_1.db.query(`INSERT INTO users (phone) VALUES ($1)
     ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
     RETURNING id, phone, full_name, kelid_id`, [phone]);
    const user = upsert.rows[0];
    const token = jsonwebtoken_1.default.sign({ userId: user.id, phone: user.phone }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '30d' });
    res.json({ token, user });
});
exports.default = router;
