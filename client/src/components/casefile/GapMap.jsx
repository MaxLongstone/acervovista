import { useEffect, useRef } from 'react'

const STATUS = {
  green:    { color: 'bg-present', label: 'Present' },
  gold:     { color: 'bg-gold',    label: 'Pending' },
  red:      { color: 'bg-stamp',   label: 'Missing' },
  optional: { color: 'bg-parchment-deep', label: 'Recommended' },
}

// Death certificate type keys that may appear in the gap map
const DEATH_CERT_TYPES = ['death_certificate', 'death-certificate', 'death_cert']

export default function GapMap({ gapMap, onBreathTrigger }) {
  const triggered = useRef(false)

  useEffect(() => {
    if (triggered.current) return
    const deathCertMissing = gapMap.some(
      (item) => DEATH_CERT_TYPES.includes(item.type) && item.status === 'red'
    )
    if (deathCertMissing) {
      triggered.current = true
      onBreathTrigger?.('death-cert-missing')
    }
  }, [gapMap, onBreathTrigger])

  if (!gapMap.length) return null

  const required = gapMap.filter((item) => item.required !== false)
  const optional = gapMap.filter((item) => item.required === false)

  return (
    <section className="space-y-6">
      {/* Required documents */}
      <div>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-4">
          Document Checklist
        </h2>
        <ul className="space-y-3">
          {required.map((item, i) => {
            const s = STATUS[item.status]
            return (
              <li
                key={item.type}
                className="bg-white border border-parchment-deep rounded-md p-4 animate-unfurl"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${s.color}`}
                    title={s.label}
                  />
                  <div>
                    <p className="text-sm font-medium text-navy leading-snug">{item.name}</p>
                    {item.status !== 'green' && (
                      <>
                        <p className="text-[13px] text-ink-mid mt-1 leading-[1.6] italic">{item.why}</p>
                        <p className="text-[13px] text-ink-mid mt-1 leading-[1.6]">{item.where}</p>
                      </>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Optional / recommended documents */}
      {optional.length > 0 && (
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-4">
            Also Worth Gathering
          </h2>
          <ul className="space-y-3">
            {optional.map((item, i) => (
              <li
                key={item.type}
                className="bg-white border border-parchment-deep rounded-md p-4 animate-unfurl"
                style={{ animationDelay: `${(required.length + i) * 80}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 w-2.5 h-2.5 rounded-full shrink-0 bg-parchment-deep border border-ink-light"
                    title="Recommended"
                  />
                  <div>
                    <p className="text-sm font-medium text-navy leading-snug">{item.name}</p>
                    <p className="text-[13px] text-ink-mid mt-1 leading-[1.6] italic">{item.why}</p>
                    <p className="text-[13px] text-ink-mid mt-1 leading-[1.6]">{item.where}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
