CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE cases (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  user_type           TEXT,
  decedent_name       TEXT NOT NULL,
  date_of_death       DATE,
  state_of_domicile   TEXT DEFAULT 'FL',
  died_in_florida     BOOLEAN,
  marital_status      TEXT,
  spouse_name         TEXT,
  has_will            TEXT,
  will_located        TEXT,
  heirs_in_agreement  TEXT,
  assets              JSONB,
  pre_death_transfers TEXT,
  complexity_flags    JSONB,
  intake_completed_at TIMESTAMPTZ,
  assistant_turns_used INTEGER DEFAULT 0,
  assistant_cap        INTEGER DEFAULT 50
);

CREATE TABLE heirs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id      UUID REFERENCES cases(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  relationship TEXT,
  residence    TEXT
);

CREATE TABLE documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id        UUID REFERENCES cases(id) ON DELETE CASCADE,
  uploaded_at    TIMESTAMPTZ DEFAULT NOW(),
  filename       TEXT,
  file_path      TEXT,
  file_type      TEXT,
  ocr_text       TEXT,
  document_type  TEXT,
  extracted_date DATE,
  notes          TEXT
);

CREATE TABLE timeline_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     UUID REFERENCES cases(id) ON DELETE CASCADE,
  event_at    TIMESTAMPTZ DEFAULT NOW(),
  event_type  TEXT,
  label       TEXT,
  document_id UUID REFERENCES documents(id)
);
