import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Auth
  AUTH_SECRET: z.string().min(16, 'AUTH_SECRET debe tener al menos 16 caracteres'),
  AUTH_DISCORD_ID: z.string().optional(),
  AUTH_DISCORD_SECRET: z.string().optional(),
  ADMIN_IDS: z.string().optional(),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL requerida'),

  // Mercado Pago
  MERCADO_PAGO_ACCESS_TOKEN: z.string().min(10, 'MERCADO_PAGO_ACCESS_TOKEN requerido'),
  MERCADO_PAGO_PUBLIC_KEY: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),

  // Site
  NEXT_PUBLIC_SITE_URL: z.string().url('NEXT_PUBLIC_SITE_URL debe ser una URL válida').optional(),
})

let parsed: z.infer<typeof envSchema> | null = null

export function getEnv() {
  if (!parsed) {
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      const msg = Object.entries(errors)
        .map(([key, val]) => `  ${key}: ${val?.join(', ')}`)
        .join('\n')
      console.error('[ENV] Variables de entorno inválidas o faltantes:\n' + msg)
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Configuración de entorno inválida')
      }
      parsed = envSchema.parse({
        ...process.env,
        MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN || 'test_fallback',
      })
    } else {
      parsed = result.data
    }
  }
  return parsed
}

export function isProduction() {
  return getEnv().NODE_ENV === 'production'
}
