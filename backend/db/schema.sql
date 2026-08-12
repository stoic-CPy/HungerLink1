-- HungerLink schema
-- Run this once against a fresh PostgreSQL database (or via `npm run migrate`,
-- which just executes this file idempotently using IF NOT EXISTS guards).

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(10)  NOT NULL CHECK (role IN ('donor', 'ngo')),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donor_profiles (
  user_id             INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_name   VARCHAR(255) NOT NULL,
  owner_name          VARCHAR(255) NOT NULL,
  phone               VARCHAR(20)  NOT NULL,
  address             TEXT         NOT NULL,
  city                VARCHAR(120),
  state               VARCHAR(120),
  pincode             VARCHAR(10),
  business_type       VARCHAR(60)  NOT NULL DEFAULT 'Restaurant / Hotel',
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ngo_profiles (
  user_id             INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_name   VARCHAR(255) NOT NULL,
  owner_name          VARCHAR(255) NOT NULL,
  phone               VARCHAR(20)  NOT NULL,
  address             TEXT         NOT NULL,
  city                VARCHAR(120),
  state               VARCHAR(120),
  pincode             VARCHAR(10),
  establishment_year  VARCHAR(4),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS donations (
  id                  SERIAL PRIMARY KEY,
  donor_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_name     VARCHAR(255) NOT NULL,
  food_name           VARCHAR(255) NOT NULL,
  quantity            VARCHAR(120) NOT NULL,
  donation_date       TIMESTAMPTZ  NOT NULL,
  pickup_address      TEXT         NOT NULL,
  status              VARCHAR(20)  NOT NULL DEFAULT 'Pending'
                        CHECK (status IN ('Pending', 'Accepted', 'Completed', 'Cancelled')),
  accepted_by_ngo_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_accepted_by ON donations(accepted_by_ngo_id);
