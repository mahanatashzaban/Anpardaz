# Kelid Backend API

## Quick Start on VPS (192.168.1.150)

```bash
# 1. Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install dependencies
cd /path/to/kelid/backend
npm install

# 3. Create and configure environment
cp .env.example .env
nano .env   # fill in DATABASE_URL, JWT_SECRET, etc.

# 4. Create the database
sudo -u postgres createdb kelid
npm run db:init

# 5. Start (development)
npm run dev

# 5b. Start (production with PM2)
npm install -g pm2
npm run build
pm2 start dist/server.js --name kelid-api
pm2 save && pm2 startup
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/send-otp | - | Send OTP to phone |
| POST | /api/auth/verify-otp | - | Verify OTP, get JWT |
| GET | /api/price/usdt | - | Live USDT/Rial price |
| GET | /api/wallet/balance | ✓ | Rial + USDT balances |
| GET | /api/wallet/cards | ✓ | List bank cards |
| POST | /api/wallet/cards | ✓ | Add bank card |
| POST | /api/wallet/deposit/usdt | ✓ | Report USDT deposit |
| GET | /api/transactions | ✓ | Transaction history |
| POST | /api/transfer | ✓ | Transfer/swap funds |
| GET | /api/users/lookup | ✓ | Check if phone is Kelid user |
| GET | /api/telecom/packages | ✓ | List telecom packages |
| POST | /api/telecom/internet | ✓ | Buy internet package |
| POST | /api/telecom/charge | ✓ | Buy phone credit |
| GET | /health | - | Health check |

## Fee Structure

- **Commission**: 0.3% on all transactions (configurable via COMMISSION_RATE)
- **TRC20 Network fee**: 1 USDT for external crypto withdrawals (configurable via NETWORK_FEE_USDT)

## Development OTP Bypass

In `NODE_ENV !== 'production'`, code `12345` is accepted for any phone number.

## USDT Price Sources

1. **Nobitex** (primary): `api.nobitex.ir`
2. **Wallex** (fallback): `api.wallex.ir`
3. Price is cached 30 seconds to avoid rate limits.

## Wallet Address Note

The configured wallet address `0x39d8d946d1b9698ca166b21d805ee94f969a188d` uses ERC-20 format.  
TRC-20 addresses start with `T`. Verify the correct address for your chosen network before going live.
