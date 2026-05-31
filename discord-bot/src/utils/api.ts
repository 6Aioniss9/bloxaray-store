import { config } from '../config.js'

export type Fruit = {
  id: string
  name: string
  image: string
  price: number
  priceUSD: number
  stock: number
  rarity: string
  blurb: string
  featured?: boolean
}

export type Review = {
  name: string
  handle: string
  rating: number
  text: string
  createdAt: string
}

export type Order = {
  id: string
  items: string
  total: number
  totalUSD: number
  status: string
  paymentMethod: string | null
  customerName: string
  customerEmail: string
  customerRoblox: string
  customerDiscord: string
  customerNotes: string | null
  receiptUrl: string | null
  createdAt: string
}

type SafeResult<T> = { ok: true; data: T } | { ok: false; error: string }

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${config.apiBaseUrl}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`API ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

async function safe<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await fn()
    return { ok: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
}

export async function getFruits(): Promise<SafeResult<Fruit[]>> {
  return safe(() => fetchApi<Fruit[]>('/api/fruits'))
}

export async function getReviews(): Promise<SafeResult<Review[]>> {
  return safe(() => fetchApi<Review[]>('/api/reviews'))
}

export async function getOrders(): Promise<SafeResult<Order[]>> {
  return safe(async () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (config.adminApiKey) {
      headers['x-api-key'] = config.adminApiKey
    }
    const res = await fetchApi<{ orders: Order[] }>('/api/admin/orders', { headers })
    return res.orders
  })
}

export async function createOrder(input: {
  items: { fruitId: string; name: string; price: number; priceUSD: number; quantity: number }[]
  total: number
  totalUSD: number
  paymentMethod: string
  customerName: string
  customerEmail: string
  customerRoblox: string
  customerDiscord: string
  customerNotes?: string
}): Promise<SafeResult<{ success: boolean; orderId: string; message: string }>> {
  return safe(() =>
    fetchApi('/api/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  )
}

export async function updateOrderStatus(id: string, status: string): Promise<SafeResult<{ success: boolean }>> {
  return safe(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (config.adminApiKey) {
      headers['x-api-key'] = config.adminApiKey
    }
    return fetchApi('/api/admin/orders', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ orderId: id, status }),
    })
  })
}
