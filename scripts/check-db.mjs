import Database from 'better-sqlite3'

const dbPath = 'C:\\Users\\leona\\Downloads\\aioniss-store-design\\prisma\\dev.db'
const db = new Database(dbPath)
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
console.log('Tables:', JSON.stringify(tables))
db.close()
