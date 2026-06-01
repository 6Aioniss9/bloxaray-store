/**
 * Smoke test for fruit catalog data integrity.
 * Run: npx tsx scripts/test-fruits.mjs
 */

import { fruits } from '../lib/fruits.ts'

let errors = 0

const rarities = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical']
const validIds = new Set()

for (const f of fruits) {
  if (!f.id || typeof f.id !== 'string') {
    console.error(`FAIL: Fruit missing or invalid 'id'`)
    errors++
  } else if (validIds.has(f.id)) {
    console.error(`FAIL: Duplicate id '${f.id}'`)
    errors++
  } else {
    validIds.add(f.id)
  }

  if (!f.name || typeof f.name !== 'string') {
    console.error(`FAIL: Fruit ${f.id || '?'} missing 'name'`)
    errors++
  }
  if (typeof f.price !== 'number' || f.price <= 0) {
    console.error(`FAIL: ${f.id} invalid 'price': ${f.price}`)
    errors++
  }
  if (typeof f.priceUSD !== 'number' || f.priceUSD <= 0) {
    console.error(`FAIL: ${f.id} invalid 'priceUSD': ${f.priceUSD}`)
    errors++
  }
  if (typeof f.stock !== 'number' || f.stock < 0) {
    console.error(`FAIL: ${f.id} invalid 'stock': ${f.stock}`)
    errors++
  }
  if (!rarities.includes(f.rarity)) {
    console.error(`FAIL: ${f.id} invalid 'rarity': '${f.rarity}'`)
    errors++
  }
  if (!f.image || typeof f.image !== 'string') {
    console.error(`FAIL: ${f.id} missing 'image'`)
    errors++
  }
  if (!f.blurb || typeof f.blurb !== 'string') {
    console.error(`FAIL: ${f.id} missing 'blurb'`)
    errors++
  }
}

const total = fruits.length
console.log(`\nChecked ${total} fruits. Errors: ${errors}`)

if (errors > 0) {
  process.exit(1)
} else {
  console.log('All fruit data is valid.')
}
