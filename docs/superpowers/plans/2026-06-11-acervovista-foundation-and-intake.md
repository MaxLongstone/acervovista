# AcervoVista Foundation + Intake Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the AcervoVista workspace (client + server + Postgres schema) and deliver Thing 1 — the 7-step intake flow ending in a case summary card with backend-computed complexity flags.

**Architecture:** npm workspaces root (`client/`, `server/`). Express + `pg` (raw SQL, transactional multi-table inserts) backend exposes `/api/cases`. React 18 + Vite + Tailwind frontend renders a step-machine intake flow that posts to that endpoint and then renders a case summary from the response. Tailwind theme colors are sourced from `tokens.json` (DTCG, ui-tokenize-managed) rather than raw hex.

**Tech Stack:** Node 20+, Express, pg, PostgreSQL (pgcrypto for `gen_random_uuid()`), React 18, Vite, Tailwind CSS, Google Fonts (Inter, Playfair Display). Node's built-in test runner (`node --test`, `node:assert/strict`) for backend unit tests. No ORM, no dotenv (use `--env-file`).

**Testing approach:** The complexity rules engine (`server/lib/complexity.js`) is pure and gets full unit test coverage via `node --test` (TDD: write tests first). The cases API route is verified via curl against a running server + local Postgres. The full intake flow is verified manually in the browser (Task 15), since this is a UI-heavy flow with no existing test harness specified by the user.

---

## File Structure

```
acervovista/
├── package.json                  (root workspace)
├── .gitignore
├── .env.example
├── .env                          (gitignored, local secrets)
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api.js
│       ├── usStates.js
│       ├── intakeOptions.js
│       ├── complexityMessages.js
│       ├── components/
│       │   ├── intake/
│       │   │   ├── StepShell.jsx
│       │   │   ├── StepWhoAreYou.jsx
│       │   │   ├── StepDecedent.jsx
│       │   │   ├── StepMaritalStatus.jsx
│       │   │   ├── StepWill.jsx
│       │   │   ├── StepHeirs.jsx
│       │   │   └── StepAssets.jsx
│       │   └── casefile/
│       │       └── CaseSummaryCard.jsx
│       └── pages/
│           ├── IntakePage.jsx
│           └── CaseFilePage.jsx
└── server/
    ├── package.json
    ├── index.js
    ├── db/
    │   ├── pool.js
    │   └── schema.sql
    ├── lib/
    │   ├── usStates.js
    │   ├── complexity.js
    │   └── complexity.test.js
    └── routes/
        └── cases.js
```

---

### Task 1: Workspace scaffolding, env, git

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `.env`

- [ ] **Step 1: Create the root workspace `package.json`**

```json
{
  "name": "acervovista",
  "private": true,
  "type": "module",
  "workspaces": [
    "client",
    "server"
  ]
}
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
.env
server/uploads/*
!server/uploads/.gitkeep
client/dist/
.tokenize/catalog.json
```

- [ ] **Step 3: Create `.env.example`**

```
DATABASE_URL=postgresql://localhost:5432/acervovista
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-key.json
PORT=3001
CLIENT_URL=http://localhost:5173
```

- [ ] **Step 4: Create `.env` (local, gitignored)**

