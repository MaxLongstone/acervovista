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
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
