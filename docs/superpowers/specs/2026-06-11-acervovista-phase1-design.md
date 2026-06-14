# AcervoVista — Phase 1 (Session 1) Design Spec

## Overview

AcervoVista is a document intelligence platform for heirs and families navigating
complex estate successions. Session 1 delivers a working proof of concept covering
three pieces: an intake flow, document upload + OCR, and a gap map / timeline.
Local-only, no auth, no payments, no AI assistant, no lawyer referral logic.

## Tech Stack

- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL (via `pg`, no ORM)
- OCR: Google Cloud Vision API (credentials already present at
  `credentials/google-vision-key.json`)
- Runtime: Node 20+
- Dev servers: Vite (5173), Express (3001)
- Deployment: local only for Session 1

## Folder Structure

```
acervovista/
├── client/          ← React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/          ← Express backend
│   ├── routes/
│   ├── db/
│   │   └── schema.sql
│   ├── uploads/     ← stored uploaded files (local)
│   └── index.js
├── .env.example
└── package.json (root — workspace)
```

## Phase 1 Scope

### Thing 1 — Intake Flow

Multi-step form, one question at a time, warm human tone. Steps in order:

1. **Who are you?** "Family member or heir" / "I'm here professionally".
   If professional → show: "Professional access requires credential
   verification. We'll set that up. For now, let's start with the basics."
   then continue with the same steps.
2. **Who passed away?** Full name (required), date of death (required),
   state of domicile at death (required, dropdown of US states, Florida
   pre-selected), "Did they pass away in Florida?" (yes/no).
3. **Marital status?** Married / Widowed / Divorced / Never married.
   If Married → "What is the surviving spouse's full name?"
4. **Did they leave a will?** Yes / No / I don't know.
   If Yes → "Has the will been located?" (Yes / No / Not sure)