Copy `.env.example` to `.env`, adjusting `DATABASE_URL` to point at a local Postgres database named `acervovista` (create the database first if it doesn't exist: `createdb acervovista`).

```
DATABASE_URL=postgresql://localhost:5432/acervovista
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-vision-key.json
PORT=3001
CLIENT_URL=http://localhost:5173
```

- [ ] **Step 5: Initialize git and commit**

```bash
git init
git add package.json .gitignore .env.example
git commit -m "chore: scaffold workspace root"
```

Note: `.env` is gitignored and will not be committed.

---

### Task 2: Database schema

**Files:**
- Create: `server/db/schema.sql`

- [ ] **Step 1: Write the schema**

```sql
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
  intake_completed_at TIMESTAMPTZ
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
```

- [ ] **Step 2: Apply the schema to the local database**

```bash
psql "$DATABASE_URL" -f server/db/schema.sql
```

Expected: `CREATE EXTENSION`, `CREATE TABLE` x4 printed, no errors. (If `psql` isn't on PATH or `$DATABASE_URL` isn't exported in your shell, run `export $(grep -v '^#' .env | xargs)` first, or pass the connection string directly, e.g. `psql postgresql://localhost:5432/acervovista -f server/db/schema.sql`.)

- [ ] **Step 3: Commit**

```bash
git add server/db/schema.sql
git commit -m "feat: add database schema"
```

---

### Task 3: Server scaffold

**Files:**
- Create: `server/package.json`
- Create: `server/db/pool.js`
- Create: `server/index.js`

- [ ] **Step 1: Create `server/package.json`**

```json
{
  "name": "server",
  "private": true,
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "node --watch --env-file=../.env index.js",
    "test": "node --test"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "pg": "^8.12.0"
  }
}
```

- [ ] **Step 2: Install server dependencies**

```bash
npm install
```

Run from the repo root — npm workspaces will install `cors`, `express`, and `pg` into the shared `node_modules`.

- [ ] **Step 3: Create `server/db/pool.js`**

```javascript
import { Pool } from 'pg'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
```

- [ ] **Step 4: Create `server/index.js`**

```javascript
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`AcervoVista server listening on port ${port}`)
})
```

- [ ] **Step 5: Verify the server starts and responds**

```bash
npm run dev --workspace=server
```

In another terminal:

```bash
curl http://localhost:3001/api/health
```

Expected: `{"status":"ok"}`. Stop the dev server (Ctrl+C) before continuing.

- [ ] **Step 6: Commit**

```bash
git add server/package.json server/db/pool.js server/index.js package-lock.json
git commit -m "feat: scaffold express server with health check"
```

---

### Task 4: Complexity rules engine (test-first)

**Files:**
- Create: `server/lib/usStates.js`
- Create: `server/lib/complexity.test.js`
- Create: `server/lib/complexity.js`

- [ ] **Step 1: Create `server/lib/usStates.js`**

This module defines what counts as a "US residence" for the `CROSS_BORDER` flag — any heir whose residence is NOT a recognized US state code/name (or generic "USA"/"United States") is treated as abroad.

```javascript
export const US_RESIDENCE_TERMS = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
  'ALABAMA', 'ALASKA', 'ARIZONA', 'ARKANSAS', 'CALIFORNIA',
  'COLORADO', 'CONNECTICUT', 'DELAWARE', 'FLORIDA', 'GEORGIA',
  'HAWAII', 'IDAHO', 'ILLINOIS', 'INDIANA', 'IOWA', 'KANSAS',
  'KENTUCKY', 'LOUISIANA', 'MAINE', 'MARYLAND', 'MASSACHUSETTS',
  'MICHIGAN', 'MINNESOTA', 'MISSISSIPPI', 'MISSOURI', 'MONTANA',
  'NEBRASKA', 'NEVADA', 'NEW HAMPSHIRE', 'NEW JERSEY',
  'NEW MEXICO', 'NEW YORK', 'NORTH CAROLINA', 'NORTH DAKOTA',
  'OHIO', 'OKLAHOMA', 'OREGON', 'PENNSYLVANIA', 'RHODE ISLAND',
  'SOUTH CAROLINA', 'SOUTH DAKOTA', 'TENNESSEE', 'TEXAS', 'UTAH',
  'VERMONT', 'VIRGINIA', 'WASHINGTON', 'WEST VIRGINIA',
  'WISCONSIN', 'WYOMING',
  'USA', 'US', 'UNITED STATES', 'UNITED STATES OF AMERICA',
])

export function isUSResidence(residence) {
  if (!residence) return true
  return US_RESIDENCE_TERMS.has(residence.trim().toUpperCase())
}
```

- [ ] **Step 2: Write the failing tests in `server/lib/complexity.test.js`**

```javascript
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeComplexityFlags } from './complexity.js'

test('returns no flags for a simple FL testate case with one heir', () => {
  const flags = computeComplexityFlags({
    assets: ['Real property in Florida'],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'no',
    hasWill: 'yes',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.deepEqual(flags, [])
})

test('CROSS_BORDER when assets include real property outside Florida', () => {
  const flags = computeComplexityFlags({
    assets: ['Real property outside Florida'],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'no',
    hasWill: 'yes',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.ok(flags.includes('CROSS_BORDER'))
})

test('CROSS_BORDER when assets include assets in another country', () => {
  const flags = computeComplexityFlags({
    assets: ['Assets in another country'],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'no',
    hasWill: 'yes',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.ok(flags.includes('CROSS_BORDER'))
})

test('CROSS_BORDER when an heir resides outside the US', () => {
  const flags = computeComplexityFlags({
    assets: ['Real property in Florida'],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'no',
    hasWill: 'yes',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'Brazil' }],
  })
  assert.ok(flags.includes('CROSS_BORDER'))
})

test('no CROSS_BORDER for FL assets and FL/US heirs', () => {
  const flags = computeComplexityFlags({
    assets: ['Real property in Florida', 'Bank accounts'],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'no',
    hasWill: 'yes',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.ok(!flags.includes('CROSS_BORDER'))
})

test('CONTESTED when heirsInAgreement is no', () => {
  const flags = computeComplexityFlags({
    assets: [],
    heirsInAgreement: 'no',
    preDeathTransfers: 'no',
    hasWill: 'yes',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.ok(flags.includes('CONTESTED'))
})

test('CONTESTED when heirsInAgreement is complicated', () => {
  const flags = computeComplexityFlags({
    assets: [],
    heirsInAgreement: 'complicated',
    preDeathTransfers: 'no',
    hasWill: 'yes',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.ok(flags.includes('CONTESTED'))
})

test('PRE_DEATH_XFER when preDeathTransfers is yes', () => {
  const flags = computeComplexityFlags({
    assets: [],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'yes',
    hasWill: 'yes',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.ok(flags.includes('PRE_DEATH_XFER'))
})

test('BUSINESS when assets include business interests', () => {
  const flags = computeComplexityFlags({
    assets: ['Business interests'],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'no',
    hasWill: 'yes',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.ok(flags.includes('BUSINESS'))
})

test('INTESTATE when hasWill is no or unknown', () => {
  const noWill = computeComplexityFlags({
    assets: [],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'no',
    hasWill: 'no',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.ok(noWill.includes('INTESTATE'))

  const unknownWill = computeComplexityFlags({
    assets: [],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'no',
    hasWill: 'unknown',
    heirs: [{ fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' }],
  })
  assert.ok(unknownWill.includes('INTESTATE'))
})

test('MULTI_HEIR when more than two heirs', () => {
  const flags = computeComplexityFlags({
    assets: [],
    heirsInAgreement: 'yes',
    preDeathTransfers: 'no',
    hasWill: 'yes',
    heirs: [
      { fullName: 'Ana Silva', relationship: 'Daughter', residence: 'FL' },
      { fullName: 'Bruno Silva', relationship: 'Son', residence: 'FL' },
      { fullName: 'Carla Silva', relationship: 'Daughter', residence: 'FL' },
    ],
  })
  assert.ok(flags.includes('MULTI_HEIR'))
})
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
node --test server/lib/
```

Expected: FAIL — `complexity.js` does not exist yet (`Cannot find module './complexity.js'`).

- [ ] **Step 4: Implement `server/lib/complexity.js`**

```javascript
import { isUSResidence } from './usStates.js'

export function computeComplexityFlags({
  assets = [],
  heirsInAgreement,
  preDeathTransfers,
  hasWill,
  heirs = [],
}) {
  const flags = []

  const crossBorderAssets =
    assets.includes('Real property outside Florida') ||
    assets.includes('Assets in another country')
  const heirAbroad = heirs.some((heir) => !isUSResidence(heir.residence))
  if (crossBorderAssets || heirAbroad) flags.push('CROSS_BORDER')

  if (heirsInAgreement === 'no' || heirsInAgreement === 'complicated') {
    flags.push('CONTESTED')
  }

  if (preDeathTransfers === 'yes') flags.push('PRE_DEATH_XFER')

  if (assets.includes('Business interests')) flags.push('BUSINESS')

  if (hasWill === 'no' || hasWill === 'unknown') flags.push('INTESTATE')

  if (heirs.length > 2) flags.push('MULTI_HEIR')

  return flags
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
node --test server/lib/
```

Expected: PASS — 11 tests, 0 failures.

- [ ] **Step 6: Commit**

```bash
git add server/lib/usStates.js server/lib/complexity.js server/lib/complexity.test.js
git commit -m "feat: add complexity flags rules engine with tests"
```

---

### Task 5: Cases API routes

**Files:**
- Create: `server/routes/cases.js`
- Modify: `server/index.js`

- [ ] **Step 1: Create `server/routes/cases.js`**

```javascript
import express from 'express'
import { pool } from '../db/pool.js'
import { computeComplexityFlags } from '../lib/complexity.js'

export const casesRouter = express.Router()

casesRouter.post('/', async (req, res) => {
  const {
    userType,
    decedentName,
    dateOfDeath,
    stateOfDomicile,
    diedInFlorida,
    maritalStatus,
    spouseName,
    hasWill,
    willLocated,
    heirsInAgreement,
    assets,
    preDeathTransfers,
    heirs,
  } = req.body

  if (!decedentName || !dateOfDeath || !Array.isArray(heirs) || heirs.length < 1) {
    return res.status(400).json({
      error: 'decedentName, dateOfDeath, and at least one heir are required',
    })
  }

  const complexityFlags = computeComplexityFlags({
    assets,
    heirsInAgreement,
    preDeathTransfers,
    hasWill,
    heirs,
  })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const caseResult = await client.query(
      `INSERT INTO cases (
        user_type, decedent_name, date_of_death, state_of_domicile,
        died_in_florida, marital_status, spouse_name, has_will,
        will_located, heirs_in_agreement, assets, pre_death_transfers,
        complexity_flags, intake_completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id`,
      [
        userType,
        decedentName,
        dateOfDeath,
        stateOfDomicile,
        diedInFlorida,
        maritalStatus,
        spouseName,
        hasWill,
        willLocated,
        heirsInAgreement,
        JSON.stringify(assets || []),
        preDeathTransfers,
        JSON.stringify(complexityFlags),
      ]
    )
    const caseId = caseResult.rows[0].id

    for (const heir of heirs) {
      await client.query(
        `INSERT INTO heirs (case_id, full_name, relationship, residence)
         VALUES ($1, $2, $3, $4)`,
        [caseId, heir.fullName, heir.relationship, heir.residence]
      )
    }

    await client.query(
      `INSERT INTO timeline_events (case_id, event_type, label)
       VALUES ($1, 'case_opened', 'Case file opened')`,
      [caseId]
    )

    await client.query('COMMIT')
    res.status(201).json({ id: caseId, complexityFlags })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Failed to create case' })
  } finally {
    client.release()
  }
})

casesRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  const caseResult = await pool.query('SELECT * FROM cases WHERE id = $1', [id])
  if (caseResult.rows.length === 0) {
    return res.status(404).json({ error: 'Case not found' })
  }

  const heirsResult = await pool.query(
    'SELECT id, full_name, relationship, residence FROM heirs WHERE case_id = $1',
    [id]
  )

  res.json({
    ...caseResult.rows[0],
    heirs: heirsResult.rows,
  })
})
```

- [ ] **Step 2: Wire the router into `server/index.js`**

```javascript
import express from 'express'
import cors from 'cors'
import { casesRouter } from './routes/cases.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/cases', casesRouter)

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`AcervoVista server listening on port ${port}`)
})
```

- [ ] **Step 3: Verify with curl**

Start the server:

```bash
npm run dev --workspace=server
```

In another terminal, create a case with a cross-border heir:

```bash
curl -s -X POST http://localhost:3001/api/cases \
  -H 'Content-Type: application/json' \
  -d '{
    "userType": "consumer",
    "decedentName": "Maria Silva",
    "dateOfDeath": "2026-01-15",
    "stateOfDomicile": "FL",
    "diedInFlorida": true,
    "maritalStatus": "Widowed",
    "spouseName": null,
    "hasWill": "yes",
    "willLocated": "yes",
    "heirsInAgreement": "yes",
    "assets": ["Real property in Florida"],
    "preDeathTransfers": "no",
    "heirs": [{"fullName": "Ana Silva", "relationship": "Daughter", "residence": "Brazil"}]
  }'
```

Expected: JSON response with a `id` (UUID) and `"complexityFlags":["CROSS_BORDER"]`.

Then fetch it back (replace `<id>` with the returned id):

```bash
curl -s http://localhost:3001/api/cases/<id>
```

Expected: JSON with `decedent_name: "Maria Silva"`, `complexity_flags: ["CROSS_BORDER"]`, and a `heirs` array containing Ana Silva. Stop the dev server (Ctrl+C) before continuing.

- [ ] **Step 4: Commit**

```bash
git add server/routes/cases.js server/index.js
git commit -m "feat: add cases API with complexity flag computation"
```

---

### Task 6: Client scaffold

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.js`
- Create: `client/index.html`
- Create: `client/postcss.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/src/index.css`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`

- [ ] **Step 1: Create `client/package.json`**

```json
{
  "name": "client",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.6",
    "vite": "^5.3.1"
  }
}
```

- [ ] **Step 2: Install client dependencies**

```bash
npm install
```

Run from the repo root.

- [ ] **Step 3: Create `client/vite.config.js`**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
```

- [ ] **Step 4: Create `client/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap"
      rel="stylesheet"
    />
    <title>AcervoVista</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `client/postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: Create `client/tailwind.config.js`**

This reads the brand colors from the repo-root `tokens.json` (DTCG format, managed by ui-tokenize) so component code never hardcodes hex values.

```javascript
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'tokens.json'), 'utf-8')
)

