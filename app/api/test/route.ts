import { NextResponse } from 'next/server'
import { sanitizeInput, createOrderSchema } from '@/lib/security'

export async function GET() {
  try {
    const r = createOrderSchema.safeParse({ items: [{ fruitId: 'a', name: 'b', price: 10, quantity: 1 }], total: 10, customerName: 'Test', customerEmail: 'test@test.com', customerRoblox: 'test', customerDiscord: 'test', paymentMethod: 'yape' })
    const s = sanitizeInput('<script>alert(1)</script>')
    return NextResponse.json({ ok: true, valid: r.success, sanitized: s })
  } catch(e: any) {
    return NextResponse.json({ error: e?.message || 'unknown', stack: e?.stack?.substring(0,500) || '' }, { status: 500 })
  }
}
