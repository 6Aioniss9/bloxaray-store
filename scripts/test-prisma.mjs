import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
const p = new PrismaClient({ adapter })

try {
  const r = await p.fruit.findMany()
  console.log('OK:', r.length)
} catch (e) {
  console.log('ERROR:', String(e))
}
await p.$disconnect()
