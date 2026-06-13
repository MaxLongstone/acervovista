import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeGapMap } from './gapMap.js'

const RECENT = new Date().toISOString()
const OLD = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()

test('testate case requires will in addition to the intestate set', () => {
  const gapMap = computeGapMap({ hasWill: 'yes', createdAt: RECENT, documentTypes: [] })
  assert.deepEqual(gapMap.map((item) => item.type), [
    'death_certificate',
    'will',
    'letters_testamentary',
    'court_filing',
  ])
})

test('intestate case does not require a will', () => {
  const gapMap = computeGapMap({ hasWill: 'no', createdAt: RECENT, documentTypes: [] })
  assert.deepEqual(gapMap.map((item) => item.type), [
    'death_certificate',
    'letters_testamentary',
    'court_filing',
  ])
})

test('a classified document marks its type green', () => {
  const gapMap = computeGapMap({
    hasWill: 'yes',
    createdAt: RECENT,
    documentTypes: ['death_certificate'],
  })
  const deathCert = gapMap.find((item) => item.type === 'death_certificate')
  assert.equal(deathCert.status, 'green')
})

test('an unknown-classified document does not count toward a requirement', () => {
  const gapMap = computeGapMap({
    hasWill: 'yes',
    createdAt: RECENT,
    documentTypes: ['unknown'],
  })
  const deathCert = gapMap.find((item) => item.type === 'death_certificate')
  assert.equal(deathCert.status, 'gold')
})

test('missing documents are gold for a recent case', () => {
  const gapMap = computeGapMap({ hasWill: 'yes', createdAt: RECENT, documentTypes: [] })
  assert.ok(gapMap.every((item) => item.status === 'gold'))
})

test('missing documents are red once the case is more than 14 days old', () => {
  const gapMap = computeGapMap({ hasWill: 'yes', createdAt: OLD, documentTypes: [] })
  assert.ok(gapMap.every((item) => item.status === 'red'))
})

test('each item includes a plain-language name, why, and where', () => {
  const gapMap = computeGapMap({ hasWill: 'yes', createdAt: RECENT, documentTypes: [] })
  for (const item of gapMap) {
    assert.equal(typeof item.name, 'string')
    assert.equal(typeof item.why, 'string')
    assert.equal(typeof item.where, 'string')
  }
})
