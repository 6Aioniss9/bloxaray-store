import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!session.user.isAdmin) {
    console.warn('[ADMIN] Access denied for user:', (session.user as any).discordId ?? 'unknown')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return { session }
}