const colors = Object.fromEntries(
  Object.entries(tokens.color).map(([name, token]) => [name, token.$value])
)

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 7: Create `client/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-white text-ink font-sans;
}
```

- [ ] **Step 8: Create `client/src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 9: Create placeholder `client/src/App.jsx`**

```jsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="font-serif text-3xl text-navy">AcervoVista</h1>
    </div>
  )
}
```

- [ ] **Step 10: Verify the client starts**

```bash
npm run dev --workspace=client
```

Open `http://localhost:5173` — expect a centered "AcervoVista" heading in navy serif text. Stop the dev server (Ctrl+C) before continuing.

- [ ] **Step 11: Commit**

```bash
git add client/package.json client/vite.config.js client/index.html client/postcss.config.js client/tailwind.config.js client/src/index.css client/src/main.jsx client/src/App.jsx package-lock.json
git commit -m "feat: scaffold vite client with tailwind token theme"
```

---

### Task 7: Client data modules and API helper

**Files:**
- Create: `client/src/usStates.js`
- Create: `client/src/intakeOptions.js`
- Create: `client/src/api.js`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Create `client/src/usStates.js`**

```javascript
export const US_STATES = [
  'FL',
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC',
]
```

- [ ] **Step 2: Create `client/src/intakeOptions.js`**

