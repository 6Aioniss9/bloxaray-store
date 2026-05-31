'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  MessageCircle, Check, Search, ArrowLeft, LogOut, Package,
  ShoppingBag, TrendingUp, AlertTriangle, Apple,
} from 'lucide-react'
import { getAllConversations, resolveTicketWithApi, closeTicketWithApi, type Conversation } from '@/lib/chat-store'

type DashboardStats = {
  totalOrders: number
  revenue: number
  pendingOrders: number
  lowStockFruits: number
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [convs, setConvs] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, revenue: 0, pendingOrders: 0, lowStockFruits: 0 })

  useEffect(() => {
    fetch('/api/orders?pageSize=1')
      .then((r) => r.json())
      .then((data) => {
        const orders = Array.isArray(data) ? data : data.orders ?? []
        setStats({
          totalOrders: data.total ?? orders.length,
          revenue: data.revenue ?? 0,
          pendingOrders: orders.filter((o: any) => o.status === 'pending_payment' || o.status === 'pending_manual_review').length,
          lowStockFruits: 0,
        })
      })
      .catch(() => {})
    fetch('/api/admin/fruits')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStats((s) => ({ ...s, lowStockFruits: data.filter((f: any) => f.stock > 0 && f.stock <= 5).length }))
        }
      })
      .catch(() => {})
  }, [])

  const refresh = useCallback(async () => {
    const all = await getAllConversations()
    setConvs(all)
    if (selected) {
      const updated = all.find((c) => c.id === selected.id)
      setSelected(updated || null)
    }
  }, [selected])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const interval = setInterval(refresh, 10000)
    return () => clearInterval(interval)
  }, [refresh])

  const handleResolve = async (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation()
    await resolveTicketWithApi(conv.id)
    await closeTicketWithApi(conv.id)
    refresh()
  }

  const filtered = convs.filter((c) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.messages.some((m) => m.content.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q)
    )
  })

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const ticketStatusColor = (status?: string) => {
    if (status === 'open') return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
    if (status === 'resolved') return 'text-green-400 border-green-500/30 bg-green-500/10'
    if (status === 'closed') return 'text-zinc-500 border-zinc-500/30 bg-zinc-500/10'
    return 'text-zinc-500'
  }

  return (
    <main className="min-h-screen bg-[#050510] pt-24">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
              Panel de Administracion
            </h1>
            <p className="mt-1 text-sm text-zinc-500">Conversaciones y tickets de soporte</p>
          </div>
          <div className="flex items-center gap-3">
            {session?.user && (
              <>
                <div className="hidden items-center gap-2 sm:flex">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt=""
                      className="size-7 rounded-full ring-1 ring-white/10"
                    />
                  )}
                  <span className="text-[13px] text-zinc-400">{session.user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 px-3 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                >
                  <LogOut className="size-3" />
                  Salir
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href="/admin/orders" className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-4 transition-colors hover:border-red-500/30">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-4 text-red-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Pedidos</span>
            </div>
            <p className="mt-1.5 text-xl font-bold text-white">{stats.totalOrders}</p>
          </Link>
          <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-green-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Ingresos</span>
            </div>
            <p className="mt-1.5 text-xl font-bold text-white">S/{stats.revenue.toFixed(2)}</p>
          </div>
          <Link href="/admin/orders" className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-4 transition-colors hover:border-red-500/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Pendientes</span>
            </div>
            <p className="mt-1.5 text-xl font-bold text-white">{stats.pendingOrders}</p>
          </Link>
          <Link href="/admin/fruits" className="rounded-xl border border-white/[0.06] bg-[#0d0d12] p-4 transition-colors hover:border-red-500/30">
            <div className="flex items-center gap-2">
              <Apple className="size-4 text-yellow-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Stock bajo</span>
            </div>
            <p className="mt-1.5 text-xl font-bold text-white">{stats.lowStockFruits}</p>
          </Link>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link href="/admin/orders" className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white">
            <Package className="size-3" /> Pedidos
          </Link>
          <Link href="/admin/fruits" className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white">
            <Apple className="size-3" /> Frutas
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar — conversation list */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-white/[0.06] bg-[#0d0d12] overflow-hidden">
              <div className="border-b border-white/[0.06] p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-600" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar conversaciones..."
                    className="h-9 w-full rounded-lg border border-white/[0.06] bg-black/40 pl-9 pr-3 text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-red-500/30"
                  />
                </div>
              </div>

              <div className="max-h-[500px] overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="mx-auto mb-2 size-6 text-zinc-600" />
                    <p className="text-sm text-zinc-500">No hay conversaciones</p>
                  </div>
                ) : (
                  filtered.map((conv) => {
                    const lastMsg = conv.messages[conv.messages.length - 1]
                    const isSelected = selected?.id === conv.id
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => setSelected(conv)}
                        className={`w-full border-b border-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.02] ${
                          isSelected ? 'bg-red-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 text-[13px] font-medium text-white">
                              Conversación
                              {conv.ticket && (
                                <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase ${ticketStatusColor(conv.ticket.status)}`}>
                                  {conv.ticket.status}
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                              {lastMsg ? lastMsg.content : 'Sin mensajes'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="whitespace-nowrap text-[9px] text-zinc-600">
                              {formatDate(conv.updatedAt)}
                            </span>
                            {conv.unread && (
                              <span className="size-2 rounded-full bg-red-500" />
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.id}
                  className="rounded-xl border border-white/[0.06] bg-[#0d0d12] overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Detail header */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="flex size-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200 lg:hidden"
                      >
                        <ArrowLeft className="size-3.5" />
                      </button>
                      <div>
                        <p className="text-[13px] font-medium text-white">Conversación</p>
                        <p className="text-[10px] text-zinc-500">{selected.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selected.ticket?.status === 'open' && (
                        <button
                          type="button"
                          onClick={(e) => handleResolve(e, selected)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-green-500/25 px-3 py-1.5 text-[11px] font-medium text-green-400 transition-colors hover:bg-green-500/10"
                        >
                          <Check className="size-3" />
                          Marcar resuelto
                        </button>
                      )}
                      <a
                        href="https://discord.gg/aioniss"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/25 px-3 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <MessageCircle className="size-3" />
                        Discord
                      </a>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="max-h-[400px] overflow-y-auto p-4">
                    <div className="flex flex-col gap-3">
                      {selected.messages.length === 0 && (
                        <p className="py-6 text-center text-sm text-zinc-500">Sin mensajes</p>
                      )}
                      {selected.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${msg.role === 'agent' ? 'justify-start' : ''}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                              msg.role === 'user'
                                ? 'rounded-br-sm bg-[#ef233c] text-white'
                                : msg.role === 'agent'
                                  ? 'rounded-bl-sm border border-blue-500/20 bg-blue-500/10 text-blue-200'
                                  : 'rounded-bl-sm border border-white/[0.06] bg-white/[0.04] text-zinc-200'
                            }`}
                          >
                            {msg.type === 'image' ? (
                              <div>
                                <img src={msg.content} alt="" className="max-h-32 rounded-lg object-cover" />
                                {msg.fileName && <p className="mt-1 text-[10px] text-zinc-400">{msg.fileName}</p>}
                              </div>
                            ) : msg.type === 'audio' ? (
                              <div>
                                <p className="mb-1 text-[11px] text-zinc-400">{msg.content}</p>
                                {msg.audioUrl && <audio controls className="h-6 w-32"><source src={msg.audioUrl} /></audio>}
                              </div>
                            ) : (
                              <span>{msg.content}</span>
                            )}
                            <p className={`mt-0.5 text-[9px] text-zinc-500 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ticket info */}
                  {selected.ticket && (
                    <div className="border-t border-white/[0.06] px-4 py-3">
                      <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
                        <div className="flex items-center justify-between">
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-white">
                            Ticket #{selected.ticket.id.slice(-6)}
                            <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase ${ticketStatusColor(selected.ticket.status)}`}>
                              {selected.ticket.status}
                            </span>
                          </p>
                          <span className="text-[9px] text-zinc-600">
                            {formatDate(selected.ticket.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] text-zinc-400">
                          Mensaje del usuario: {selected.ticket.userMessage}
                        </p>
                        <p className="mt-0.5 text-[11px] text-zinc-500">
                          Respuesta del bot: {selected.ticket.botResponse}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-white/[0.06] bg-[#0d0d12]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <MessageCircle className="mx-auto mb-3 size-8 text-zinc-600" />
                    <p className="text-sm text-zinc-500">Selecciona una conversación</p>
                    <p className="text-[11px] text-zinc-600">Para ver los detalles y responder</p>
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
