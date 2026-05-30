'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { sanitizeInput, validateEmail } from '@/lib/security'

export type OrderItem = {
  fruitId: string
  name: string
  price: number
  priceUSD: number
  quantity: number
}

type CreateOrderInput = {
  items: OrderItem[]
  total: number
  totalUSD: number
  paymentMethod: string
  customerName: string
  customerEmail: string
  customerRoblox: string
  customerDiscord: string
  customerNotes?: string
}

export async function createOrder(input: CreateOrderInput) {
  const name = sanitizeInput(input.customerName)
  const email = sanitizeInput(input.customerEmail)
  const roblox = sanitizeInput(input.customerRoblox)
  const discord = sanitizeInput(input.customerDiscord)
  const notes = input.customerNotes ? sanitizeInput(input.customerNotes) : null

  if (!name || name.length < 2) throw new Error('Nombre requerido (mín. 2 caracteres)')
  if (!validateEmail(email)) throw new Error('Email inválido')
  if (!roblox || roblox.length < 2) throw new Error('Usuario de Roblox requerido')
  if (!discord || discord.length < 2) throw new Error('Usuario de Discord requerido')

  const validMethods = ['mercadopago', 'yape', 'plin', 'binance']
  if (!validMethods.includes(input.paymentMethod)) {
    throw new Error('Método de pago inválido')
  }

  for (const item of input.items) {
    const fruit = await prisma.fruit.findUnique({ where: { id: item.fruitId } })
    if (!fruit) throw new Error(`Fruta ${item.name} no encontrada`)
    if (fruit.stock < item.quantity) throw new Error(`Stock insuficiente para ${item.name}`)
    if (fruit.price !== item.price) throw new Error(`Precio modificado para ${item.name}`)
  }

  const serverTotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  if (Math.abs(serverTotal - input.total) > 0.01) throw new Error('Total inválido')

  const order = await prisma.order.create({
    data: {
      items: JSON.stringify(input.items),
      total: serverTotal,
      totalUSD: input.totalUSD,
      status: input.paymentMethod === 'mercadopago' ? 'pending_payment' : 'pending_manual_review',
      paymentMethod: input.paymentMethod,
      customerName: name,
      customerEmail: email,
      customerRoblox: roblox,
      customerDiscord: discord,
      customerNotes: notes,
    },
  })

  revalidatePath('/admin')
  return order
}

export async function getOrders() {
  return prisma.order.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({ where: { id } })
}

export async function updateOrderStatus(id: string, status: string) {
  const valid = ['pending_payment', 'paid', 'pending_manual_review', 'delivered', 'cancelled', 'refunded']
  if (!valid.includes(status)) throw new Error('Estado inválido')

  await prisma.order.update({ where: { id }, data: { status } })
  revalidatePath('/admin')
}

export async function markOrderPaid(id: string, paymentId: string) {
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new Error('Pedido no encontrado')

  const items: OrderItem[] = JSON.parse(order.items)
  for (const item of items) {
    await prisma.fruit.update({
      where: { id: item.fruitId },
      data: { stock: { decrement: item.quantity } },
    })
  }

  await prisma.order.update({
    where: { id },
    data: { status: 'paid', paymentId },
  })

  revalidatePath('/admin')
  revalidatePath('/stock')
}