5. **Who are the heirs?** Repeating field: full name, relationship to
   decedent, state/country of residence. At least 1 required.
   "Are all heirs in agreement about the estate?" (Yes / No / It's complicated)
6. **Known assets** — multi-select checkboxes: Real property in Florida,
   Real property outside Florida, Bank accounts, Investment/brokerage
   accounts, Life insurance, Retirement accounts (IRA/401k), Business
   interests, Assets in another country, Vehicles, Personal property.
   "Were there any significant asset transfers or gifts in the 2 years
   before the death?" (Yes / No / Not sure)
7. **Case summary display** — card layout built from answers. Sections:
   Decedent, Heirs, Assets, Complexity indicators (plain language only).
   Ends with: "Your case file is started. The next step is to begin
   uploading documents." [Button: Start uploading]

### Thing 2 — Document Upload + OCR

On the case file page, a document upload section.

- Accept: jpg, jpeg, png, pdf, up to 20MB per file.
- On upload:
  - Store the file in `/server/uploads/` (local for now).
  - Send to Google Cloud Vision API for OCR text extraction.
  - Display extracted text in a "What we read" panel.
  - Store raw OCR text in the DB with the file reference.
  - Classify document type via keyword matching against OCR text. Types:
    `death_certificate`, `will`, `deed`, `bank_statement`,
    `corporate_record`, `insurance_policy`, `transfer_deed`,
    `letters_testamentary`, `court_filing`, `unknown`.
  - Display detected type as a badge on the document card.
  - Add an entry to the case timeline with the date extracted from OCR
    (if found).

### Thing 3 — Gap Map + Timeline

**Gap map** — based on intake answers, shows required documents.

- Florida testate case required list: Death certificate (certified copies),
  Original will, Letters Testamentary, Notice to Creditors (publication),
  Inventory of Estate, Final Accounting, Petition for Discharge.
- Florida intestate case: replace "Original will" with "Proof of heirship /
  Affidavit of Heirs".
- Status per document:
  - GREEN = uploaded and classified correctly
  - GOLD = pending — not yet uploaded
  - RED = missing and critical (>14 days since case opened)
- Each item shows: document name, why it matters (1 sentence), where to
  get it (1 sentence). Plain language.

**Timeline** — vertical, newest at top. Events: case opened, each document
uploaded (with type), any date extracted from a document (e.g. date of
death, transfer date). No legal conclusions in labels.

## Database Schema (`server/db/schema.sql`)

```sql
cases
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  created_at      TIMESTAMPTZ DEFAULT NOW()
  user_type       TEXT  -- 'consumer' or 'professional'
  decedent_name   TEXT NOT NULL
  date_of_death   DATE
  state_of_domicile TEXT DEFAULT 'FL'
  marital_status  TEXT
  has_will        TEXT  -- 'yes', 'no', 'unknown'
  will_located    TEXT  -- 'yes', 'no', 'unknown'
  heirs_in_agreement TEXT  -- 'yes', 'no', 'complicated'
  assets          JSONB  -- array of asset type strings
  pre_death_transfers TEXT  -- 'yes', 'no', 'unknown'
  complexity_flags JSONB  -- internal flags set by rules engine
  intake_completed_at TIMESTAMPTZ

heirs
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  case_id         UUID REFERENCES cases(id) ON DELETE CASCADE
  full_name       TEXT NOT NULL
  relationship    TEXT
  residence       TEXT  -- state or country

documents
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  case_id         UUID REFERENCES cases(id) ON DELETE CASCADE
  uploaded_at     TIMESTAMPTZ DEFAULT NOW()
  filename        TEXT
  file_path       TEXT
  file_type       TEXT  -- mime type
  ocr_text        TEXT
  document_type   TEXT  -- classified type
  extracted_date  DATE  -- date pulled from OCR if found
  notes           TEXT

timeline_events
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
  case_id         UUID REFERENCES cases(id) ON DELETE CASCADE
  event_at        TIMESTAMPTZ DEFAULT NOW()
  event_type      TEXT  -- 'case_opened', 'document_uploaded', 'date_extracted'
  label           TEXT  -- plain language label
  document_id     UUID REFERENCES documents(id)
```

## Complexity Flags (backend only)

After intake is saved, the backend computes `complexity_flags` (JSONB):

- `CROSS_BORDER` → assets include 'Real property outside Florida' OR
  'Assets in another country' OR any heir has residence outside USA
- `CONTESTED` → `heirs_in_agreement` = 'no' or 'complicated'
- `PRE_DEATH_XFER` → `pre_death_transfers` = 'yes'
- `BUSINESS` → assets include 'Business interests'
- `INTESTATE` → `has_will` = 'no' or 'unknown'
- `MULTI_HEIR` → more than 2 heirs

These flags drive the gap map and the plain-language complexity summary on
the case summary page:

- `CROSS_BORDER` → "This estate involves assets or parties in more than one
  jurisdiction. A lawyer with cross-border experience is recommended."
- `CONTESTED` → "You've indicated not all heirs are in agreement. We
  recommend speaking with a lawyer before taking any steps."
- `PRE_DEATH_XFER` → "You mentioned transfers made before the death. These
  are worth noting and a lawyer will want to review them."
- `BUSINESS` → "Business interests add complexity. A lawyer and possibly a
  business valuator will be needed."
- `INTESTATE` and `MULTI_HEIR` drive the gap map only — no consumer-facing
  summary copy is defined for them in Phase 1.

## Environment Variables (`.env.example`)

```
DATABASE_URL=postgresql://localhost:5432/acervovista
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-key.json
PORT=3001
CLIENT_URL=http://localhost:5173
```

## Design Constraints

**Colors** are registered as design tokens in `tokens.json` (DTCG format,
managed by ui-tokenize) and consumed in `client/tailwind.config.js` as named
theme colors. Components must reference these names — no raw color literals:

| Token name   | Role               |
|--------------|--------------------|
| color.navy   | primary            |
| color.red    | accents, alerts    |
| color.ink    | body text          |
| color.green  | gap map — present  |
| color.gold   | gap map — pending  |
| color.white  | backgrounds        |
| color.gray   | card backgrounds   |

**Typography:**
- Headings: font-serif (Playfair Display via CDN, fallback serif)
- Body: font-sans (Inter or system-ui)

**Tone:**
- Warm. One question at a time in the intake.
- Never use the word "flag" in user-facing text.
- Never use legal jargon without a plain-language explanation beside it.
- Never say "your case has been filed" or anything implying legal action.

## Out of Scope for Phase 1

- Authentication / login (use a case ID stored in localStorage)
- Payment flow
- Email sending
- AI assistant
- Lawyer referral UI (placeholder text only: "Lawyer referrals coming soon")

## Session 1 Deliverable / Acceptance Criteria

1. Open http://localhost:5173 in a browser
2. Complete the 7-step intake for a Florida testate estate
3. See a case summary with complexity indicators in plain language
4. Upload a photo of a document and see the OCR text extracted
5. See the document classified and added to the timeline
6. See the gap map showing required documents for a Florida testate case
   with green/gold/red status based on what has been uploaded

## Build Order

1. Folder structure + workspace setup
2. `schema.sql` (run against local Postgres — user has DB access or will
   run it)
3. Intake flow (Thing 1) — all 7 steps end to end
4. Document upload + OCR (Thing 2)
5. Gap map + timeline (Thing 3)

After each of the three things, pause for the user to verify in the browser
before moving on.
