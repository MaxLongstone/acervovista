-- Migration 002: case_items table + jurisdictions on cases
-- Run after 001 (schema.sql + any column additions from documents route).
--
-- The case_items table is the universal item record. One row per thing
-- the estate knows about: a document, an asset, a debt, an event, a known fact.
-- All four views — gap map, timeline, estimate, dwell page — read from this table.
-- The existing documents table remains the OCR/file store; items link into it.

-- 1. Add jurisdictions array to cases.
--    state_of_domicile stays for backwards compat with existing intake/gap-map code.
--    jurisdictions is auto-populated from doc classification + intake signals.
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS jurisdictions TEXT[] DEFAULT '{}';

-- 2a. Add closed_at to cases for the case switcher.
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

-- 2b. Add columns to documents that exist in code but not in schema.sql (drift fix).
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS classification_layer       TEXT,
  ADD COLUMN IF NOT EXISTS classification_confidence  TEXT,
  ADD COLUMN IF NOT EXISTS document_language          TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS document_jurisdiction      TEXT,
  ADD COLUMN IF NOT EXISTS plain_language_summary     TEXT,
  ADD COLUMN IF NOT EXISTS case_relevance             TEXT,
  ADD COLUMN IF NOT EXISTS document_metadata          JSONB DEFAULT '{}';

-- 3. Create case_items.
CREATE TABLE IF NOT EXISTS case_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  -- Core classification
  item_type   TEXT NOT NULL CHECK (item_type IN ('document', 'event', 'asset', 'debt', 'known_fact')),
  state       TEXT NOT NULL CHECK (state IN ('confirmed', 'pending', 'missing', 'flagged', 'unknown')),
  provenance  TEXT NOT NULL CHECK (provenance IN ('document', 'declared')),

  -- Display fields
  title       TEXT NOT NULL,
  summary     TEXT,

  -- Optional placement on timeline / estimate
  item_date   DATE,             -- surfaces this item on the timeline at this date
  value_cents BIGINT,           -- monetary value in smallest currency unit
  value_currency TEXT DEFAULT 'USD',

  -- Conflict payload — only present when state = 'flagged'
  -- Shape: { declared_account: string, document_account: string }
  conflict    JSONB,

  -- Cross-item links (e.g. asset item links to its deed document item)
  linked_item_ids UUID[] DEFAULT '{}',

  -- Back-reference to the uploaded document that confirmed this item
  -- NULL for declared items or items awaiting a document
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,

  -- Which jurisdiction this item belongs to (e.g. 'Florida', 'Argentina')
  jurisdiction TEXT
);

CREATE INDEX IF NOT EXISTS case_items_case_id_idx ON case_items(case_id);
CREATE INDEX IF NOT EXISTS case_items_state_idx   ON case_items(state);
CREATE INDEX IF NOT EXISTS case_items_type_idx    ON case_items(item_type);

-- Trigger: keep updated_at current automatically
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS case_items_updated_at ON case_items;
CREATE TRIGGER case_items_updated_at
  BEFORE UPDATE ON case_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
