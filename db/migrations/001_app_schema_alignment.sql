-- Safe, additive alignment for fields already used by the application.
-- Review the target database and take a backup before applying in production.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS brand_voice TEXT;

ALTER TABLE social_accounts
  ADD COLUMN IF NOT EXISTS config JSONB;

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS content_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'IT',
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_templates_org_name
  ON content_templates (organization_id, name);

CREATE INDEX IF NOT EXISTS idx_social_accounts_org
  ON social_accounts (organization_id);
