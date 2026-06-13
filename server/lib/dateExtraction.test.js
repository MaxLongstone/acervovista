import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractEarliestDate } from './dateExtraction.js'

test('extracts MM/DD/YYYY', () => {
  assert.equal(extractEarliestDate('Date of Death: 03/14/2019'), '2019-03-14')
})

test('extracts Month DD, YYYY', () => {
  assert.equal(extractEarliestDate('Executed this 14th day, March 14, 2019'), '2019-03-14')
})

test('treats first number > 12 as a day (DD/MM/YYYY)', () => {
  assert.equal(extractEarliestDate('Filed 25/03/2019'), '2019-03-25')
})

test('returns the earliest date when multiple are present', () => {
  const text = 'Filed 06/01/2020. Originally executed March 14, 2019. Recorded 01/05/2021.'
  assert.equal(extractEarliestDate(text), '2019-03-14')
})

test('returns null when no date is found', () => {
  assert.equal(extractEarliestDate('No dates here'), null)
})
