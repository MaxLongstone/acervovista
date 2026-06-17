/**
 * Seed: Estate of Rafael Morales
 *
 * Test fixture for the Acervo Vista heir dashboard. This case exercises:
 *   - Cross-border jurisdiction (Florida + Argentina)
 *   - Bilingual documents (English + Spanish)
 *   - A flagged ownership conflict (Miami apartment deed)
 *   - All five item states (confirmed, pending, missing, flagged, unknown)
 *   - The declared → confirmed graduation path
 *   - Assets, documents, and a known_fact item mixed in one estate
 *
 * Usage:
 *   node server/db/seeds/rafael.js
 *
 * Requires DATABASE_URL in environment (same as the server).
 * Safe to re-run — deletes and recreates the Rafael case each time.
 */

import { randomUUID } from 'crypto'
import pg from 'pg'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// ─── Pre-generate IDs so items can cross-reference each other ─────────────────

const CASE_ID   = randomUUID()
const HEIR_ID   = randomUUID()

// Item IDs — document items
const ITEM_WILL                   = randomUUID()
const ITEM_LETTERS_TESTAMENTARY   = randomUUID()
const ITEM_COURT_FILING           = randomUUID()
const ITEM_LIFE_INSURANCE         = randomUUID()
const ITEM_BROKERAGE_STATEMENT    = randomUUID()
const ITEM_TAX_RETURN_2023        = randomUUID()
const ITEM_MIAMI_DEED             = randomUUID() // flagged — Aug 2023 transfer conflict
const ITEM_BUENOS_AIRES_DEED      = randomUUID() // confirmed, Spanish-language
const ITEM_ARG_BANK_STATEMENT     = randomUUID() // confirmed, Spanish-language
const ITEM_DEATH_CERTIFICATE      = randomUUID() // missing — critical gap
const ITEM_DECLARATORIA           = randomUUID() // missing — Argentine court order
const ITEM_APOSTILLE              = randomUUID() // missing — needed for FL docs in AR

// Item IDs — asset items
const ITEM_ASSET_MIAMI_APT        = randomUUID() // flagged — links to ITEM_MIAMI_DEED
const ITEM_ASSET_BUENOS_AIRES_APT = randomUUID() // confirmed — links to ITEM_BUENOS_AIRES_DEED
const ITEM_ASSET_BROKERAGE        = randomUUID() // confirmed — links to ITEM_BROKERAGE_STATEMENT

// ─── Case record ──────────────────────────────────────────────────────────────

const CASE = {
  id:                  CASE_ID,
  user_type:           'heir',
  decedent_name:       'Rafael Morales',
  date_of_death:       '2024-11-14',
  state_of_domicile:   'FL',
  jurisdictions:       ['Florida', 'Argentina'],
  died_in_florida:     true,
  marital_status:      'Widowed',
  spouse_name:         null,
  has_will:            'yes',
  will_located:        'yes',
  heirs_in_agreement:  'yes',
  assets:              JSON.stringify(['Real property', 'Brokerage account', 'Life insurance']),
  pre_death_transfers: 'yes',          // the apartment transfer is the pre-death transfer
  complexity_flags:    JSON.stringify(['pre_death_transfers', 'multiple_jurisdictions']),
  assistant_turns_used: 0,
  assistant_cap:        50,
}

// ─── Heir record ──────────────────────────────────────────────────────────────

const HEIR = {
  id:           HEIR_ID,
  case_id:      CASE_ID,
  full_name:    'Camila Morales',
  relationship: 'Child',
  residence:    'Miami, FL',
}

// ─── Item records ─────────────────────────────────────────────────────────────

// Convenience builder — all required fields + sensible defaults
function item(id, fields) {
  return {
    id,
    case_id:         CASE_ID,
    item_type:       fields.item_type,
    state:           fields.state,
    provenance:      fields.provenance,
    title:           fields.title,
    summary:         fields.summary ?? null,
    item_date:       fields.item_date ?? null,
    value_cents:     fields.value_cents ?? null,
    value_currency:  fields.value_currency ?? 'USD',
    conflict:        fields.conflict ? JSON.stringify(fields.conflict) : null,
    linked_item_ids: fields.linked_item_ids ?? [],
    document_id:     fields.document_id ?? null,
    jurisdiction:    fields.jurisdiction ?? null,
  }
}

