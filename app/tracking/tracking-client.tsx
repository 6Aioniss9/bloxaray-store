'use client'

import { useState } from 'react'
import { Search, Package, Clock, CreditCard, User, Gamepad2, AlertCircle, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type OrderItem = {
  fruitId: string
  name: string
  image: string
  quantity: number
}

type OrderInfo = {
  id: string
  trackingToken: string
  status: string
  statusLabel: string
  items: OrderItem[]
  total: number
  totalUSD: number
  paymentMethod: string | null
  customerName: string
  customerRoblox: string
  createdAt: string
  updatedAt: string
  paidAt: string | null
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pending_payment:       { color: 'text-yellow-400', bg: 'bg-yellow-500/15', label: 'Pendiente de pago' },
  pending_manual_review: { color: 'text-orange-400', bg: 'bg-orange-500/15', label: 'Pendiente de revisión' },
  paid:                  { color: 'text-green-400',  bg: 'bg-green-500/15',  label: 'Pagado' },
  preparing_delivery:    { color: 'text-blue-400',   bg: 'bg-blue-500/15',   label: 'Preparando entrega' },
  delivered:             { color: 'text-green-400',  bg: 'bg-green-500/15',  label: 'Entregado' },
  cancelled:             { color: 'text-zinc-500',   bg: 'bg-zinc-500/15',   label: 'Cancelado' },
  refunded:              { color: 'text-red-400',    bg: 'bg-red-500/15',    label: 'Reembolsado' },
}

const PAYMENT_LABELS: Record<string, string> = {
  yape: 'Yape',
  plin: 'Plin',
  binance: 'Binance (USDT)',
  mercadopago: 'Mercado Pago',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SearchState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <Search className="size-7 text-zinc-600" />
      </div>
      <p className="text-lg font-semibold text-white">Buscá tu pedido</p>
      <p className="max-w-sm text-sm text-zinc-500">
        Ingresá el ID de tu pedido o el código de seguimiento que recibiste al comprar.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="size-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
        <AlertCircle className="size-7 text-red-400" />
      </div>
      <div>
        <p className="text-lg font-semibold text-white">Pedido no encontrado</p>
        <p className="mt-1 max-w-sm text-sm text-zinc-500">{message}</p>
      </div>
    </div>
  )
}

function OrderResult({ order }: { order: OrderInfo }) {
  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment
  const isError = order.status === 'cancelled' || order.status === 'refunded'

  const steps = [
    { key: 'paid', label: 'Pagado', done: ['paid', 'preparing_delivery', 'delivered'].includes(order.status) },
    { key: 'preparing_delivery', label: 'Preparando', done: ['preparing_delivery', 'delivered'].includes(order.status) },
    { key: 'delivered', label: 'Entregado', done: order.status === 'delivered' },
  ]

  return (
    <div className="space-y-5 p-6">
      <div className={`rounded-2xl border ${sc.bg} bg-white/[0.03] p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 rounded-full ${sc.bg} px-4 py-1.5 text-sm font-semibold ${sc.color}`}>
            <span className={`size-2 rounded-full ${sc.color.replace('text-', 'bg-')}`} />
            {order.statusLabel}
          </div>
          <span className="text-xs text-zinc-600">#{order.id.slice(-8).toUpperCase()}</span>
        </div>

        {!isError && (
          <div className="flex items-center gap-3">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                  step.done ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-600'
                }`}>
                  {step.done ? '✓' : i + 1}
                </div>
                <span className={`text-xs ${step.done ? 'text-green-400' : 'text-zinc-600'}`}>
                  {step.label}
                </span>
                {i < steps.length - 1 && (
                  <ChevronRight className="size-4 text-zinc-700" />
                )}
              </div>
            ))}
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-500">
            Este pedido fue cancelado. Si tenés dudas, contactanos por Discord.
          </div>
        )}

        {order.status === 'refunded' && (
          <div className="mt-4 rounded-xl border border-red-900/30 bg-red-950/20 p-3 text-sm text-red-400">
            Este pedido fue reembolsado.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">Productos</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.fruitId} className="flex items-center gap-3">
              {item.image && (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-black/40">
                  <img src={item.image} alt={item.name} className="size-8 object-contain" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-xs text-zinc-600">{item.quantity} unidad{item.quantity !== 1 ? 'es' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-600">
            <Package className="size-3.5" /> Total
          </div>
          <p className="text-lg font-bold text-white">S/{order.total.toFixed(2)}</p>
          <p className="text-xs text-zinc-600">${order.totalUSD.toFixed(2)} USD</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-600">
            <CreditCard className="size-3.5" /> Pago
          </div>
          <p className="text-sm font-semibold text-white">
            {PAYMENT_LABELS[order.paymentMethod ?? ''] || order.paymentMethod || '—'}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-600">
            <User className="size-3.5" /> Cliente
          </div>
          <p className="text-sm font-semibold text-white">{order.customerName}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-600">
            <Gamepad2 className="size-3.5" /> Roblox
          </div>
          <p className="text-sm font-semibold text-white">{order.customerRoblox}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-600">
            <Clock className="size-3.5" /> Compra
          </div>
          <p className="text-sm text-white">{formatDate(order.createdAt)}</p>
        </div>
        {order.paidAt && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-600">
              <Clock className="size-3.5" /> Pagado
            </div>
            <p className="text-sm text-white">{formatDate(order.paidAt)}</p>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-zinc-700">
        Tracking: {order.trackingToken}
      </p>
    </div>
  )
}

export function TrackingClient() {
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 3) return

    setLoading(true)
    setError('')
    setOrder(null)
    setSearched(true)

    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(trimmed)}`)
      if (!res.ok) {
        if (res.status === 429) {
          setError('Demasiadas consultas. Esperá un minuto y volvé a intentar.')
        } else {
          setError('No encontramos ningún pedido con ese código. Verificá que sea correcto.')
        }
        return
      }
      const data = await res.json()
      setOrder(data)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-[#050510] pt-28 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[url('/backgrounds/pueblo.png')] bg-cover bg-center bg-fixed" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/60" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400">
            Seguimiento
          </span>
          <h1
            className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Rastreá Tu Pedido
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Ingresá el código de seguimiento o ID de pedido que recibiste al comprar.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-600" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej: cm1x... o seguimiento..."
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/40 pl-11 pr-4 text-sm text-white placeholder-zinc-700 outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || query.trim().length < 3}
              className="h-12 rounded-xl border border-red-500/30 bg-red-600 px-6 text-sm font-bold text-white transition-all hover:bg-red-500 disabled:opacity-40"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : order ? (
            <OrderResult order={order} />
          ) : !searched ? (
            <SearchState />
          ) : null}
        </div>
      </div>
    </main>
  )
}
