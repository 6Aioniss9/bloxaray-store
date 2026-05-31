import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const ADMIN_API_KEY = process.env.ADMIN_API_KEY

export async function requireAdmin(request?: Request) {
  // Allow API key auth for server-to-server (Discord bot)
  if (request && ADMIN_API_KEY) {
    const apiKey = request.headers.get('x-api-key')
    if (apiKey && apiKey === ADMIN_API_KEY) {
      return { session: null }
    }
  }

  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!session.user.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return { session }
}
