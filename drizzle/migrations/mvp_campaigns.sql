-- Run this once in your Supabase dashboard → SQL Editor
-- (Project → SQL Editor → New query → paste → Run)

CREATE TABLE IF NOT EXISTS mvp_campaigns (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT          NOT NULL UNIQUE,
  title               TEXT          NOT NULL,
  short_description   TEXT,
  story               TEXT          NOT NULL,
  category            TEXT          NOT NULL,   -- Hebrew display label e.g. "רפואי"
  goal_amount         INTEGER       NOT NULL,   -- NIS
  raised_amount       INTEGER       NOT NULL DEFAULT 0,
  donor_count         INTEGER       NOT NULL DEFAULT 0,
  creator_name        TEXT          NOT NULL DEFAULT 'אנונימי',
  gradient_from       TEXT          NOT NULL,   -- hex colour
  gradient_to         TEXT          NOT NULL,   -- hex colour
  hero_image_data_url TEXT,                     -- base64 data URL (MVP)
  is_active           BOOLEAN       NOT NULL DEFAULT true,
  disabled_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE mvp_campaigns
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS mvp_campaigns_is_active_idx
  ON mvp_campaigns (is_active, created_at DESC);

-- Row Level Security: allow public reads and inserts (no auth required for MVP)
ALTER TABLE mvp_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read"
  ON mvp_campaigns FOR SELECT USING (true);

CREATE POLICY "public insert"
  ON mvp_campaigns FOR INSERT WITH CHECK (true);
