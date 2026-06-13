const STATUS_INDICATORS = {
  green: { symbol: '✓', className: 'text-green' },
  gold: { symbol: '◷', className: 'text-gold' },
  red: { symbol: '!', className: 'text-red' },
}

export default function GapMap({ gapMap }) {
  return (
    <section>
      <h2 className="font-serif text-lg text-navy mb-2">What's still needed</h2>
      <ul className="space-y-3">
        {gapMap.map((item) => {
          const indicator = STATUS_INDICATORS[item.status]
          return (
            <li key={item.type} className="bg-gray rounded p-4">
              <div className="flex items-start gap-2">
                <span className={`font-semibold ${indicator.className}`} aria-hidden="true">
                  {indicator.symbol}
                </span>
                <div>
                  <p className="text-ink font-semibold">{item.name}</p>
                  <p className="text-sm text-ink mt-1">{item.why}</p>
                  <p className="text-sm text-ink mt-1">{item.where}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
