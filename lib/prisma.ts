import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import * as fs from 'fs'
import * as path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function ensureDbInTemp(): string {
  const tmpDb = '/tmp/dev.db'
  if (fs.existsSync(tmpDb)) return `file:${tmpDb}`
  const candidates = [
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(__dirname, '..', 'prisma', 'dev.db'),
  ]
  for (const src of candidates) {
    if (fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, tmpDb)
        return `file:${tmpDb}`
      } catch { /* continue */ }
    }
  }
  return `file:${tmpDb}`
}

function getDbUrl(): string {
  if (process.env.VERCEL) return ensureDbInTemp()
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
