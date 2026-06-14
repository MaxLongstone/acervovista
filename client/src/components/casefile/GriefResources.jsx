// LATAM detection: show Spanish resource if any heir lives outside the US,
// or if stateOfDomicile is a non-US territory indicator
function isLatamFamily(heirs = [], stateOfDomicile = '') {
  const usStatePattern = /^(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|Puerto Rico|Guam|USVI)$/i
  const heirAbroad = heirs.some((h) => h.residence && !usStatePattern.test(h.residence.trim()))
  return heirAbroad
}

const RESOURCES = [
  {
    name: 'The Grief Recovery Institute',
    url: 'https://www.griefrecoverymethod.com',
  },
  {
    name: 'National Alliance for Grieving Children',
    url: 'https://childrengrieve.org',
  },
  {
    name: 'AARP Grief and Loss Resources',
    url: 'https://www.aarp.org/home-family/friends-family/grief-loss-resources/',
  },
]

export default function GriefResources({ heirs = [], stateOfDomicile = '' }) {
  const showLatam = isLatamFamily(heirs, stateOfDomicile)

  return (
    <div className="border-t border-parchment-deep pt-6 mt-2 animate-settle">
      <h3 className="font-sans font-semibold text-sm text-navy mb-1">
        If you're finding this hard
      </h3>
      <p className="text-[13px] text-ink-mid italic leading-relaxed mb-4">
        Because of course you are. Here are some people who specialize in exactly this.
      </p>

      <ul className="space-y-2 mb-4">
        {RESOURCES.map(({ name, url }) => (
          <li key={name}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-navy underline underline-offset-2 hover:text-navy-mid
                         transition-colors duration-150"
            >
              {name}
            </a>
          </li>
        ))}

        {showLatam && (
          <li className="pt-1 border-t border-parchment-deep mt-2">
            <p className="text-sm text-ink-mid">
              <span className="font-medium text-navy">En Español:</span>{' '}
              Línea de apoyo al duelo — Cruz Roja Argentina:{' '}
              <span className="font-mono text-[13px]">0800-999-2727</span>
            </p>
          </li>
        )}
      </ul>

      <p className="text-xs text-ink-light leading-relaxed">
        These resources are provided as a courtesy. AcervoVista is not a mental health provider.
      </p>
    </div>
  )
}