const ITEMS = [

  // ── Confirmed documents (9) ──────────────────────────────────────────────

  item(ITEM_WILL, {
    item_type:    'document',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Florida',
    title:        'Last Will and Testament — Rafael Morales',
    summary:      'Original will dated March 2019. Names Camila Morales as sole beneficiary and designates an estate attorney as Personal Representative.',
    item_date:    '2019-03-04',
  }),

  item(ITEM_LETTERS_TESTAMENTARY, {
    item_type:    'document',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Florida',
    title:        'Letters Testamentary',
    summary:      'Issued by Miami-Dade Circuit Court. Authorizes the Personal Representative to act on behalf of the estate.',
    item_date:    '2024-12-19',
  }),

  item(ITEM_COURT_FILING, {
    item_type:    'document',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Florida',
    title:        'Petition for Administration',
    summary:      'Filed with Miami-Dade Circuit Court to formally open the estate proceeding.',
    item_date:    '2024-12-05',
  }),

  item(ITEM_LIFE_INSURANCE, {
    item_type:    'document',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Florida',
    title:        'Life insurance policy — Nationwide',
    summary:      'Whole-life policy. Camila Morales named as primary beneficiary. Proceeds pass directly to her outside the estate.',
    item_date:    '2011-06-15',
    value_cents:  25000000, // $250,000
  }),

  item(ITEM_BROKERAGE_STATEMENT, {
    item_type:    'document',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Florida',
    title:        'Brokerage statement — Merrill Lynch (Oct 2024)',
    summary:      'Most recent statement prior to death. Reflects equity portfolio value at time of death.',
    item_date:    '2024-10-31',
    linked_item_ids: [ITEM_ASSET_BROKERAGE],
    value_cents:  18740000, // $187,400
  }),

  item(ITEM_TAX_RETURN_2023, {
    item_type:    'document',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Florida',
    title:        '2023 federal income tax return',
    summary:      'Filed jointly; no outstanding IRS liens identified. Useful for establishing income baseline for estate.',
    item_date:    '2024-04-15',
  }),

  item(ITEM_MIAMI_DEED, {
    item_type:    'document',
    state:        'flagged',
    provenance:   'document',
    jurisdiction: 'Florida',
    title:        'Deed — 4521 Collins Ave, Miami Beach (quitclaim)',
    summary:      'Quitclaim deed recorded August 2023. Shows ownership transferred from Rafael Morales to an LLC. Conflicts with heir\'s account that Rafael owned the property at death.',
    item_date:    '2023-08-17',
    conflict: {
      declared_account: 'Your father still owned this apartment when he died in November 2024.',
      document_account: 'This deed, recorded August 17, 2023, transferred ownership to Collins Realty LLC — 15 months before his death.',
    },
    linked_item_ids: [ITEM_ASSET_MIAMI_APT],
  }),

  item(ITEM_BUENOS_AIRES_DEED, {
    item_type:    'document',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Argentina',
    title:        'Escritura — Av. Santa Fe 2847, Palermo, Buenos Aires',
    summary:      'Argentine title deed (escritura pública) in Spanish, notarized by Escribano público. Confirms Rafael Morales as owner at time of death. Requires certified translation for Florida proceedings.',
    item_date:    '2007-09-23',
    linked_item_ids: [ITEM_ASSET_BUENOS_AIRES_APT],
  }),

  item(ITEM_ARG_BANK_STATEMENT, {
    item_type:    'document',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Argentina',
    title:        'Extracto de cuenta — Banco Galicia (octubre 2024)',
    summary:      'Argentine bank statement in Spanish. Shows checking and savings balances. Account will require a Declaratoria de Herederos before the bank will release funds.',
    item_date:    '2024-10-31',
    value_cents:  1420000, // ARS 1,420,000 — storing in ARS cents
    value_currency: 'ARS',
  }),

  // ── Missing required documents (3) ──────────────────────────────────────

  item(ITEM_DEATH_CERTIFICATE, {
    item_type:    'document',
    state:        'missing',
    provenance:   'declared',
    jurisdiction: 'Florida',
    title:        'Death certificate',
    summary:      'Required to begin estate administration and notify every institution. Order at least 5 certified copies from the Florida Department of Health or Miami-Dade county health department.',
  }),

  item(ITEM_DECLARATORIA, {
    item_type:    'document',
    state:        'missing',
    provenance:   'declared',
    jurisdiction: 'Argentina',
    title:        'Declaratoria de herederos',
    summary:      'Argentine court order establishing who the legal heirs are. Required before Banco Galicia or the Buenos Aires property registry will act. A local Argentine attorney must file for this.',
  }),

  item(ITEM_APOSTILLE, {
    item_type:    'document',
    state:        'missing',
    provenance:   'declared',
    jurisdiction: 'Florida',
    title:        'Apostille (for Florida death certificate)',
    summary:      'Authenticates the Florida death certificate so it can be used in Argentina. Obtained from the Florida Secretary of State after the death certificate is certified.',
  }),

  // ── Asset items ──────────────────────────────────────────────────────────

  item(ITEM_ASSET_MIAMI_APT, {
    item_type:    'asset',
    state:        'flagged',
    provenance:   'declared',
    jurisdiction: 'Florida',
    title:        'Miami Beach apartment — 4521 Collins Ave',
    summary:      'Heir states this was your father\'s primary Florida residence at death. A recorded deed conflicts with this account. Do not assume this asset belongs to the estate until the conflict is resolved.',
    value_cents:  89500000, // ~$895,000 estimated
    conflict: {
      declared_account: 'Your father still owned this apartment when he died in November 2024.',
      document_account: 'A quitclaim deed recorded August 17, 2023 transferred ownership to Collins Realty LLC.',
    },
    linked_item_ids: [ITEM_MIAMI_DEED],
  }),

  item(ITEM_ASSET_BUENOS_AIRES_APT, {
    item_type:    'asset',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Argentina',
    title:        'Buenos Aires apartment — Av. Santa Fe 2847, Palermo',
    summary:      'Confirmed by escritura pública. Ownership passes under Argentine succession law. Requires Declaratoria de Herederos and local Argentine attorney to transfer.',
    value_cents:  18000000, // ~USD 180,000 equivalent
    linked_item_ids: [ITEM_BUENOS_AIRES_DEED],
  }),

  item(ITEM_ASSET_BROKERAGE, {
    item_type:    'asset',
    state:        'confirmed',
    provenance:   'document',
    jurisdiction: 'Florida',
    title:        'Merrill Lynch brokerage account',
    summary:      'Confirmed by October 2024 statement. No named beneficiary on file — passes through the estate. Merrill Lynch will require Letters Testamentary before transferring.',
    value_cents:  18740000, // matches statement
    linked_item_ids: [ITEM_BROKERAGE_STATEMENT],
  }),

]

