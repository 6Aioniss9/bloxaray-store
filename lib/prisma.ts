import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import * as fs from 'fs'
import * as path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDbUrl(): string {
  if (process.env.VERCEL) {
    const tmpDb = '/tmp/dev.db'
    if (!fs.existsSync(tmpDb)) {
      const src = path.join(process.cwd(), 'prisma', 'dev.db')
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, tmpDb)
      }
    }
    return `file:${tmpDb}`
  }
  return process.env.DATABASE_URL || 'file:./prisma/dev.db'
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({
    url: getDbUrl(),
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
