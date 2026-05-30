'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Loader2, Check, CreditCard, Smartphone, Wallet, Send, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCart, clearCart, getCartTotal, type CartItem } from '@/lib/cart-store'

type PaymentMethod = 'mercadopago' | 'yape' | 'plin' | 'binance'

const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'mercadopago',
    label: 'Mercado Pago',
    icon: <CreditCard className="size-5" />,
    description: 'Tarjeta, Yape, Plin, transferencia',
  },
  {
    id: 'yape',
    label: 'Yape',
    icon: <Smartphone className="size-5" />,
    description: 'Pago directo desde Yape',
  },
  {
    id: 'plin',
    label: 'Plin',
    icon: <Smartphone className="size-5" />,
    description: 'Pago directo desde Plin',
  },
  {
    id: 'binance',
    label: 'Binance',
    icon: <Wallet className="size-5" />,
    description: 'Pago con cripto vía Binance',
  },
]

const manualPaymentInfo: Partial<Record<PaymentMethod, { number: string; name: string; instructions: string[] }>> = {
  yape: {
    number: '999 888 777',
    name: 'Leonardo A.',
    instructions: [
      'Abre Yape y busca el número 999 888 777',
      'Envía el monto exacto del pedido',
      'Captura la pantalla de confirmación',
      'Sube el comprobante abajo',
    ],
  },
  plin: {
    number: '999 888 777',
    name: 'Leonardo A.',
    instructions: [
      'Abre Plin y busca el número 999 888 777',
      'Envía el monto exacto del pedido',
      'Captura la pantalla de confirmación',
      'Sube el comprobante abajo',
    ],
  },
  binance: {
    number: 'ID: 123456789',
    name: 'Leonardo A.',
    instructions: [
      'Abre Binance y ve a P2P / Enviar',
      'Busca el ID: 123456789',
      'Envía el monto exacto del pedido en USDT',
      'Captura la pantalla de confirmación',
      'Sube el comprobante abajo',
    ],
  },
}

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerRoblox: '',
    customerDiscord: '',
    customerNotes: '',
  })

  useEffect(() => {
    const cart = getCart()
    if (cart.length === 0) {
      router.replace('/stock')
      return
    }
    setItems(cart)
  }, [router])

  const { total, totalUSD } = useMemo(() => getCartTotal(items), [items])

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = useCallback(() => {
    if (!form.customerName.trim() || form.customerName.trim().length < 2) return 'Nombre requerido'
    if (!form.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim())) return 'Email válido requerido'
    if (!form.customerRoblox.trim()) return 'Usuario de Roblox requerido'
    if (!form.customerDiscord.trim()) return 'Usuario de Discord requerido'
    return null
  }, [form])

  const handleSubmit = async () => {
    setError('')
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      if (paymentMethod === 'mercadopago') {
        const res = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              fruitId: i.fruitId,
              name: i.name,
              price: i.price,
              priceUSD: i.priceUSD,
              quantity: i.quantity,
            })),
            total,
            totalUSD,
            customerName: form.customerName.trim(),
            customerEmail: form.customerEmail.trim(),
            customerRoblox: form.customerRoblox.trim(),
            customerDiscord: form.customerDiscord.trim(),
            customerNotes: form.customerNotes.trim() || undefined,
            paymentMethod: 'mercadopago',
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          const msg = data.error || 'No se pudo crear la preferencia de pago'
          console.error('[Checkout] MP create-preference failed:', res.status, data)
          setError(msg)
          setLoading(false)
          return
        }

        if (!data.url) {
          console.error('[Checkout] MP response missing url:', data)
          setError('Error de configuración de pago. Contacta al soporte.')
          setLoading(false)
          return
        }

        window.location.href = data.url
      } else {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({
              fruitId: i.fruitId,
              name: i.name,
              price: i.price,
              priceUSD: i.priceUSD,
              quantity: i.quantity,
            })),
            total,
            totalUSD,
            customerName: form.customerName.trim(),
            customerEmail: form.customerEmail.trim(),
            customerRoblox: form.customerRoblox.trim(),
            customerDiscord: form.customerDiscord.trim(),
            customerNotes: form.customerNotes.trim() || undefined,
            paymentMethod,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Error al crear el pedido')
          setLoading(false)
          return
        }

        clearCart()
        setSubmitted(true)
        setLoading(false)
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setLoading(false)
    }
  }

  if (items.length === 0) return null

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#050510] pt-28 pb-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-500/20"
          >
            <Check className="size-10 text-green-400" />
          </motion.div>
          <h1 className="text-3xl font-black text-white">Pedido creado</h1>
          <p className="mt-3 text-zinc-400">
            Recibiremos tu solicitud y te contactaremos por Discord para confirmar el pago.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Si tienes dudas, escribe a nuestro soporte por Discord o usa el chat en vivo.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/stock"
              className="rounded-xl bg-red-600 py-3 text-center font-bold text-white transition-colors hover:bg-red-500"
            >
              Seguir comprando
            </Link>
            <a
              href="https://discord.gg/aioniss"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 py-3 text-center text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5"
            >
              Ir a Discord
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#050510] pt-28 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[url('/backgrounds/pueblo.png')] bg-cover bg-center bg-fixed" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/60" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/stock"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-red-400"
        >
          <ArrowLeft className="size-4" /> Seguir comprando
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
          {/* Left: Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-6 sm:p-8">
              <h2 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                1. Tus datos
              </h2>
              <p className="mt-1 text-sm text-zinc-500">Completa tus datos para el pedido</p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nombre completo *</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => handleFormChange('customerName', e.target.value)}
                    placeholder="Ej: Leonardo A."
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-red-500/40 focus:shadow-[0_0_20px_-8px_rgba(239,35,60,0.2)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Email *</label>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => handleFormChange('customerEmail', e.target.value)}
                    placeholder="Ej: leo@email.com"
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-red-500/40 focus:shadow-[0_0_20px_-8px_rgba(239,35,60,0.2)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Usuario Roblox *</label>
                  <input
                    type="text"
                    value={form.customerRoblox}
                    onChange={(e) => handleFormChange('customerRoblox', e.target.value)}
                    placeholder="Tu username de Roblox"
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-red-500/40 focus:shadow-[0_0_20px_-8px_rgba(239,35,60,0.2)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Usuario Discord *</label>
                  <input
                    type="text"
                    value={form.customerDiscord}
                    onChange={(e) => handleFormChange('customerDiscord', e.target.value)}
                    placeholder="Ej: leo#1234"
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-red-500/40 focus:shadow-[0_0_20px_-8px_rgba(239,35,60,0.2)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Notas (opcional)</label>
                  <textarea
                    value={form.customerNotes}
                    onChange={(e) => handleFormChange('customerNotes', e.target.value)}
                    placeholder="Algún detalle adicional..."
                    rows={3}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-red-500/40 focus:shadow-[0_0_20px_-8px_rgba(239,35,60,0.2)]"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/40 p-6 sm:p-8">
              <h2 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                2. Método de pago
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                      paymentMethod === pm.id
                        ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_20px_-8px_rgba(239,35,60,0.2)]'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-red-500/20 hover:bg-red-500/5'
                    }`}
                  >
                    <span className={paymentMethod === pm.id ? 'text-red-400' : 'text-zinc-400'}>
                      {pm.icon}
                    </span>
                    <span className={`text-xs font-bold ${paymentMethod === pm.id ? 'text-white' : 'text-zinc-400'}`}>
                      {pm.label}
                    </span>
                    <span className="text-[9px] text-zinc-600">{pm.description}</span>
                  </button>
                ))}
              </div>

              {/* Manual payment instructions */}
              {paymentMethod !== 'mercadopago' && (() => {
                const info = manualPaymentInfo[paymentMethod]!
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      Paga con {paymentMethod === 'yape' ? 'Yape' : paymentMethod === 'plin' ? 'Plin' : 'Binance'}
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {info.name} — {info.number}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {info.instructions.map((inst, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-[9px] font-bold text-red-400">
                            {i + 1}
                          </span>
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )
              })()}
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm font-medium text-red-400"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <Button
              size="lg"
              disabled={loading}
              onClick={handleSubmit}
              className="mt-6 w-full rounded-xl bg-red-600 py-4 text-base font-bold text-white shadow-[0_0_30px_-10px_rgba(239,35,60,0.4)] transition-all hover:bg-red-500 hover:shadow-[0_0_40px_-12px_rgba(239,35,60,0.6)]"
            >
              {loading ? (
                <><Loader2 className="size-5 animate-spin" /> Procesando...</>
              ) : paymentMethod === 'mercadopago' ? (
                <><Shield className="size-5" /> Pagar con Mercado Pago</>
              ) : (
                <><Send className="size-5" /> Enviar pedido — Pagaré con {paymentMethod === 'yape' ? 'Yape' : paymentMethod === 'plin' ? 'Plin' : 'Binance'}</>
              )}
            </Button>
          </motion.div>

          {/* Right: Order summary */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="sticky top-32 rounded-2xl border border-white/[0.06] bg-black/40 p-6 sm:p-8">
              <h2 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                Resumen del pedido
              </h2>

              <div className="mt-5 flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.fruitId} className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-black/40">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-zinc-500">S/{item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-white">S/{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">S/{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Total USD</span>
                  <span className="text-white">${totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-white/[0.06] pt-2 text-base font-bold">
                  <span className="text-zinc-200">Total</span>
                  <span className="text-red-400">S/{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                <Shield className="size-4 text-green-400" />
                <span className="text-xs text-zinc-400">Pago 100% seguro procesado por Mercado Pago</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