These strings must match exactly what `server/lib/complexity.js` checks for (`'Real property outside Florida'`, `'Assets in another country'`, `'Business interests'`).

```javascript
export const ASSET_OPTIONS = [
  'Real property in Florida',
  'Real property outside Florida',
  'Bank accounts',
  'Investment/brokerage accounts',
  'Life insurance',
  'Retirement accounts (IRA/401k)',
  'Business interests',
  'Assets in another country',
  'Vehicles',
  'Personal property',
]

export const MARITAL_STATUS_OPTIONS = [
  'Married',
  'Widowed',
  'Divorced',
  'Never married',
]

export const HAS_WILL_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: "I don't know" },
]

export const WILL_LOCATED_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Not sure' },
]

export const AGREEMENT_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'complicated', label: "It's complicated" },
]

export const TRANSFER_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unknown', label: 'Not sure' },
]
```

- [ ] **Step 3: Create `client/src/api.js`**

```javascript
const API_BASE = 'http://localhost:3001'

export async function createCase(payload) {
  const res = await fetch(`${API_BASE}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error('Failed to create case')
  }
  return res.json()
}

export async function getCase(caseId) {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}`)
  if (!res.ok) {
    throw new Error('Failed to load case')
  }
  return res.json()
}
```

- [ ] **Step 4: Replace `client/src/App.jsx`**

This sets up the localStorage-based "session" — a case ID stands in for auth. `IntakePage` and `CaseFilePage` don't exist yet; they're created in Tasks 8 and 14, so the app will not compile until then. That's expected — the dev server isn't run again until Task 15.

```jsx
import { useState } from 'react'
import IntakePage from './pages/IntakePage'
import CaseFilePage from './pages/CaseFilePage'

const CASE_ID_KEY = 'acervovista_case_id'

export default function App() {
  const [caseId, setCaseId] = useState(() =>
    localStorage.getItem(CASE_ID_KEY)
  )

  function handleIntakeComplete(newCaseId) {
    localStorage.setItem(CASE_ID_KEY, newCaseId)
    setCaseId(newCaseId)
  }

  if (!caseId) {
    return <IntakePage onComplete={handleIntakeComplete} />
  }

  return <CaseFilePage caseId={caseId} />
}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/usStates.js client/src/intakeOptions.js client/src/api.js client/src/App.jsx
git commit -m "feat: add client data modules, api helper, and session routing"
```

---

### Task 8: Step shell + Who Are You + intake page skeleton

**Files:**
- Create: `client/src/components/intake/StepShell.jsx`
- Create: `client/src/components/intake/StepWhoAreYou.jsx`
- Create: `client/src/pages/IntakePage.jsx`

- [ ] **Step 1: Create `client/src/components/intake/StepShell.jsx`**

Shared layout for every intake step: a title, the step's fields as children, and Back/Continue navigation.

```jsx
export default function StepShell({
  title,
  children,
  onNext,
  onBack,
  nextDisabled,
  nextLabel = 'Continue',
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray px-4">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm p-8">
        <h1 className="font-serif text-2xl text-navy mb-6">{title}</h1>
        <div className="space-y-4">{children}</div>
        <div className="mt-8 flex justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-ink underline"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="bg-navy text-white px-6 py-2 rounded disabled:opacity-40"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `client/src/components/intake/StepWhoAreYou.jsx`**

```jsx
import StepShell from './StepShell'

export default function StepWhoAreYou({ answers, onUpdate, onNext }) {
  return (
    <StepShell
      title="Who are you?"
      onNext={onNext}
      nextDisabled={!answers.userType}
    >
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onUpdate({ userType: 'consumer' })}
          className={`text-left p-4 rounded border ${
            answers.userType === 'consumer'
              ? 'border-navy bg-gray'
              : 'border-gray'
          }`}
        >
          Family member or heir
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ userType: 'professional' })}
          className={`text-left p-4 rounded border ${
            answers.userType === 'professional'
              ? 'border-navy bg-gray'
              : 'border-gray'
          }`}
        >
          I'm here professionally
        </button>
      </div>
      {answers.userType === 'professional' && (
        <p className="text-sm text-ink">
          Professional access requires credential verification. We'll set
          that up. For now, let's start with the basics.
        </p>
      )}
    </StepShell>
  )
}
```

- [ ] **Step 3: Create `client/src/pages/IntakePage.jsx`**

This is the step machine. Steps 2-6 reference components created in Tasks 9-13; until those exist, the page will only render step 1. That's expected at this point in the plan.

```jsx
import { useState } from 'react'
import StepWhoAreYou from '../components/intake/StepWhoAreYou'
import StepDecedent from '../components/intake/StepDecedent'
import StepMaritalStatus from '../components/intake/StepMaritalStatus'
import StepWill from '../components/intake/StepWill'
import StepHeirs from '../components/intake/StepHeirs'
import StepAssets from '../components/intake/StepAssets'
import CaseSummaryCard from '../components/casefile/CaseSummaryCard'
import { createCase } from '../api'

