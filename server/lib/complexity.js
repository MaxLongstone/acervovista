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
