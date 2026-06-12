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