const TOTAL_STEPS = 6

const initialAnswers = {
  userType: '',
  decedentName: '',
  dateOfDeath: '',
  stateOfDomicile: 'FL',
  diedInFlorida: '',
  maritalStatus: '',
  spouseName: '',
  hasWill: '',
  willLocated: '',
  heirs: [{ fullName: '', relationship: '', residence: '' }],
  heirsInAgreement: '',
  assets: [],
  preDeathTransfers: '',
}

export default function IntakePage({ onComplete }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState(initialAnswers)
  const [submitting, setSubmitting] = useState(false)
  const [createdCase, setCreatedCase] = useState(null)

  function update(partial, advance = true) {
    setAnswers((prev) => ({ ...prev, ...partial }))
    if (advance) setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }

  function back() {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function submit(finalPartial) {
    const finalAnswers = { ...answers, ...finalPartial }
    setAnswers(finalAnswers)
    setSubmitting(true)
    try {
      const result = await createCase(finalAnswers)
      setCreatedCase({ ...finalAnswers, id: result.id, complexity_flags: result.complexityFlags })
      setStep(TOTAL_STEPS + 1)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === TOTAL_STEPS + 1 && createdCase) {
    return (
      <CaseSummaryCard
        caseData={createdCase}
        onStartUploading={() => onComplete(createdCase.id)}
      />
    )
  }

  if (step === 1) {
    return (
      <StepWhoAreYou
        answers={answers}
        onUpdate={(partial) => update(partial, false)}
        onNext={() => setStep(2)}
      />
    )
  }

  if (step === 2) {
    return <StepDecedent answers={answers} onNext={update} onBack={back} />
  }

  if (step === 3) {
    return <StepMaritalStatus answers={answers} onNext={update} onBack={back} />
  }

  if (step === 4) {
    return <StepWill answers={answers} onNext={update} onBack={back} />
  }

  if (step === 5) {
    return <StepHeirs answers={answers} onNext={update} onBack={back} />
  }

  if (step === 6) {
    return (
      <StepAssets
        answers={answers}
        onUpdate={(partial) => update(partial, false)}
        onSubmit={() => submit({})}
        onBack={back}
        submitting={submitting}
      />
    )
  }

  return null
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/components/intake/StepShell.jsx client/src/components/intake/StepWhoAreYou.jsx client/src/pages/IntakePage.jsx
git commit -m "feat: add step shell, who-are-you step, and intake step machine"
```

---

### Task 9: Step 2 — Decedent

**Files:**
- Create: `client/src/components/intake/StepDecedent.jsx`

- [ ] **Step 1: Create `client/src/components/intake/StepDecedent.jsx`**

```jsx
import { useState } from 'react'
import StepShell from './StepShell'
import { US_STATES } from '../../usStates'

export default function StepDecedent({ answers, onNext, onBack }) {
  const [decedentName, setDecedentName] = useState(answers.decedentName)
  const [dateOfDeath, setDateOfDeath] = useState(answers.dateOfDeath)
  const [stateOfDomicile, setStateOfDomicile] = useState(answers.stateOfDomicile)
  const [diedInFlorida, setDiedInFlorida] = useState(answers.diedInFlorida)

  const canContinue = decedentName.trim() && dateOfDeath && diedInFlorida !== ''

  return (
    <StepShell
      title="Who passed away?"
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() =>
        onNext({ decedentName, dateOfDeath, stateOfDomicile, diedInFlorida })
      }
    >
      <label className="block">
        <span className="text-sm text-ink">Full name</span>
        <input
          type="text"
          value={decedentName}
          onChange={(e) => setDecedentName(e.target.value)}
          className="mt-1 w-full border border-gray rounded p-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink">Date of death</span>
        <input
          type="date"
          value={dateOfDeath}
          onChange={(e) => setDateOfDeath(e.target.value)}
          className="mt-1 w-full border border-gray rounded p-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink">State of domicile at death</span>
        <select
          value={stateOfDomicile}
          onChange={(e) => setStateOfDomicile(e.target.value)}
          className="mt-1 w-full border border-gray rounded p-2"
        >
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="text-sm text-ink">Did they pass away in Florida?</span>
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={() => setDiedInFlorida(true)}
            className={`px-4 py-2 rounded border ${
              diedInFlorida === true ? 'border-navy bg-gray' : 'border-gray'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setDiedInFlorida(false)}
            className={`px-4 py-2 rounded border ${
              diedInFlorida === false ? 'border-navy bg-gray' : 'border-gray'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </StepShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/intake/StepDecedent.jsx
git commit -m "feat: add decedent intake step"
```

---

### Task 10: Step 3 — Marital Status

**Files:**
- Create: `client/src/components/intake/StepMaritalStatus.jsx`

- [ ] **Step 1: Create `client/src/components/intake/StepMaritalStatus.jsx`**

```jsx
import { useState } from 'react'
import StepShell from './StepShell'
import { MARITAL_STATUS_OPTIONS } from '../../intakeOptions'

export default function StepMaritalStatus({ answers, onNext, onBack }) {
  const [maritalStatus, setMaritalStatus] = useState(answers.maritalStatus)
  const [spouseName, setSpouseName] = useState(answers.spouseName)

  const canContinue =
    maritalStatus &&
    (maritalStatus !== 'Married' || spouseName.trim())

  return (
    <StepShell
      title="What was their marital status?"
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ maritalStatus, spouseName })}
    >
      <div className="flex flex-col gap-3">
        {MARITAL_STATUS_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMaritalStatus(option)}
            className={`text-left p-4 rounded border ${
              maritalStatus === option ? 'border-navy bg-gray' : 'border-gray'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {maritalStatus === 'Married' && (
        <label className="block">
          <span className="text-sm text-ink">
            What is the surviving spouse's full name?
          </span>
          <input
            type="text"
            value={spouseName}
            onChange={(e) => setSpouseName(e.target.value)}
            className="mt-1 w-full border border-gray rounded p-2"
          />
        </label>
      )}
    </StepShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/intake/StepMaritalStatus.jsx
git commit -m "feat: add marital status intake step"
```

---

### Task 11: Step 4 — Will

**Files:**
- Create: `client/src/components/intake/StepWill.jsx`

- [ ] **Step 1: Create `client/src/components/intake/StepWill.jsx`**

```jsx
import { useState } from 'react'
import StepShell from './StepShell'
import { HAS_WILL_OPTIONS, WILL_LOCATED_OPTIONS } from '../../intakeOptions'

export default function StepWill({ answers, onNext, onBack }) {
  const [hasWill, setHasWill] = useState(answers.hasWill)
  const [willLocated, setWillLocated] = useState(answers.willLocated)

  const canContinue = hasWill && (hasWill !== 'yes' || willLocated)

  return (
    <StepShell
      title="Did they leave a will?"
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ hasWill, willLocated })}
    >
      <div className="flex flex-col gap-3">
        {HAS_WILL_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setHasWill(option.value)}
            className={`text-left p-4 rounded border ${
              hasWill === option.value ? 'border-navy bg-gray' : 'border-gray'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {hasWill === 'yes' && (
        <div>
          <span className="text-sm text-ink">Has the will been located?</span>
          <div className="flex flex-col gap-3 mt-1">
            {WILL_LOCATED_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setWillLocated(option.value)}
                className={`text-left p-4 rounded border ${
                  willLocated === option.value ? 'border-navy bg-gray' : 'border-gray'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </StepShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/intake/StepWill.jsx
git commit -m "feat: add will intake step"
```

---

### Task 12: Step 5 — Heirs

**Files:**
- Create: `client/src/components/intake/StepHeirs.jsx`

- [ ] **Step 1: Create `client/src/components/intake/StepHeirs.jsx`**

```jsx
import { useState } from 'react'
import StepShell from './StepShell'
import { AGREEMENT_OPTIONS } from '../../intakeOptions'

const emptyHeir = { fullName: '', relationship: '', residence: '' }

export default function StepHeirs({ answers, onNext, onBack }) {
  const [heirs, setHeirs] = useState(
    answers.heirs.length > 0 ? answers.heirs : [{ ...emptyHeir }]
  )
  const [heirsInAgreement, setHeirsInAgreement] = useState(answers.heirsInAgreement)

  const canContinue =
    heirs.every((heir) => heir.fullName.trim() && heir.relationship.trim()) &&
    heirsInAgreement

  function updateHeir(index, field, value) {
    setHeirs((prev) =>
      prev.map((heir, i) => (i === index ? { ...heir, [field]: value } : heir))
    )
  }

  function addHeir() {
    setHeirs((prev) => [...prev, { ...emptyHeir }])
  }

  function removeHeir(index) {
    setHeirs((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <StepShell
      title="Who are the heirs?"
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ heirs, heirsInAgreement })}
    >
      <div className="space-y-4">
        {heirs.map((heir, index) => (
          <div key={index} className="border border-gray rounded p-3 space-y-2">
            <label className="block">
              <span className="text-sm text-ink">Full name</span>
              <input
                type="text"
                value={heir.fullName}
                onChange={(e) => updateHeir(index, 'fullName', e.target.value)}
                className="mt-1 w-full border border-gray rounded p-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink">Relationship to decedent</span>
              <input
                type="text"
                value={heir.relationship}
                onChange={(e) => updateHeir(index, 'relationship', e.target.value)}
                className="mt-1 w-full border border-gray rounded p-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink">State or country of residence</span>
              <input
                type="text"
                value={heir.residence}
                onChange={(e) => updateHeir(index, 'residence', e.target.value)}
                className="mt-1 w-full border border-gray rounded p-2"
              />
            </label>
            {heirs.length > 1 && (
              <button
                type="button"
                onClick={() => removeHeir(index)}
                className="text-sm text-red underline"
              >
                Remove this heir
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addHeir} className="text-sm text-navy underline">
          + Add another heir
        </button>
      </div>

      <div>
        <span className="text-sm text-ink">Are all heirs in agreement about the estate?</span>
        <div className="flex flex-col gap-3 mt-1">
          {AGREEMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setHeirsInAgreement(option.value)}
              className={`text-left p-4 rounded border ${
                heirsInAgreement === option.value ? 'border-navy bg-gray' : 'border-gray'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </StepShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/intake/StepHeirs.jsx
git commit -m "feat: add heirs intake step"
```

---

### Task 13: Step 6 — Assets

**Files:**
- Create: `client/src/components/intake/StepAssets.jsx`

- [ ] **Step 1: Create `client/src/components/intake/StepAssets.jsx`**

This is the final intake step. Its "Continue" button is labeled "See my case summary" and calls `onSubmit` (which posts to the API), not `onNext`.

```jsx
import { useState } from 'react'
import StepShell from './StepShell'
import { ASSET_OPTIONS, TRANSFER_OPTIONS } from '../../intakeOptions'

export default function StepAssets({ answers, onUpdate, onSubmit, onBack, submitting }) {
  const [assets, setAssets] = useState(answers.assets)
  const [preDeathTransfers, setPreDeathTransfers] = useState(answers.preDeathTransfers)

  const canSubmit = preDeathTransfers && !submitting

  function toggleAsset(option) {
    setAssets((prev) =>
      prev.includes(option) ? prev.filter((a) => a !== option) : [...prev, option]
    )
  }

  function handleSubmit() {
    onUpdate({ assets, preDeathTransfers })
    onSubmit()
  }

  return (
    <StepShell
      title="What assets are part of the estate?"
      onBack={onBack}
      nextDisabled={!canSubmit}
      nextLabel={submitting ? 'Saving...' : 'See my case summary'}
      onNext={handleSubmit}
    >
      <div className="space-y-2">
        {ASSET_OPTIONS.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={assets.includes(option)}
              onChange={() => toggleAsset(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      <div>
        <span className="text-sm text-ink">
          Were there any significant asset transfers or gifts in the 2 years
          before the death?
        </span>
        <div className="flex flex-col gap-3 mt-1">
          {TRANSFER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreDeathTransfers(option.value)}
              className={`text-left p-4 rounded border ${
                preDeathTransfers === option.value ? 'border-navy bg-gray' : 'border-gray'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </StepShell>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add client/src/components/intake/StepAssets.jsx
git commit -m "feat: add assets intake step"
```

---

### Task 14: Case summary card + case file page

**Files:**
- Create: `client/src/complexityMessages.js`
- Create: `client/src/components/casefile/CaseSummaryCard.jsx`
- Create: `client/src/pages/CaseFilePage.jsx`

- [ ] **Step 1: Create `client/src/complexityMessages.js`**

```javascript
export const COMPLEXITY_MESSAGES = {
  CROSS_BORDER:
    'This estate involves assets or parties in more than one jurisdiction. A lawyer with cross-border experience is recommended.',
  CONTESTED:
    "You've indicated not all heirs are in agreement. We recommend speaking with a lawyer before taking any steps.",
  PRE_DEATH_XFER:
    'You mentioned transfers made before the death. These are worth noting and a lawyer will want to review them.',
  BUSINESS:
    'Business interests add complexity. A lawyer and possibly a business valuator will be needed.',
}

export const MARITAL_STATUS_LABELS = {
  Married: 'Married',
  Widowed: 'Widowed',
  Divorced: 'Divorced',
  'Never married': 'Never married',
}

export const AGREEMENT_LABELS = {
  yes: 'Yes',
  no: 'No',
  complicated: "It's complicated",
}

export const TRANSFER_LABELS = {
  yes: 'Yes',
  no: 'No',
  unknown: 'Not sure',
}
```

- [ ] **Step 2: Create `client/src/components/casefile/CaseSummaryCard.jsx`**

```jsx
import {
  COMPLEXITY_MESSAGES,
  AGREEMENT_LABELS,
  TRANSFER_LABELS,
} from '../../complexityMessages'

export default function CaseSummaryCard({ caseData, onStartUploading }) {
  const complexityFlags = caseData.complexity_flags || []
  const messages = complexityFlags
    .map((flag) => COMPLEXITY_MESSAGES[flag])
    .filter(Boolean)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray px-4">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm p-8 space-y-6">
        <h1 className="font-serif text-2xl text-navy">Your case file</h1>

        <section>
          <h2 className="font-serif text-lg text-navy mb-2">Decedent</h2>
          <p>{caseData.decedentName}</p>
          <p className="text-sm text-ink">Date of death: {caseData.dateOfDeath}</p>
          <p className="text-sm text-ink">State of domicile: {caseData.stateOfDomicile}</p>
          {caseData.maritalStatus === 'Married' && (
            <p className="text-sm text-ink">Surviving spouse: {caseData.spouseName}</p>
          )}
        </section>

        <section>
          <h2 className="font-serif text-lg text-navy mb-2">Heirs</h2>
          <ul className="space-y-1">
            {caseData.heirs.map((heir, index) => (
              <li key={index} className="text-sm text-ink">
                {heir.fullName} ({heir.relationship}, {heir.residence})
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink mt-1">
            Heirs in agreement: {AGREEMENT_LABELS[caseData.heirsInAgreement]}
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-navy mb-2">Assets</h2>
          <ul className="list-disc list-inside text-sm text-ink">
            {caseData.assets.map((asset) => (
              <li key={asset}>{asset}</li>
            ))}
          </ul>
          <p className="text-sm text-ink mt-1">
            Pre-death transfers: {TRANSFER_LABELS[caseData.preDeathTransfers]}
          </p>
        </section>

        {messages.length > 0 && (
          <section>
            <h2 className="font-serif text-lg text-navy mb-2">
              A few things worth knowing
            </h2>
            <ul className="space-y-2">
              {messages.map((message) => (
                <li key={message} className="text-sm text-ink bg-gray rounded p-3">
                  {message}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-ink">
          Your case file is started. The next step is to begin uploading
          documents.
        </p>

        <button
          type="button"
          onClick={onStartUploading}
          className="bg-navy text-white px-6 py-2 rounded"
        >
          Start uploading
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `client/src/pages/CaseFilePage.jsx`**

For Session 1, this fetches the saved case from the API and renders the same summary card. Document upload (Thing 2) and the gap map / timeline (Thing 3) are out of scope for this plan and will replace/extend this page in follow-up plans.

```jsx
import { useEffect, useState } from 'react'
import { getCase } from '../api'
import CaseSummaryCard from '../components/casefile/CaseSummaryCard'

export default function CaseFilePage({ caseId }) {
  const [caseData, setCaseData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCase(caseId)
      .then((data) =>
        setCaseData({
          decedentName: data.decedent_name,
          dateOfDeath: data.date_of_death,
          stateOfDomicile: data.state_of_domicile,
          maritalStatus: data.marital_status,
          spouseName: data.spouse_name,
          heirs: data.heirs.map((heir) => ({
            fullName: heir.full_name,
            relationship: heir.relationship,
            residence: heir.residence,
          })),
          heirsInAgreement: data.heirs_in_agreement,
          assets: data.assets || [],
          preDeathTransfers: data.pre_death_transfers,
          complexity_flags: data.complexity_flags || [],
        })
      )
      .catch(() => setError('Could not load your case file.'))
  }, [caseId])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red">{error}</p>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink">Loading your case file...</p>
      </div>
    )
  }

  return (
    <CaseSummaryCard
      caseData={caseData}
      onStartUploading={() => alert('Document uploads are coming soon.')}
    />
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add client/src/complexityMessages.js client/src/components/casefile/CaseSummaryCard.jsx client/src/pages/CaseFilePage.jsx
git commit -m "feat: add case summary card and case file page"
```

---

### Task 15: End-to-end verification

**Files:** None (manual verification only)

- [ ] **Step 1: Start the database**

Confirm Postgres is running and the schema from Task 2 has been applied (`psql "$DATABASE_URL" -c '\dt'` should list `cases`, `heirs`, `documents`, `timeline_events`).

- [ ] **Step 2: Start the backend**

```bash
npm run dev --workspace=server
```

Expected: `AcervoVista server listening on port 3001`.

- [ ] **Step 3: Start the frontend** (in a second terminal)

```bash
npm run dev --workspace=client
```

Expected: Vite prints a local URL at `http://localhost:5173`.

- [ ] **Step 4: Walk through the intake flow in the browser**

Open `http://localhost:5173` and complete all 7 steps for a Florida testate estate, e.g.:

1. Who are you? → "Family member or heir"
2. Who passed away? → "Eduardo Costa", a date of death, state of domicile "FL", "Did they pass away in Florida?" → Yes
3. Marital status → "Married" → spouse name "Lucia Costa"
4. Did they leave a will? → "Yes" → "Has the will been located?" → "Yes"
5. Heirs → one heir "Mariana Costa", relationship "Daughter", residence "FL" → "Are all heirs in agreement?" → "Yes"
6. Assets → check "Real property in Florida" and "Bank accounts" → "Were there any... transfers..." → "No" → "See my case summary"

- [ ] **Step 5: Verify the case summary card**

Expected: a card showing Decedent (Eduardo Costa, date of death, FL, spouse Lucia Costa), Heirs (Mariana Costa, Daughter, FL), Assets (the two checked items), no "A few things worth knowing" section (no complexity flags triggered for this scenario), and the closing message "Your case file is started. The next step is to begin uploading documents." with a "Start uploading" button.

- [ ] **Step 6: Click "Start uploading"**

Expected: an alert dialog "Document uploads are coming soon." (placeholder for Thing 2), and the page now shows the same case summary card rendered from `CaseFilePage` (confirms the case ID was persisted and the case file page can re-fetch it).

- [ ] **Step 7: Verify localStorage persistence**

Reload the page (`Cmd+R`). Expected: the case file page loads directly (no intake flow), confirming `acervovista_case_id` persisted in localStorage.

- [ ] **Step 8: Verify database rows**

```bash
psql "$DATABASE_URL" -c "SELECT decedent_name, date_of_death, state_of_domicile, died_in_florida, marital_status, spouse_name, has_will, complexity_flags FROM cases ORDER BY created_at DESC LIMIT 1;"
psql "$DATABASE_URL" -c "SELECT full_name, relationship, residence FROM heirs ORDER BY id DESC LIMIT 1;"
psql "$DATABASE_URL" -c "SELECT event_type, label FROM timeline_events ORDER BY event_at DESC LIMIT 1;"
```

Expected: the `cases` row matches what was entered (including `died_in_florida = true`, `spouse_name = 'Lucia Costa'`, `complexity_flags = []`), the `heirs` row matches Mariana Costa, and the `timeline_events` row shows `event_type = 'case_opened'`, `label = 'Case file opened'`.

- [ ] **Step 9: Test a complexity-flag scenario**

Clear localStorage (`localStorage.removeItem('acervovista_case_id')` in the browser console) and reload to restart the intake. This time, for the heirs step, set the heir's residence to "Brazil", and for assets, check "Business interests" and set "Were there any... transfers..." to "Yes". On the summary card, expected: an "A few things worth knowing" section showing the CROSS_BORDER, PRE_DEATH_XFER, and BUSINESS messages from `complexityMessages.js`.

- [ ] **Step 10: Report to user**

Stop both dev servers. Report to the user that Thing 1 (intake flow + case summary with complexity indicators) is complete and ready for their review per the Session 1 Build Order, and pause before starting a plan for Thing 2 (document upload + OCR).

---

## Self-Review Notes

- **Spec coverage:** All 7 intake steps (Tasks 8-13 + summary in Task 14), case summary card with plain-language complexity messages (Task 14), backend complexity flags for all 6 flag types with tests (Task 4), `cases`/`heirs`/`documents`/`timeline_events` schema including the approved `died_in_florida`/`spouse_name` columns (Task 2), localStorage-based session (Tasks 7-8), and the Session 1 build order's first checkpoint (Task 15) are all covered. `documents` and `timeline_events` beyond `case_opened` are intentionally unused until Thing 2/3 plans.
- **Type consistency:** `answers` shape in `IntakePage.jsx` (camelCase: `decedentName`, `dateOfDeath`, `stateOfDomicile`, `diedInFlorida`, `maritalStatus`, `spouseName`, `hasWill`, `willLocated`, `heirs`, `heirsInAgreement`, `assets`, `preDeathTransfers`) matches the `req.body` destructuring in `server/routes/cases.js`, which matches the `computeComplexityFlags` parameter names (`assets`, `heirsInAgreement`, `preDeathTransfers`, `hasWill`, `heirs`). `CaseFilePage.jsx` maps snake_case DB columns back to the same camelCase shape expected by `CaseSummaryCard.jsx`.
- **No placeholders:** All steps contain full file contents or exact commands with expected output. The only deferred UI is the "Start uploading" / document upload placeholder, which is explicitly in-scope as a placeholder per the Session 1 spec (Thing 2 is a separate plan).
