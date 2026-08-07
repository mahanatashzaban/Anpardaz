-- ─── Kelid App Database Schema ─────────────────────────────────────────────
-- Run this once against your PostgreSQL database:
--   psql -U postgres -d kelid -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  phone        VARCHAR(15) UNIQUE NOT NULL,
  full_name    VARCHAR(100),
  kelid_id     VARCHAR(20) UNIQUE,   -- e.g. KELID-482-913-6
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- OTP verification codes
CREATE TABLE IF NOT EXISTS otp_codes (
  id           SERIAL PRIMARY KEY,
  phone        VARCHAR(15) NOT NULL,
  code         VARCHAR(6) NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  used         BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);

-- Sessions (JWT is stateless but we track active sessions for logout)
CREATE TABLE IF NOT EXISTS sessions (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash   VARCHAR(255) UNIQUE NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Wallets (one per user)
CREATE TABLE IF NOT EXISTS wallets (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  rial_balance  BIGINT DEFAULT 0 CHECK (rial_balance >= 0),   -- stored in Rials
  usdt_balance  NUMERIC(20, 6) DEFAULT 0 CHECK (usdt_balance >= 0),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Bank cards registered by users
CREATE TABLE IF NOT EXISTS bank_cards (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  card_number   VARCHAR(20) NOT NULL,
  card_holder   VARCHAR(100),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (all financial movements)
CREATE TABLE IF NOT EXISTS transactions (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER REFERENCES users(id),
  counterpart_user_id INTEGER REFERENCES users(id),   -- for peer-to-peer
  type                VARCHAR(40) NOT NULL,
    -- 'deposit_usdt' | 'deposit_rial' | 'withdraw_usdt' | 'withdraw_rial'
    -- | 'transfer_rial' | 'transfer_usdt' | 'swap_rial_usdt' | 'swap_usdt_rial'
    -- | 'bill_payment' | 'telecom_charge' | 'telecom_internet'
  direction           VARCHAR(3) NOT NULL CHECK (direction IN ('in', 'out')),
  currency            VARCHAR(10) NOT NULL CHECK (currency IN ('rial', 'usdt')),
  amount              NUMERIC(20, 6) NOT NULL CHECK (amount > 0),
  commission_rate     NUMERIC(6, 4) DEFAULT 0.003,    -- 0.3%
  commission_amount   NUMERIC(20, 6) DEFAULT 0,
  network_fee_usdt    NUMERIC(20, 6) DEFAULT 0,       -- TRC20 network fee
  dest_type           VARCHAR(20),                    -- 'kelid' | 'card' | 'crypto'
  dest_address        VARCHAR(200),                   -- phone / card / crypto address
  dest_currency       VARCHAR(10),                    -- currency received at destination
  dest_amount         NUMERIC(20, 6),
  usdt_price_rial     BIGINT,                         -- snapshot of USDT/Rial at time of tx
  payment_id          VARCHAR(20),                    -- random 7-digit ID for peer transfers
  tx_hash             VARCHAR(120),                   -- blockchain tx hash if applicable
  status              VARCHAR(20) DEFAULT 'completed'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(status);

-- Telecom orders
CREATE TABLE IF NOT EXISTS telecom_orders (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id),
  target_phone VARCHAR(15) NOT NULL,
  operator     VARCHAR(20),   -- 'mtn' | 'mci' | 'rightel'
  package_id   VARCHAR(50),
  order_type   VARCHAR(20),   -- 'charge' | 'internet'
  amount_rial  BIGINT,
  status       VARCHAR(20) DEFAULT 'pending',
  ref_code     VARCHAR(50),   -- operator reference
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- USDT price cache (updated by backend cron every 30s)
CREATE TABLE IF NOT EXISTS price_cache (
  id           SERIAL PRIMARY KEY,
  symbol       VARCHAR(20) NOT NULL,   -- 'usdt_rial'
  price        BIGINT NOT NULL,        -- in Rials
  source       VARCHAR(30),            -- 'nobitex' | 'wallex'
  fetched_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Triggers ────────────────────────────────────────────────────────────────

-- Auto-create wallet when user is created
CREATE OR REPLACE FUNCTION create_wallet_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_wallet ON users;
CREATE TRIGGER trg_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_wallet_for_user();

-- Auto-generate kelid_id for new users
CREATE OR REPLACE FUNCTION generate_kelid_id()
RETURNS TRIGGER AS $$
DECLARE
  new_id VARCHAR(20);
BEGIN
  LOOP
    new_id := 'KELID-' ||
      LPAD((FLOOR(RANDOM() * 900 + 100))::TEXT, 3, '0') || '-' ||
      LPAD((FLOOR(RANDOM() * 900 + 100))::TEXT, 3, '0') || '-' ||
      FLOOR(RANDOM() * 10)::TEXT;
    BEGIN
      UPDATE users SET kelid_id = new_id WHERE id = NEW.id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- retry
    END;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kelid_id ON users;
CREATE TRIGGER trg_kelid_id
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION generate_kelid_id();
