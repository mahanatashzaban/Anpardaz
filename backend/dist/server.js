"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const price_1 = __importDefault(require("./routes/price"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const transfer_1 = __importDefault(require("./routes/transfer"));
const telecom_1 = __importDefault(require("./routes/telecom"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000');
// ─── Middleware ───────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGIN || '*',
    credentials: true,
}));
app.use(express_1.default.json());
// Basic request logger
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_1.default);
app.use('/api/price', price_1.default);
app.use('/api/wallet', wallet_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/transfer', transfer_1.default);
app.use('/api/telecom', telecom_1.default);
// User lookup (used by transfer flow to check if recipient is a Kelid user)
app.get('/api/users/lookup', (req, res, next) => {
    req.url = '/lookup-user?' + new URLSearchParams(req.query).toString();
    (0, transfer_1.default)(req, res, next);
});
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
});
// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'internal_server_error' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kelid API running on port ${PORT}`);
    console.log(`App wallet: ${process.env.APP_WALLET_ADDRESS || '(not set)'}`);
});
exports.default = app;
