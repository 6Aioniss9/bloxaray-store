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

  const reviews = [
    { name: 'ShadowKing', handle: '@shadowk', rating: 5, text: 'Consegui mi Kitsune en literalmente 4 minutos. Proceso rapido y soporte muy amable. 10/10.' },
    { name: 'LunaPvP', handle: '@lunapvp', rating: 5, text: 'Estaba nervioso comprando frutas fisicas pero BLOXARAY es legitimo. Dragon entregado al instante.' },
    { name: 'Kaizen', handle: '@kaizen_rblx', rating: 5, text: 'Los mejores precios que encontre en cualquier lado y el stock siempre es preciso. Ya volvi dos veces.' },
    { name: 'Mara', handle: '@maraplays', rating: 5, text: 'Pague con Yape y recibi mi Leopard al instante. Limpio, rapido y confiable.' },
    { name: 'Vortex', handle: '@vortexgg', rating: 4, text: 'Gran experiencia en general. El soporte respondio todas mis dudas antes de comprar Buddha.' },
  ]

  console.log(`Seeding ${reviews.length} reviews...`)
  for (const r of reviews) {
    await prisma.review.upsert({
      where: { handle: r.handle },
      update: { name: r.name, rating: r.rating, text: r.text },
      create: { name: r.name, handle: r.handle, rating: r.rating, text: r.text },
    })
  }

  const reviewCount = await prisma.review.count()
  console.log(`Done. ${reviewCount} reviews in database.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
