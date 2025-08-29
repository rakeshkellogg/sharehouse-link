-- Add columns for India-specific location and pricing system
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS price_rupees BIGINT,
  ADD COLUMN IF NOT EXISTS price_amount_raw NUMERIC,
  ADD COLUMN IF NOT EXISTS price_unit TEXT,
  ADD COLUMN IF NOT EXISTS size_amount_raw NUMERIC,
  ADD COLUMN IF NOT EXISTS size_scale TEXT,
  ADD COLUMN IF NOT EXISTS size_unit TEXT,
  ADD COLUMN IF NOT EXISTS size_value_canonical NUMERIC,
  ADD COLUMN IF NOT EXISTS place_id TEXT;

-- Add pincode format constraint (6 digits, cannot start with 0)
ALTER TABLE listings
  ADD CONSTRAINT IF NOT EXISTS chk_pincode_format
  CHECK (pincode ~ '^[1-9][0-9]{5}$');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_pincode ON listings (pincode);
CREATE INDEX IF NOT EXISTS idx_listings_city_state ON listings (city, state);
CREATE INDEX IF NOT EXISTS idx_listings_price_rupees ON listings (price_rupees);
CREATE INDEX IF NOT EXISTS idx_listings_size_unit_value ON listings (size_unit, size_value_canonical);

-- Create pincode cache table for auto-fill functionality
CREATE TABLE IF NOT EXISTS pincode_cache (
  pincode   TEXT PRIMARY KEY,
  city      TEXT NOT NULL,
  state     TEXT NOT NULL,
  lat       NUMERIC NULL,
  lng       NUMERIC NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);