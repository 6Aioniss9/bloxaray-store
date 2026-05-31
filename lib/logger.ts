type Level = 'info' | 'warn' | 'error' | 'debug'

const LEVELS: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const CURRENT_LEVEL: number = process.env.NODE_ENV === 'production' ? LEVELS.info : LEVELS.debug

function sanitize(msg: string): string {
  return msg.replace(/(?:sk-[a-zA-Z0-9]{20,}|[A-Za-z0-9_-]{20,})(?:\.[A-Za-z0-9_-]{20,})?/g, '[REDACTED]')
}

function log(level: Level, context: string, message: string, meta?: Record<string, unknown>) {
  if (LEVELS[level] < CURRENT_LEVEL) return
  const ts = new Date().toISOString()
  const safeMsg = sanitize(message)
  const prefix = `[${ts}] [${level.toUpperCase()}] [${context}]`
  if (meta) {
    console[level](prefix, safeMsg, JSON.stringify(meta))
  } else {
    console[level](prefix, safeMsg)
  }
}

export const logger = {
  debug: (ctx: string, msg: string, meta?: Record<string, unknown>) => log('debug', ctx, msg, meta),
  info: (ctx: string, msg: string, meta?: Record<string, unknown>) => log('info', ctx, msg, meta),
  warn: (ctx: string, msg: string, meta?: Record<string, unknown>) => log('warn', ctx, msg, meta),
  error: (ctx: string, msg: string, meta?: Record<string, unknown>) => log('error', ctx, msg, meta),
}
