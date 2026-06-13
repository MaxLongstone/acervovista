import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyDocument } from './classification.js'

test('classifies a death certificate', () => {
  const text = 'STATE OF FLORIDA CERTIFICATE OF DEATH\nDate of Death: 03/14/2019'
  assert.equal(classifyDocument(text), 'death_certificate')
})

test('classifies a will', () => {
  const text = 'LAST WILL AND TESTAMENT\nI, John Smith, the Testator, do hereby bequeath...'
  assert.equal(classifyDocument(text), 'will')
})

test('classifies letters testamentary even when "circuit court" appears', () => {
  const text = 'LETTERS TESTAMENTARY\nIssued by the Circuit Court, the Personal Representative...'
  assert.equal(classifyDocument(text), 'letters_testamentary')
})

test('classifies a court filing', () => {
  const text = 'IN THE CIRCUIT COURT, PROBATE DIVISION\nPETITION FOR ADMINISTRATION\nIN RE: ESTATE OF...'
  assert.equal(classifyDocument(text), 'court_filing')
})

test('falls back to unknown when nothing matches', () => {
  assert.equal(classifyDocument('A grocery receipt for milk and eggs'), 'unknown')
})

test('falls back to unknown for empty text', () => {
  assert.equal(classifyDocument(''), 'unknown')
})
