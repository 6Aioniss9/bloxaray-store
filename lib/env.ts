import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_DISCORD_ID: z.string().optional(),
  AUTH_DISCORD_SECRET: z.string().optional(),
  ADMIN_IDS: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_PUBLIC_KEY: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
})

let parsed: Record<string, string | undefined> | null = null

export function getEnv() {
  if (!parsed) {
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      const msg = Object.entries(errors)
        .map(([key, val]) => `  ${key}: ${val?.join(', ')}`)
        .join('\n')
      console.error('[ENV] Variables de entorno inválidas o faltantes:\n' + msg)
    }
    parsed = (result.success ? result.data : process.env) as Record<string, string | undefined>
  }
  return parsed
}

export function isProduction() {
  return getEnv().NODE_ENV === 'production'
}
