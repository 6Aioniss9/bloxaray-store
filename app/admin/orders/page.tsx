'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Search, Package, CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react'

type Order = {
  id: string
  items: string
  total: number
  totalUSD: number
  status: string
  paymentMethod: string | null
  paymentId: string | null
  customerName: string
  customerEmail: string
  customerRoblox: string
  customerDiscord: string
  customerNotes: string | null
  receiptUrl: string | null
  createdAt: string
}

type OrderItem = {
  fruitId: string
  name: string
  price: number
  quantity: number
}

function isValidReceiptUrl(url: string): boolean {
  return url.startsWith('/uploads/receipts/') || url.startsWith('data:image/')
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: { label: 'Pendiente de pago', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10', icon: <Clock className="size-3" /> },
  paid: { label: 'Pagado', color: 'text-green-400 border-green-500/30 bg-green-500/10', icon: <CheckCircle className="size-3" /> },
  pending_manual_review: { label: 'Revisión manual', color: 'text-orange-400 border-orange-500/30 bg-orange-500/10', icon: <AlertTriangle className="size-3" /> },
  delivered: { label: 'Entregado', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', icon: <Package className="size-3" /> },
  cancelled: { label: 'Cancelado', color: 'text-red-400 border-red-500/30 bg-red-500/10', icon: <XCircle className="size-3" /> },
  refunded: { label: 'Reembolsado', color: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10', icon: <XCircle className="size-3" /> },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/csrf')
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.token))
      .catch(() => {})
  }, [])

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?pageSize=200')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : data.orders ?? [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [refresh])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({ id, status }),
      })
      refresh()
    } catch {
      console.error('Error updating order')
    }
  }

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerRoblox.toLowerCase().includes(q) ||
      o.customerDiscord.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    )
  })

  const formatDate = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const parseItems = (items: string): OrderItem[] => {
    try {
      return JSON.parse(items)
    } catch {
      return []
    }
  }

  const statusOptions = ['pending_payment', 'paid', 'pending_manual_review', 'delivered', 'cancelled', 'refunded']

  return (
    <main className="min-h-screen bg-[#050510] pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex size-9 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                Pedidos
              </h1>
              <p className="mt-1 text-sm text-zinc-500">{orders.length} pedidos totales</p>
            </div>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pedidos..."
              className="h-10 w-56 rounded-xl border border-white/[0.06] bg-black/40 pl-9 pr-3 text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-red-500/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* List */}
          <div className="xl:col-span-1">
            <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto size-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="mx-auto mb-2 size-6 text-zinc-600" />
                    <p className="text-sm text-zinc-500">No hay pedidos</p>
                  </div>
                ) : (
                  filtered.map((order) => {
                    const cfg = statusConfig[order.status] || statusConfig.pending_payment
                    const items = parseItems(order.items)
                    return (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => setSelected(order)}
                        className={`w-full border-b border-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.02] ${
                          selected?.id === order.id ? 'bg-red-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium text-white truncate">
                              {order.customerName}
                            </p>
                            <p className="text-[11px] text-zinc-500 truncate">
                              {items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                            </p>
                            <p className="mt-0.5 text-[11px] font-bold text-white">
                              S/{order.total.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase ${cfg.color}`}>
                              {cfg.icon} {cfg.label}
                            </span>
                            <span className="text-[9px] text-zinc-600">{formatDate(order.createdAt)}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Detail */}
          <div className="xl:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  className="rounded-xl border border-white/[0.06] bg-[#0d0d12] overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="border-b border-white/[0.06] px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Pedido #{selected.id.slice(-8)}</p>
                        <p className="text-[11px] text-zinc-500">{formatDate(selected.createdAt)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${(statusConfig[selected.status] || statusConfig.pending_payment).color}`}>
                        {(statusConfig[selected.status] || statusConfig.pending_payment).icon}
                        {(statusConfig[selected.status] || statusConfig.pending_payment).label}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Customer info */}
                    <div className="mb-5 grid grid-cols-2 gap-4 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Nombre</p>
                        <p className="mt-0.5 text-sm text-white">{selected.customerName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Email</p>
                        <p className="mt-0.5 text-sm text-white">{selected.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Roblox</p>
                        <p className="mt-0.5 text-sm text-white">{selected.customerRoblox}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Discord</p>
                        <p className="mt-0.5 text-sm text-white">{selected.customerDiscord}</p>
                      </div>
                      {selected.customerNotes && (
                        <div className="col-span-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Notas</p>
                          <p className="mt-0.5 text-sm text-zinc-300">{selected.customerNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="mb-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Productos</p>
                      <div className="space-y-2">
                        {parseItems(selected.items).map((item, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
                            <span className="text-sm text-white">{item.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-zinc-500">x{item.quantity}</span>
                              <span className="text-sm font-bold text-white">S/{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="mb-5 space-y-1 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Total</span>
                        <span className="font-bold text-white">S/{selected.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Total USD</span>
                        <span className="text-zinc-300">${selected.totalUSD.toFixed(2)} USD</span>
                      </div>
                    </div>

                    {/* Receipt */}
                    {selected.receiptUrl && isValidReceiptUrl(selected.receiptUrl) && (
                      <div className="mb-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Comprobante</p>
                        <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
                          <img
                            src={selected.receiptUrl}
                            alt="Comprobante de pago"
                            className="max-h-48 rounded-lg object-contain cursor-pointer"
                            onClick={() => window.open(selected.receiptUrl!, '_blank')}
                          />
                        </div>
                      </div>
                    )}

                    {/* Payment info */}
                    <div className="mb-5 grid grid-cols-2 gap-4 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Método de pago</p>
                        <p className="mt-0.5 text-sm font-medium text-white capitalize">{selected.paymentMethod || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Payment ID</p>
                        <p className="mt-0.5 text-xs text-zinc-400 truncate">{selected.paymentId || '—'}</p>
                      </div>
                    </div>

                    {/* Status actions */}
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Cambiar estado</p>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((s) => {
                          const cfg = statusConfig[s]
                          const isActive = selected.status === s
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleStatusChange(selected.id, s)}
                              disabled={isActive}
                              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase transition-all ${
                                isActive
                                  ? cfg.color + ' cursor-default'
                                  : 'border-white/[0.06] text-zinc-500 hover:border-red-500/30 hover:text-red-400'
                              }`}
                            >
                              {cfg.icon} {cfg.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-white/[0.06] bg-[#0d0d12]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center">
                    <Eye className="mx-auto mb-3 size-8 text-zinc-600" />
                    <p className="text-sm text-zinc-500">Selecciona un pedido</p>
                    <p className="text-[11px] text-zinc-600">Para ver los detalles</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  )
}
