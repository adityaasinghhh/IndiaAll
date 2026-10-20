import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const outputDir = join(__dirname, '..', 'public', 'images', 'products')

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true })

const categoryColors = {
  energy: { from: '#0B1F3A', to: '#1F3A5F', accent: '#C9A24B' },
  agriculture: { from: '#0E8A8A', to: '#0a6b6b', accent: '#C9A24B' },
  metals: { from: '#C9A24B', to: '#a8873a', accent: '#0B1F3A' },
}

const products = [
  { slug: 'crude-oil', name: 'Crude Oil', category: 'energy', abbr: 'CO' },
  { slug: 'gasoline', name: 'Gasoline', category: 'energy', abbr: 'G' },
  { slug: 'bitumen', name: 'Bitumen', category: 'energy', abbr: 'B' },
  { slug: 'aviation-fuel', name: 'Aviation Fuel', category: 'energy', abbr: 'AF' },
  { slug: 'diesel-en590', name: 'Diesel EN590', category: 'energy', abbr: 'D' },
  { slug: 'dap', name: 'DAP', category: 'energy', abbr: 'DAP' },
  { slug: 'd6', name: 'D6', category: 'energy', abbr: 'D6' },
  { slug: 'lng-lpg', name: 'LNG/LPG', category: 'energy', abbr: 'LNG' },
  { slug: 'petcoke', name: 'Petcoke', category: 'energy', abbr: 'PC' },
  { slug: 'sulphur', name: 'Sulphur', category: 'energy', abbr: 'S' },
  { slug: 'urea', name: 'Urea', category: 'energy', abbr: 'U' },
  { slug: 'npk', name: 'NPK', category: 'energy', abbr: 'NPK' },
  { slug: 'sugar', name: 'Sugar', category: 'agriculture', abbr: 'S' },
  { slug: 'soybean', name: 'Soybean', category: 'agriculture', abbr: 'SB' },
  { slug: 'wheat', name: 'Wheat', category: 'agriculture', abbr: 'W' },
  { slug: 'olive-oil', name: 'Olive Oil', category: 'agriculture', abbr: 'OO' },
  { slug: 'corn', name: 'Corn', category: 'agriculture', abbr: 'C' },
  { slug: 'sunflower-oil', name: 'Sunflower Oil', category: 'agriculture', abbr: 'SO' },
  { slug: 'indian-rice', name: 'Indian Rice', category: 'agriculture', abbr: 'IR' },
  { slug: 'lentils', name: 'Lentils', category: 'agriculture', abbr: 'L' },
  { slug: 'palm-oil', name: 'Palm Oil', category: 'agriculture', abbr: 'PO' },
  { slug: 'rapeseed-oil', name: 'Rapeseed Oil', category: 'agriculture', abbr: 'RO' },
  { slug: 'chicken', name: 'Chicken', category: 'agriculture', abbr: 'CH' },
  { slug: 'beef', name: 'Beef', category: 'agriculture', abbr: 'BF' },
  { slug: 'pork', name: 'Pork', category: 'agriculture', abbr: 'PK' },
  { slug: 'aluminium-ingot', name: 'Aluminium Ingot', category: 'metals', abbr: 'AL' },
  { slug: 'copper-cathodes', name: 'Copper Cathodes', category: 'metals', abbr: 'CU' },
  { slug: 'gold-bars', name: 'Gold Bars', category: 'metals', abbr: 'AU' },
  { slug: 'copper-wire-scrap', name: 'Copper Wire Scrap', category: 'metals', abbr: 'CW' },
  { slug: 'coal', name: 'Coal', category: 'metals', abbr: 'CL' },
  { slug: 'manganese', name: 'Manganese', category: 'metals', abbr: 'MN' },
  { slug: 'ubc-aluminium-scrap', name: 'UBC Aluminium Scrap', category: 'metals', abbr: 'UBC' },
]

function generateSvg(product) {
  const colors = categoryColors[product.category]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.from}"/>
      <stop offset="100%" style="stop-color:${colors.to}"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <rect width="800" height="600" fill="url(#grid)"/>
  <text x="400" y="280" font-family="Georgia, serif" font-size="120" font-weight="bold" fill="${colors.accent}" text-anchor="middle" opacity="0.9">${product.abbr}</text>
  <text x="400" y="380" font-family="Inter, sans-serif" font-size="28" fill="rgba(255,255,255,0.7)" text-anchor="middle">${product.name}</text>
  <rect x="20" y="20" width="760" height="560" rx="8" fill="none" stroke="${colors.accent}" stroke-width="2" opacity="0.3"/>
</svg>`
}

let count = 0
for (const product of products) {
  const svg = generateSvg(product)
  const filePath = join(outputDir, `${product.slug}.svg`)
  writeFileSync(filePath, svg)
  count++
  console.log(`Generated: ${product.slug}.svg`)
}

console.log(`\nDone! Generated ${count} product images in ${outputDir}`)
