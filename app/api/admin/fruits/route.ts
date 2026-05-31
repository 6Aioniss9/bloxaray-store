import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'

const updateSchema = z.object({
  id: z.string(),
  price: z.number().positive().optional(),
  priceUSD: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  blurb: z.string().min(1).max(500).optional(),
  featured: z.boolean().optional(),
  rarity: z.enum(['Common', 'Rare', 'Legendary', 'Mythical']).optional(),
  name: z.string().min(1).max(100).optional(),
  image: z.string().min(1).optional(),
})

const createSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  image: z.string().min(1),
  price: z.number().positive(),
  priceUSD: z.number().positive(),
  stock: z.number().int().min(0),
  rarity: z.enum(['Common', 'Rare', 'Legendary', 'Mythical']),
  blurb: z.string().min(1).max(500),
  featured: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await requireAdmin()
    if (session instanceof Response) return session

    const fruits = await prisma.fruit.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(fruits)
  } catch {
    return NextResponse.json({ error: 'Error al obtener frutas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    if (session instanceof Response) return session

    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const fruit = await prisma.fruit.create({ data: parsed.data })
    return NextResponse.json(fruit, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear fruta' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdmin()
    if (session instanceof Response) return session

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const { id, ...data } = parsed.data
    const fruit = await prisma.fruit.update({ where: { id }, data })
    return NextResponse.json(fruit)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar fruta' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin()
    if (session instanceof Response) return session

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    await prisma.fruit.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar fruta' }, { status: 500 })
  }
}
