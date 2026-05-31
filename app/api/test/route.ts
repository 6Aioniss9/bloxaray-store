import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderNotification } from '@/lib/discord-webhook'

export async function GET() {
  try {
    const count = await prisma.fruit.count()
    return NextResponse.json({ ok: true, fruits: count })
  } catch(e: any) {
    return NextResponse.json({ error: e?.message || 'fail' }, { status: 500 })
  }
}
