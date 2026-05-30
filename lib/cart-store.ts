'use client'

export type CartItem = {
  fruitId: string
  name: string
  image: string
  price: number
  priceUSD: number
  quantity: number
  maxStock: number
}

const STORAGE_KEY = 'bloxaray-cart'

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }))
}

export function getCart(): CartItem[] {
  return readCart()
}

export function addToCart(item: Omit<CartItem, 'quantity'> & { quantity?: number }) {
  const cart = readCart()
  const idx = cart.findIndex((i) => i.fruitId === item.fruitId)
  if (idx >= 0) {
    const newQty = cart[idx].quantity + (item.quantity ?? 1)
    cart[idx].quantity = Math.min(newQty, cart[idx].maxStock)
  } else {
    cart.push({ ...item, quantity: item.quantity ?? 1 })
  }
  writeCart(cart)
  return cart
}

export function updateQuantity(fruitId: string, quantity: number) {
  const cart = readCart()
  const idx = cart.findIndex((i) => i.fruitId === fruitId)
  if (idx >= 0) {
    cart[idx].quantity = Math.max(1, Math.min(quantity, cart[idx].maxStock))
  }
  writeCart(cart)
  return cart
}

export function removeFromCart(fruitId: string) {
  const cart = readCart().filter((i) => i.fruitId !== fruitId)
  writeCart(cart)
  return cart
}

export function clearCart() {
  writeCart([])
}

export function getCartTotal(cart: CartItem[]) {
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalUSD = cart.reduce((sum, i) => sum + i.priceUSD * i.quantity, 0)
  return { total, totalUSD }
}

export function getCartCount(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.quantity, 0)
}
