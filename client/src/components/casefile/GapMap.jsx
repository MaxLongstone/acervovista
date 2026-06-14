const STATUS = {
  green: { color: 'bg-present', label: 'Present' },
  gold:  { color: 'bg-gold',    label: 'Pending' },
  red:   { color: 'bg-stamp',   label: 'Missing' },
}

export default function GapMap({ gapMap }) {
  if (!gapMap.length) return null

  return (
    <section>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-4">
        Document Checklist
      </h2>
      <ul className="space-y-3">
        {gapMap.map((item, i) => {
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
    </section>
  )
}