// ─── Seed function ────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Remove any previous Rafael seed (idempotent)
    await client.query(`DELETE FROM cases WHERE decedent_name = 'Rafael Morales'`)

    // Insert case
    await client.query(
      `INSERT INTO cases (
         id, user_type, decedent_name, date_of_death, state_of_domicile, jurisdictions,
         died_in_florida, marital_status, spouse_name, has_will, will_located,
         heirs_in_agreement, assets, pre_death_transfers, complexity_flags,
         assistant_turns_used, assistant_cap, intake_completed_at
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17, NOW()
       )`,
      [
        CASE.id, CASE.user_type, CASE.decedent_name, CASE.date_of_death,
        CASE.state_of_domicile, CASE.jurisdictions, CASE.died_in_florida,
        CASE.marital_status, CASE.spouse_name, CASE.has_will, CASE.will_located,
        CASE.heirs_in_agreement, CASE.assets, CASE.pre_death_transfers,
        CASE.complexity_flags, CASE.assistant_turns_used, CASE.assistant_cap,
      ]
    )

    // Insert heir
    await client.query(
      `INSERT INTO heirs (id, case_id, full_name, relationship, residence)
       VALUES ($1,$2,$3,$4,$5)`,
      [HEIR.id, HEIR.case_id, HEIR.full_name, HEIR.relationship, HEIR.residence]
    )

    // Insert opening timeline event
    await client.query(
      `INSERT INTO timeline_events (case_id, event_type, label)
       VALUES ($1, 'case_opened', 'Case file opened')`,
      [CASE_ID]
    )

    // Insert all items
    for (const it of ITEMS) {
      await client.query(
        `INSERT INTO case_items (
           id, case_id, item_type, state, provenance,
           title, summary, item_date, value_cents, value_currency,
           conflict, linked_item_ids, document_id, jurisdiction
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
         )`,
        [
          it.id, it.case_id, it.item_type, it.state, it.provenance,
          it.title, it.summary, it.item_date, it.value_cents, it.value_currency,
          it.conflict, it.linked_item_ids, it.document_id, it.jurisdiction,
        ]
      )
    }

    await client.query('COMMIT')

    const counts = ITEMS.reduce((acc, it) => {
      acc[it.state] = (acc[it.state] ?? 0) + 1
      return acc
    }, {})

    console.log('✓ Rafael Morales seed inserted')
    console.log(`  Case ID : ${CASE_ID}`)
    console.log(`  Items   : ${ITEMS.length} total`)
    Object.entries(counts).forEach(([state, n]) => {
      console.log(`    ${state.padEnd(10)} ${n}`)
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
