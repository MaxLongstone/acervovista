import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'tokens.json'), 'utf-8')
)

const colors = Object.fromEntries(
  Object.entries(tokens.color).map(([name, token]) => [name, token.$value])
)

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        serif:   ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm:   '4px',
        DEFAULT: '6px',
        md:   '8px',
        lg:   '12px',
        full: '9999px',
      },
      transitionDuration: {
        swift:  '150',
        settle: '250',
        unfurl: '400',
        page:   '300',
      },
    },
  },
  plugins: [],
}
