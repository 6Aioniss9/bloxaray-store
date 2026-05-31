import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateCsrfToken } from '@/lib/csrf'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const token = generateCsrfToken()

  const response = NextResponse.json({ token })

  response.headers.set(
    'Set-Cookie',
    `csrf_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=7200${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  )

  return response
}
