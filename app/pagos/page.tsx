'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Loader2, Package, ArrowRight, ShoppingCart, Landmark, Smartphone, Wallet, Bitcoin } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'

type OrderStatus = 'pending_payment' | 'paid' | 'pending_manual_review' | 'delivered' | 'cancelled' | 'refunded'

type OrderData = {
  id: string
  status: OrderStatus
  total: number
  totalUSD: number
  paymentMethod: string
  customerName: string
  customerEmail: string
  items: { name: string; quantity: number; price: number }[]
  createdAt: string
}

const statusInfo: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  pending_payment: { label: 'Pendiente de pago', icon: <Clock className="size-5" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  paid: { label: 'Pagado', icon: <CheckCircle className="size-5" />, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  pending_manual_review: { label: 'En revisión manual', icon: <Clock className="size-5" />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  delivered: { label: 'Entregado', icon: <Package className="size-5" />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  cancelled: { label: 'Cancelado', icon: <XCircle className="size-5" />, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  refunded: { label: 'Reembolsado', icon: <XCircle className="size-5" />, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20' },
}

function SuccessView({ order }: { order: OrderData }) {
  const info = statusInfo[order.status] || statusInfo.pending_payment

  return (
    <div className="mx-auto max-w-lg px-4 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`mx-auto mb-6 flex size-20 items-center justify-center rounded-full ${info.bg}`}
      >
        {order.status === 'paid' ? (
          <CheckCircle className="size-10 text-green-400" />
        ) : (
          <Clock className="size-10 text-yellow-400" />
        )}
      </motion.div>

      <h1 className="text-3xl font-black text-white">Pedido #{order.id.slice(-8)}</h1>
      <span className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${info.bg} ${info.color}`}>
        {info.icon} {info.label}
      </span>

      <div className="mt-8 rounded-2xl border border-white/[0.06] bg-black/40 p-6 text-left">
        <p className="text-sm text-zinc-400">Resumen del pedido</p>
        <div className="mt-4 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-white">{item.name} × {item.quantity}</span>
              <span className="font-bold text-white">S/{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <div className="flex justify-between text-base font-bold">
            <span className="text-zinc-200">Total</span>
            <span className="text-red-400">S/{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {order.status === 'paid' ? (
          <Link href="/stock" className="rounded-xl bg-red-600 py-3 text-center font-bold text-white transition-colors hover:bg-red-500">
            Seguir comprando
          </Link>
        ) : (
          <p className="text-sm text-zinc-500">
            Estamos verificando tu pago. Te notificaremos por Discord cuando esté confirmado.
          </p>
        )}
      </div>
    </div>
  )
}

function InfoPage() {
  const methods = [
    { name: 'Binance', desc: 'Paga con crypto (USDT) directamente desde tu billetera Binance.', icon: Bitcoin, tone: 'text-orange-400' },
    { name: 'Yape', desc: 'Pagos móviles rápidos para compradores en Perú.', icon: Smartphone, tone: 'text-red-400' },
    { name: 'Plin', desc: 'Transferencias instantáneas soportadas en bancos locales.', icon: Wallet, tone: 'text-green-400' },
    { name: 'Transferencia', desc: 'Transferencia estándar a una cuenta de negocio verificada.', icon: Landmark, tone: 'text-blue-400' },
  ]

  return (
    <>
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400">
          Métodos de Pago
        </span>
        <h1 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
          style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
          Cómo Pagar
        </h1>
        <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-400">
          Múltiples métodos de pago seguros y verificados. Elige el que más te convenga.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {methods.map((m, i) => (
          <Reveal key={m.name} delay={i * 0.07}>
            <div className="group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-red-500/40">
              <span className="flex size-12 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                <m.icon className={`size-6 ${m.tone}`} />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white">{m.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{m.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  )
}

function PagosContent() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const success = searchParams.get('success')
  const orderId = searchParams.get('order')
  const paymentId = searchParams.get('payment_id') || searchParams.get('paymentId')
  const externalRef = searchParams.get('external_reference')

  const hasOrderContext = success || orderId || paymentId || externalRef

  useEffect(() => {
    if (!hasOrderContext) {
      setLoading(false)
      return
    }

    const checkStatus = async () => {
      try {
        const params = new URLSearchParams()
        const effectiveOrderId = orderId || externalRef
        if (effectiveOrderId) params.set('orderId', effectiveOrderId)
        if (paymentId) params.set('paymentId', paymentId)

        if (!effectiveOrderId && !paymentId) {
          setLoading(false)
          return
        }

        const res = await fetch(`/api/orders/status?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
        } else {
          const data = await res.json().catch(() => ({}))
          setError(data.error || 'No se pudo verificar el estado del pedido')
        }
      } catch {
        setError('Error de conexión al verificar el pedido')
      } finally {
        setLoading(false)
      }
    }

    checkStatus()

    if (success === 'true') {
      const interval = setInterval(checkStatus, 5000)
      setTimeout(() => clearInterval(interval), 60000)
      return () => clearInterval(interval)
    }
  }, [success, orderId, paymentId, externalRef, hasOrderContext])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-red-400" />
      </div>
    )
  }

  if (order) {
    return (
      <>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SuccessView order={order} />
        </motion.div>
        <div className="mx-auto mt-8 max-w-lg text-center">
          <Link href="/stock" className="text-sm text-zinc-500 transition-colors hover:text-red-400">
            ← Volver al stock
          </Link>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-16 text-center">
        <XCircle className="mx-auto mb-4 size-12 text-zinc-600" />
        <h1 className="text-2xl font-black text-white">Error</h1>
        <p className="mt-3 text-zinc-400">{error}</p>
        <Link href="/stock" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition-colors hover:bg-red-500">
          <ShoppingCart className="size-4" /> Ir al stock
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <InfoPage />
    </motion.div>
  )
}

export default function PagosPage() {
  return (
    <main className="relative min-h-screen pt-24 pb-20">
      <div className="pointer-events-none absolute left-0 top-1/4 -z-10 size-[420px] rounded-full glow-red blur-3xl opacity-30" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-red-400" />
          </div>
        }>
          <PagosContent />
        </Suspense>
      </div>
    </main>
  )
}
