'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  getCart,
  updateQuantity,
  removeFromCart,
  getCartTotal,
  getCartCount,
  clearCart,
  type CartItem,
} from '@/lib/cart-store'

export function CartIndicator() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sync = useCallback(() => {
    setItems(getCart())
  }, [])

  useEffect(() => {
    sync()
    const handler = () => sync()
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [sync])

  const count = getCartCount(items)
  const { total, totalUSD } = getCartTotal(items)

  const handleQuantity = (fruitId: string, qty: number) => {
    updateQuantity(fruitId, qty)
    sync()
  }

  const handleRemove = (fruitId: string) => {
    removeFromCart(fruitId)
    sync()
  }

  const handleClear = () => {
    clearCart()
    sync()
  }

  const drawer = mounted ? createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            className="fixed right-0 top-0 z-[100] flex h-screen w-full flex-col bg-[#0a0a12] shadow-2xl border-l border-red-500/20 sm:w-[420px]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">Carrito</h2>
                <p className="text-xs text-zinc-500">{count} {count === 1 ? 'producto' : 'productos'}</p>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button onClick={handleClear} className="text-[11px] text-zinc-500 transition-colors hover:text-red-400">
                    Limpiar
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-white">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center pt-16 text-center">
                  <ShoppingCart className="mb-3 size-10 text-zinc-600" />
                  <p className="text-sm font-medium text-zinc-400">Tu carrito está vacío</p>
                  <p className="mt-1 text-xs text-zinc-600">Agrega frutas desde el stock</p>
                  <Button variant="outline" className="mt-4 rounded-xl border-red-500/30 text-red-400" onClick={() => { setOpen(false); window.location.href = '/stock' }}>
                    Ver stock
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div key={item.fruitId} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-black/40">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-[11px] text-zinc-500">S/{item.price.toFixed(2)} c/u</p>
                        <div className="mt-1.5 flex items-center gap-1">
                          <button onClick={() => handleQuantity(item.fruitId, item.quantity - 1)} disabled={item.quantity <= 1}
                            className="flex size-6 items-center justify-center rounded border border-white/[0.06] text-zinc-400 transition-colors hover:bg-white/5 disabled:opacity-30">
                            <Minus className="size-3" />
                          </button>
                          <span className="flex w-8 justify-center text-xs font-bold text-white">{item.quantity}</span>
                          <button onClick={() => handleQuantity(item.fruitId, item.quantity + 1)} disabled={item.quantity >= item.maxStock}
                            className="flex size-6 items-center justify-center rounded border border-white/[0.06] text-zinc-400 transition-colors hover:bg-white/5 disabled:opacity-30">
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">S/{(item.price * item.quantity).toFixed(2)}</p>
                        <button onClick={() => handleRemove(item.fruitId)} className="mt-1 text-[11px] text-zinc-600 transition-colors hover:text-red-400">
                          <Trash2 className="size-3 inline" /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-white/[0.06] bg-[#0a0a12] p-5">
                <div className="mb-4 space-y-1">
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">S/{total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Total USD</span>
                    <span>${totalUSD.toFixed(2)} USD</span>
                  </div>
                </div>
                <Link href="/checkout" onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-base font-bold text-white shadow-[0_0_25px_-10px_rgba(239,35,60,0.4)] transition-all hover:bg-red-500 hover:shadow-[0_0_35px_-12px_rgba(239,35,60,0.6)]">
                  Ir a pagar <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  ) : null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex size-10 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ShoppingCart className="size-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(239,35,60,0.5)]">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {drawer}
    </>
  )
}
