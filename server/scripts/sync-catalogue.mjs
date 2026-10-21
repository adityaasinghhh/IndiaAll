#!/usr/bin/env node
/**
 * Keep the backend copy of the static product catalogue in step with the
 * frontend copy.
 *
 * Why this exists
 * ---------------
 * The frontend and the backend are two separate Vercel Services. Vercel builds
 * each service from its own root directory (`client/` and `server/`), so a
 * file that lives in `client/` is NOT available to the backend at build time
 * or at runtime. The chat assistant needs the catalogue, so the backend keeps
 * its own copy under `server/src/data/`.
 *
 * Usage
 * -----
 *   node scripts/sync-catalogue.mjs          # write server/src/data/products.js
 *   node scripts/sync-catalogue.mjs --check  # exit 1 if the copy is out of date
 *
 * Run it from the repository root or from the `server/` folder.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_URL = new URL('../../client/src/data/products.js', import.meta.url)
const TARGET_URL = new URL('../src/data/products.js', import.meta.url)

const HEADER = `// AUTO-GENERATED FILE - DO NOT EDIT BY HAND.
//
// Source of truth: client/src/data/products.js
// Regenerate with: npm run sync:catalogue --prefix server
// Verify with:     npm run sync:catalogue:check --prefix server
//
// The frontend and the backend are separate Vercel Services and are built
// from their own root directories, so the backend cannot import files that
// live under client/.

`

const checkOnly = process.argv.includes('--check')

const source = await readFile(SOURCE_URL, 'utf8')
const expected = HEADER + source

let current = null
try {
  current = await readFile(TARGET_URL, 'utf8')
} catch {
  current = null
}

if (current === expected) {
  console.log('Catalogue is already in sync: server/src/data/products.js')
  process.exit(0)
}

if (checkOnly) {
  console.error(
    'Catalogue is OUT OF SYNC: server/src/data/products.js does not match client/src/data/products.js.\n' +
      'Run: npm run sync:catalogue --prefix server',
  )
  process.exit(1)
}

await mkdir(dirname(fileURLToPath(TARGET_URL)), { recursive: true })
await writeFile(TARGET_URL, expected, 'utf8')
console.log(
  `Catalogue synced: ${fileURLToPath(SOURCE_URL)} -> ${fileURLToPath(TARGET_URL)}`,
)
