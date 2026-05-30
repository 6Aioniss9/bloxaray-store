'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { validatePrice, validateStock, sanitizeInput } from '@/lib/security'

export async function getFruits() {
  return prisma.fruit.findMany({ orderBy: { name: 'asc' } })
}

export async function getFruitById(id: string) {
  return prisma.fruit.findUnique({ where: { id } })
}

export async function getFeaturedFruits() {
  return prisma.fruit.findMany({ where: { featured: true }, take: 4 })
}

export async function updateStock(id: string, stock: number) {
  if (!validateStock(stock)) throw new Error('Stock inválido')

  await prisma.fruit.update({
    where: { id },
    data: { stock },
  })

  revalidatePath('/stock')
  revalidatePath('/admin')
}

export async function updatePrice(id: string, price: number, priceUSD: number) {
  if (!validatePrice(price) || !validatePrice(priceUSD)) throw new Error('Precio inválido')

  await prisma.fruit.update({
    where: { id },
    data: { price, priceUSD },
  })

  revalidatePath('/stock')
  revalidatePath('/admin')
}

export async function updateBlurb(id: string, blurb: string) {
  const clean = sanitizeInput(blurb)

  await prisma.fruit.update({
    where: { id },
    data: { blurb: clean },
  })

  revalidatePath('/stock')
}
