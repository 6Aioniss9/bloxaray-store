import DOMPurify from 'isomorphic-dompurify'
import { z } from 'zod'

// ── Sanitization ──

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] })
}

export function sanitizeMessage(input: string): string {
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  })
}

// ── Validation schemas (Zod) ──

const emailSchema = z.string().email('Email inválido').max(255)
const nameSchema = z.string().min(2, 'Mín. 2 caracteres').max(100).trim()
const robloxSchema = z.string().min(2, 'Usuario de Roblox requerido').max(50).trim()
const discordSchema = z.string().min(2, 'Usuario de Discord requerido').max(50).trim()
const notesSchema = z.string().max(1000).trim().optional()
const priceSchema = z.number().positive('Precio debe ser positivo').max(100000)
const quantitySchema = z.number().int('Cantidad debe ser entero').min(1, 'Mín. 1 unidad').max(999, 'Máx. 999 unidades')

export const orderItemSchema = z.object({
  fruitId: z.string().min(1),
  name: z.string().min(1),
  price: priceSchema,
  priceUSD: z.number().positive().optional(),
  quantity: quantitySchema,
})

export const customerSchema = z.object({
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerRoblox: robloxSchema,
  customerDiscord: discordSchema,
  customerNotes: notesSchema,
})

export const createPreferenceSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Carrito vacío'),
  total: priceSchema,
  totalUSD: z.number().positive().optional(),
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerRoblox: robloxSchema,
  customerDiscord: discordSchema,
  customerNotes: notesSchema,
  paymentMethod: z.enum(['mercadopago', 'yape', 'plin', 'binance']).optional(),
})

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Carrito vacío'),
  total: priceSchema,
  totalUSD: z.number().positive().optional(),
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerRoblox: robloxSchema,
  customerDiscord: discordSchema,
  customerNotes: notesSchema,
  paymentMethod: z.enum(['mercadopago', 'yape', 'plin', 'binance']),
})

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  role: z.enum(['user', 'agent', 'bot']),
  type: z.enum(['text', 'image', 'audio']).default('text'),
  content: z.string().min(1).max(5000),
})

// ── Validation helpers ──

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function validatePrice(price: number): boolean {
  return priceSchema.safeParse(price).success
}

export function validateStock(stock: number): boolean {
  return z.number().int().min(0).max(99999).safeParse(stock).success
}

// ── Secure JSON parse ──

export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

// ── Request body size limiter ──

export const MAX_BODY_SIZE = 100 * 1024 // 100KB
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 // 5MB

export function validateBodySize(text: string, max = MAX_BODY_SIZE): boolean {
  return new TextEncoder().encode(text).length <= max
}

// ── Content type guard ──

export function expectJson(request: Request): boolean {
  const ct = request.headers.get('content-type') || ''
  return ct.includes('application/json')
}
