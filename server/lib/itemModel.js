/**
 * itemModel.js — canonical shape for case_items records.
 *
 * One item = one record in case_items. The same record surfaces in:
 *   - the gap map   (state drives the dot color)
 *   - the timeline  (item_date places it)
 *   - the estimate  (value_cents / value_currency feeds the total)
 *   - the dwell page (full detail view, linked items, conflict detail)
 *
 * Nothing here renders UI. This file is the shared vocabulary.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export const ITEM_TYPES = /** @type {const} */ ({
  DOCUMENT:   'document',
  EVENT:      'event',
  ASSET:      'asset',
  DEBT:       'debt',
  KNOWN_FACT: 'known_fact',
})

export const ITEM_STATES = /** @type {const} */ ({
  CONFIRMED: 'confirmed', // green  — proven by an uploaded document
  PENDING:   'pending',   // gold   — expected but not yet received/uploaded
  MISSING:   'missing',   // red    — required; absent past the grace window
  FLAGGED:   'flagged',   // blue   — conflict between declared and document account
  UNKNOWN:   'unknown',   // grey   — existence or status cannot be determined
})

export const ITEM_PROVENANCE = /** @type {const} */ ({
  DOCUMENT: 'document', // confirmed by an uploaded file in the documents table
  DECLARED: 'declared', // the heir stated this exists; no document yet
})

// ─── State transitions ────────────────────────────────────────────────────────

/**
 * Returns true if a declared item with this state can graduate to confirmed
 * when a matching document arrives. 'flagged' items do NOT auto-graduate —
 * a conflict requires explicit human resolution before confirming.
 */
export function canGraduate(item) {
  return (
    item.provenance === ITEM_PROVENANCE.DECLARED &&
    (item.state === ITEM_STATES.PENDING || item.state === ITEM_STATES.MISSING)
  )
}

/**
 * Returns the new state and provenance for an item graduating from declared
 * to document-confirmed. Call this when a matching document is linked.
 */
export function graduateItem(item, documentId) {
  if (!canGraduate(item)) {
    throw new Error(`Item ${item.id} (state: ${item.state}) cannot graduate without conflict resolution`)
  }
  return {
    ...item,
    state:       ITEM_STATES.CONFIRMED,
    provenance:  ITEM_PROVENANCE.DOCUMENT,
    document_id: documentId,
  }
}

// ─── Display metadata ─────────────────────────────────────────────────────────

/**
 * Maps each state to its brand color token and human label.
 * Matches the five-state spec: Confirmed, Pending, Missing, Flagged, Unknown.
 */
export const STATE_META = {
  [ITEM_STATES.CONFIRMED]: { color: '#1D9E75', token: 'present',   label: 'Confirmed' },
  [ITEM_STATES.PENDING]:   { color: '#B8860B', token: 'gold',      label: 'Pending'   },
  [ITEM_STATES.MISSING]:   { color: '#E24B4A', token: 'stamp',     label: 'Missing'   },
  [ITEM_STATES.FLAGGED]:   { color: '#378ADD', token: 'flagged',   label: 'Flagged'   },
  [ITEM_STATES.UNKNOWN]:   { color: '#888780', token: 'unknown',   label: 'Unknown'   },
}

export const TYPE_META = {
  [ITEM_TYPES.DOCUMENT]:   { label: 'Document'   },
  [ITEM_TYPES.EVENT]:      { label: 'Event'      },
  [ITEM_TYPES.ASSET]:      { label: 'Asset'      },
  [ITEM_TYPES.DEBT]:       { label: 'Liability'  },
  [ITEM_TYPES.KNOWN_FACT]: { label: 'Known fact' },
}

// ─── Conflict shape (used when state = 'flagged') ─────────────────────────────

/**
 * @typedef {Object} ConflictPayload
 * @property {string} declared_account  — what the heir stated
 * @property {string} document_account  — what the document shows
 */

/**
 * Validates a conflict payload before writing to the DB.
 * @param {ConflictPayload} conflict
 */
export function validateConflict(conflict) {
  if (!conflict || typeof conflict !== 'object') throw new Error('conflict must be an object')
  if (!conflict.declared_account) throw new Error('conflict.declared_account is required')
  if (!conflict.document_account) throw new Error('conflict.document_account is required')
}

// ─── DB row → JS shape (for API responses) ───────────────────────────────────

/**
 * Normalises a raw DB row from case_items into the canonical JS shape.
 * Ensures arrays and JSONB fields are never null.
 */
export function normaliseItem(row) {
  return {
    id:              row.id,
    case_id:         row.case_id,
    created_at:      row.created_at,
    updated_at:      row.updated_at,
    item_type:       row.item_type,
    state:           row.state,
    provenance:      row.provenance,
    title:           row.title,
    summary:         row.summary ?? null,
    item_date:       row.item_date ?? null,
    value_cents:     row.value_cents ?? null,
    value_currency:  row.value_currency ?? 'USD',
    conflict:        row.conflict ?? null,
    linked_item_ids: row.linked_item_ids ?? [],
    document_id:     row.document_id ?? null,
    jurisdiction:    row.jurisdiction ?? null,
  }
}
