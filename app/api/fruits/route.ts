import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const fruits = await prisma.fruit.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(fruits)
  } catch {
    return NextResponse.json({ error: 'Error al obtener frutas' }, { status: 500 })
  }
}
