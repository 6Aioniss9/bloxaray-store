import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { fruits } from '../lib/fruits'

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log(`Seeding ${fruits.length} fruits...`)

  for (const f of fruits) {
    await prisma.fruit.upsert({
      where: { id: f.id },
      update: {
        name: f.name,
        image: f.image,
        price: f.price,
        priceUSD: f.priceUSD,
        stock: f.stock,
        rarity: f.rarity,
        blurb: f.blurb,
        featured: f.featured ?? false,
      },
      create: {
        id: f.id,
        name: f.name,
        image: f.image,
        price: f.price,
        priceUSD: f.priceUSD,
        stock: f.stock,
        rarity: f.rarity,
        blurb: f.blurb,
        featured: f.featured ?? false,
      },
    })
  }

  const count = await prisma.fruit.count()
  console.log(`Done. ${count} fruits in database.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
