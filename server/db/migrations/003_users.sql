CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                  TEXT UNIQUE NOT NULL,
  password_hash          TEXT NOT NULL,
  first_name             TEXT NOT NULL,
  role                   TEXT NOT NULL CHECK (role IN ('heir', 'lawyer', 'advisor')),
  country                TEXT NOT NULL DEFAULT 'US',
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  last_login             TIMESTAMPTZ,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  tier                   TEXT DEFAULT 'none' CHECK (tier IN ('none', 'consumer', 'professional')),
  early_access           BOOLEAN DEFAULT TRUE
);

-- Add user_id FK to cases so cases can be scoped to a user after signup
ALTER TABLE cases ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Mark handoff_package_included on cases
ALTER TABLE cases ADD COLUMN IF NOT EXISTS handoff_package_included BOOLEAN DEFAULT FALSE;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE cases ADD COLUMN IF NOT EXISTS plan TEXT;
