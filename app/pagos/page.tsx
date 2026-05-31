'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Loader2, Package, ShoppingCart, ShieldCheck, Zap, HeadphonesIcon } from 'lucide-react'

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

type PaymentMethod = {
  id: string
  name: string
  subtitle: string
  desc: string
  image: string
  tags: string[]
  color: string
  glow: string
  border: string
  bgGlow: string
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

const paymentMethods: PaymentMethod[] = [
  {
    id: 'binance',
    name: 'Binance',
    subtitle: 'Pago rápido y seguro',
    desc: 'Paga con criptomonedas desde tu cuenta Binance. Transferencia internacional inmediata.',
    image: '/payments/binance.png',
    tags: ['Cripto', 'Seguro', 'Internacional'],
    color: 'text-amber-400',
    glow: 'rgba(251,191,36,0.2)',
    border: 'border-amber-500/30 group-hover:border-amber-400/60',
    bgGlow: 'from-amber-500/5',
  },
  {
    id: 'yape',
    name: 'Yape',
    subtitle: 'Pago rápido y seguro',
    desc: 'Paga desde tu app Yape escaneando el código o número. Aprobación instantánea.',
    image: '/payments/yape.png',
    tags: ['Instantáneo', 'Popular', 'Perú'],
    color: 'text-fuchsia-400',
    glow: 'rgba(217,70,239,0.2)',
    border: 'border-fuchsia-500/30 group-hover:border-fuchsia-400/60',
    bgGlow: 'from-fuchsia-500/5',
  },
  {
    id: 'plin',
    name: 'Plin',
    subtitle: 'Pago rápido y seguro',
    desc: 'Paga al instante desde tu banco con Plin. Transferencia nacional directa.',
    image: '/payments/plin.png',
    tags: ['Instantáneo', 'Seguro', 'Perú'],
    color: 'text-cyan-400',
    glow: 'rgba(6,182,212,0.2)',
    border: 'border-cyan-500/30 group-hover:border-cyan-400/60',
    bgGlow: 'from-cyan-500/5',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    subtitle: 'Pago rápido y seguro',
    desc: 'Paga con tarjeta, saldo o transferencia vía Mercado Pago. Cobertura en toda Latinoamérica.',
    image: '/payments/mercado_pago.png',
    tags: ['Digital', 'Seguro', 'Latam'],
    color: 'text-sky-400',
    glow: 'rgba(56,189,248,0.2)',
    border: 'border-sky-500/30 group-hover:border-sky-400/60',
    bgGlow: 'from-sky-500/5',
  },
]

const trustItems = [
  { icon: ShieldCheck, label: 'Pago 100% Seguro', desc: 'Tus datos están protegidos' },
  { icon: Zap, label: 'Entrega Inmediata', desc: 'Recibes tu fruta al instante' },
  { icon: HeadphonesIcon, label: 'Soporte 24/7', desc: 'Atención personalizada por Discord' },
]

function PaymentCard({ method, index }: { method: PaymentMethod; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-b ${method.bgGlow} via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <div
        className="relative flex h-full flex-col rounded-2xl border border-white/[0.06] bg-black/50 p-6 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/[0.12] sm:p-7"
        style={{ boxShadow: '0 8px 32px -12px rgba(0,0,0,0.5)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 60px -20px ${method.glow}` }}
        />

        <div className="relative z-10 flex items-start gap-4">
          <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08] transition-all duration-300 group-hover:ring-white/[0.15] sm:size-18">
            <Image src={method.image} alt={method.name} width={80} height={80} className="size-10 object-contain sm:size-12" />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="text-lg font-bold text-white sm:text-xl">{method.name}</h3>
            <p className="mt-0.5 text-sm text-zinc-400">{method.subtitle}</p>
          </div>
        </div>

        <p className="relative z-10 mt-4 text-sm leading-relaxed text-zinc-300">{method.desc}</p>

        <div className="relative z-10 mt-auto flex flex-wrap gap-2 pt-5">
          {method.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition-colors duration-300 group-hover:border-white/[0.12] group-hover:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function InfoPage() {
  const yapeNum = process.env.NEXT_PUBLIC_YAPE_NUMBER || '951 118 020'
  const yapeName = process.env.NEXT_PUBLIC_YAPE_NAME || 'BLOXARAY'
  const plinNum = process.env.NEXT_PUBLIC_PLIN_NUMBER || '951 118 020'
  const plinName = process.env.NEXT_PUBLIC_PLIN_NAME || 'BLOXARAY'
  const binanceNum = process.env.NEXT_PUBLIC_BINANCE_ID || '123456789'
  const binanceName = process.env.NEXT_PUBLIC_BINANCE_NAME || 'BLOXARAY'

  return (
    <>
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/8 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 shadow-[0_0_16px_-8px_rgba(239,35,60,0.25)] backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,35,60,0.4)]" />
            Métodos de Pago
          </span>
        </motion.div>

        <motion.h1
          className="mt-4 font-black uppercase leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading), sans-serif', textShadow: '0 4px 40px rgba(0,0,0,0.5)', fontSize: 'clamp(1.8rem, 5vw, 3.5rem)', letterSpacing: '0.02em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Cómo <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">Pagar</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Todos nuestros métodos de pago son seguros y verificados. Elegí el que más te guste.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {paymentMethods.map((m, i) => (
          <PaymentCard key={m.id} method={m} index={i} />
        ))}
      </div>

      <motion.div
        className="mx-auto mt-16 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-2xl border border-white/[0.05] bg-black/30 px-6 py-8 backdrop-blur-sm sm:px-10 sm:py-10">
          <p className="text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
            Todos los pagos se coordinan de forma segura y con atención directa.{' '}
            <span className="text-zinc-300">Si tenés dudas, contactanos por Discord.</span>
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
                <item.icon className="size-5 shrink-0 text-red-400" />
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <InfoPage />
    </motion.div>
  )
}

export default function PagosPage() {
  return (
    <main className="relative min-h-screen pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-[#050510]" />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-red-950/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/4 -z-10 -translate-x-1/2">
          <div className="size-[600px] rounded-full blur-3xl sm:size-[800px]" style={{ background: 'radial-gradient(circle, rgba(239,35,60,0.06) 0%, transparent 70%)' }} />
        </div>
      </div>
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
