'use client'

import { Suspense, useState } from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, XCircle, Clock, Loader2, Package, ShoppingCart, Shield, Zap, Headphones, Copy, Check, Upload, MessageCircle, ExternalLink, ChevronDown } from 'lucide-react'
import { getManualPaymentInfo } from '@/lib/payment-methods'

type OrderStatus = 'pending_payment' | 'paid' | 'pending_manual_review' | 'delivered' | 'cancelled' | 'refunded'
type OrderData = {
  id: string; status: OrderStatus; total: number; totalUSD: number; paymentMethod: string
  customerName: string; customerEmail: string; items: { name: string; quantity: number; price: number }[]; createdAt: string
}
type PaymentMethod = {
  id: string; name: string; subtitle: string; desc: string; image: string; tags: string[]; brand: string
}

const statusInfo: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  pending_payment: { label: 'Pendiente de pago', icon: <Clock className="size-5" />, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  paid: { label: 'Pagado', icon: <CheckCircle className="size-5" />, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  pending_manual_review: { label: 'En revisión manual', icon: <Clock className="size-5" />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  delivered: { label: 'Entregado', icon: <Package className="size-5" />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  cancelled: { label: 'Cancelado', icon: <XCircle className="size-5" />, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  refunded: { label: 'Reembolsado', icon: <XCircle className="size-5" />, color: 'text-zinc-400', bg: 'bg-zinc-500/10 border-zinc-500/20' },
}

const DISCORD = 'https://discord.gg/aioniss'

const methods: PaymentMethod[] = [
  { id: 'binance', name: 'Binance', subtitle: 'Pago rápido y seguro', desc: 'Paga con criptomonedas desde tu cuenta Binance. Transferencia internacional inmediata.', image: '/payments/binance.png', tags: ['Cripto', 'Seguro', 'Internacional'], brand: '#f59e0b' },
  { id: 'yape', name: 'Yape', subtitle: 'Pago rápido y seguro', desc: 'Paga desde tu app Yape escaneando el código o número. Aprobación instantánea.', image: '/payments/yape.png', tags: ['Instantáneo', 'Popular', 'Perú'], brand: '#d946ef' },
  { id: 'plin', name: 'Plin', subtitle: 'Pago rápido y seguro', desc: 'Paga al instante desde tu banco con Plin. Transferencia nacional directa.', image: '/payments/plin.png', tags: ['Instantáneo', 'Seguro', 'Perú'], brand: '#06b6d4' },
  { id: 'mercadopago', name: 'Mercado Pago', subtitle: 'Pago rápido y seguro', desc: 'Paga con tarjeta, saldo o transferencia vía Mercado Pago. Cobertura en toda Latinoamérica.', image: '/payments/mercado_pago.png', tags: ['Digital', 'Seguro', 'Latam'], brand: '#38bdf8' },
]

const trust = [
  { icon: Shield, label: 'Pago 100% Seguro', desc: 'Tus datos están protegidos' },
  { icon: Zap, label: 'Entrega Inmediata', desc: 'Recibes tu fruta al instante' },
  { icon: Headphones, label: 'Soporte 24/7', desc: 'Atención personalizada por Discord' },
]

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  return (
    <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:border-white/20 hover:bg-white/10 active:scale-95">
      {copied ? <><Check className="size-3.5 text-green-400" /> Copiado</> : <><Copy className="size-3.5" /> Copiar</>}
    </button>
  )
}

function ReceiptUpload() {
  const [orderId, setOrderId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState('')
  const handleUpload = async () => {
    if (!file || !orderId.trim()) return
    setUploading(true); setError('')
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('orderId', orderId.trim())
      const res = await fetch('/upload/receipt', { method: 'POST', body: fd })
      if (res.ok) { setUploaded(true); setFile(null) } else { const d = await res.json().catch(() => ({})); setError(d.error || 'Error') }
    } catch { setError('Error de conexión') } finally { setUploading(false) }
  }
  if (uploaded) return <div className="flex items-center gap-2 rounded-lg border border-green-500/25 bg-green-500/10 px-4 py-3"><CheckCircle className="size-4 shrink-0 text-green-400" /><span className="text-sm text-green-300">Comprobante subido</span></div>
  return (
    <div className="rounded-xl border border-white/8 bg-[#12121a] p-5">
      <p className="text-sm font-semibold text-white">Subí tu comprobante</p>
      <p className="mt-0.5 text-xs text-zinc-500">Captura de pantalla de la transferencia</p>
      <div className="mt-3 space-y-2.5">
        <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="ID del pedido" className="h-9 w-full rounded-lg border border-white/8 bg-black/50 px-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-red-500/50 transition-colors" />
        <div className="flex gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-red-500/40 bg-red-500/8 px-3.5 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/12">
            {file ? file.name : 'Seleccionar archivo'}
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
          <button onClick={handleUpload} disabled={!file || uploading || !orderId.trim()} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            {uploading ? 'Subiendo' : 'Subir'}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  )
}

function MethodCard({ m, isSelected, onSelect, idx }: { m: PaymentMethod; isSelected: boolean; onSelect: () => void; idx: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: idx * 0.07, ease: 'easeOut' }}
      onClick={onSelect}
      className="group relative w-full text-left"
    >
      <div
        className={`relative rounded-xl border p-5 transition-all duration-300 sm:p-6 ${
          isSelected
            ? 'border-transparent'
            : 'border-white/8 hover:border-white/18'
        }`}
        style={{
          backgroundColor: isSelected ? `color-mix(in srgb, ${m.brand} 8%, #12121a)` : '#12121a',
          boxShadow: isSelected ? `0 0 0 1px ${m.brand}40` : 'none',
        }}
      >
        {/* Top brand bar */}
        <div
          className="absolute left-0 top-0 h-full w-0.5 rounded-l-xl transition-all duration-300 sm:w-1"
          style={{
            backgroundColor: isSelected ? m.brand : 'transparent',
            boxShadow: isSelected ? `0 0 12px ${m.brand}60` : 'none',
          }}
        />
        {isSelected && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl opacity-20 transition-opacity duration-300"
            style={{ background: `radial-gradient(ellipse at 0% 50%, ${m.brand} 0%, transparent 70%)` }}
          />
        )}

        <div className="relative z-10 flex items-center gap-4">
          <div className={`flex size-16 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:size-20 ${
            isSelected ? 'bg-black/40 ring-1' : 'bg-black/30'
          }`}
            style={isSelected ? { ['--tw-ring-color' as string]: `${m.brand}30` } as React.CSSProperties : {}}
          >
            <Image src={m.image} alt={m.name} width={100} height={100} className="size-10 object-contain sm:size-14" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-bold transition-colors sm:text-xl ${isSelected ? 'text-white' : 'text-white'}`}>{m.name}</h3>
              {isSelected && (
                <span className="inline-flex h-5 items-center rounded-full px-2 text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${m.brand}20`, color: m.brand }}>
                  Seleccionado
                </span>
              )}
            </div>
            <p className={`mt-0.5 text-xs transition-colors sm:text-sm ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>{m.subtitle}</p>
          </div>
          <ChevronDown className={`size-4 shrink-0 transition-all duration-300 sm:size-5 ${isSelected ? 'rotate-180' : 'rotate-0'}`} style={{ color: isSelected ? m.brand : '#52525b' }} />
        </div>

        <p className={`relative z-10 mt-3 text-xs leading-relaxed transition-colors sm:text-sm ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>{m.desc}</p>

        <div className="relative z-10 mt-3 flex flex-wrap gap-2">
          {m.tags.map(t => (
            <span
              key={t}
              className="inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-all sm:text-[10px]"
              style={{
                borderColor: isSelected ? `${m.brand}30` : 'rgba(255,255,255,0.06)',
                backgroundColor: isSelected ? `${m.brand}10` : 'transparent',
                color: isSelected ? m.brand : '#71717a',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}

function MethodDetail({ method, brand }: { method: PaymentMethod; brand: string }) {
  const info = getManualPaymentInfo(method.id as 'yape' | 'plin' | 'binance' | 'mercadopago')
  const qr = info?.qrData || null

  if (method.id === 'mercadopago') {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
        <div className="rounded-xl border border-white/8 bg-[#12121a] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-black/30">
              <Image src={method.image} alt={method.name} width={100} height={100} className="size-12 object-contain" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Mercado Pago</h4>
              <p className="mt-1 text-sm text-zinc-400">Serás redirigido a la plataforma segura de Mercado Pago para pagar con tarjeta, saldo o transferencia.</p>
              <Link href="/checkout" className="mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80 active:scale-95" style={{ backgroundColor: brand }}>
                Pagar ahora <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
      <div className="rounded-xl border border-white/8 bg-[#12121a] p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-5 sm:gap-8">
          {qr && (
            <div className="flex flex-col items-center justify-center sm:col-span-2">
              <div className="rounded-xl bg-white p-3 shadow-lg">
                <QRCodeSVG value={qr} size={190} bgColor="#ffffff" fgColor="#000000" />
              </div>
              <p className="mt-2 text-xs font-medium" style={{ color: brand }}>Escaneá con {method.name}</p>
            </div>
          )}

          <div className={`flex flex-col justify-center ${qr ? 'sm:col-span-3' : 'sm:col-span-5'}`}>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-black/30">
                <Image src={method.image} alt={method.name} width={60} height={60} className="size-7 object-contain" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{method.name}</h4>
                <p className="text-xs" style={{ color: brand }}>{info?.name}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `${brand}20`, backgroundColor: `${brand}06` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: brand }}>Datos para transferir</p>
              <p className="mt-1 text-lg font-bold text-white sm:text-xl">{info?.number}</p>
              <div className="mt-2"><CopyBtn text={info?.number || ''} /></div>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pasos</p>
              <ul className="mt-3 space-y-2">
                {info?.instructions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-zinc-300">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-bold" style={{ backgroundColor: `${brand}18`, color: brand }}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="min-w-[240px] flex-1"><ReceiptUpload /></div>
              <a href={DISCORD} target="_blank" rel="noreferrer noopener" className="inline-flex h-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/8 hover:text-white active:scale-95">
                <MessageCircle className="size-3.5" /> Ayuda en Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function InfoPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const active = methods.find(m => m.id === selected) || null

  return (
    <>
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/15 bg-red-500/8 px-4 py-1">
          <span className="size-1.5 rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,35,60,0.5)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">Métodos de pago</span>
        </div>
        <h1 className="mt-5 font-black uppercase leading-[1.05] tracking-tight text-white" style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: 'clamp(2.4rem, 6vw, 4.8rem)' }}>
          Cómo <span className="text-red-500">Pagar</span>
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
          Todos nuestros métodos de pago son seguros y verificados. Elegí el que más te guste.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {methods.map((m, i) => (
          <MethodCard key={m.id} m={m} idx={i} isSelected={selected === m.id} onSelect={() => setSelected(prev => prev === m.id ? null : m.id)} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active && <MethodDetail key={active.id} method={active} brand={active.brand} />}
      </AnimatePresence>

      <div className="mx-auto mt-24 max-w-4xl">
        <div className="rounded-xl border border-white/8 bg-[#12121a] p-6 sm:p-8 lg:p-10">
          <p className="text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
            Todos los pagos se coordinan de forma segura y con atención directa.{' '}
            <span className="font-medium text-zinc-200">Si tenés dudas, contactanos por Discord.</span>
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {trust.map(item => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/30 px-4 py-4 transition-colors hover:border-white/10 sm:flex-col sm:text-center sm:px-5 sm:py-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 ring-1 ring-red-500/15 sm:size-12">
                  <item.icon className="size-5 text-red-400 sm:size-6" />
                </div>
                <div className="sm:mt-1">
                  <p className="text-sm font-bold text-white sm:text-base">{item.label}</p>
                  <p className="text-xs text-zinc-500 sm:text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <a href={DISCORD} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-500/8 px-5 py-2.5 text-sm font-semibold text-indigo-300 transition-all hover:bg-indigo-500/12 hover:text-indigo-200 active:scale-95">
              <MessageCircle className="size-4" /> Contactar por Discord <ExternalLink className="size-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

function SuccessView({ order }: { order: OrderData }) {
  const info = statusInfo[order.status] || statusInfo.pending_payment
  return (
    <div className="mx-auto max-w-lg px-4 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className={`mx-auto mb-6 flex size-20 items-center justify-center rounded-full ${info.bg}`}>
        {order.status === 'paid' ? <CheckCircle className="size-10 text-green-400" /> : <Clock className="size-10 text-yellow-400" />}
      </motion.div>
      <h1 className="text-3xl font-black text-white">Pedido #{order.id.slice(-8)}</h1>
      <span className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${info.bg} ${info.color}`}>{info.icon} {info.label}</span>
      <div className="mt-8 rounded-xl border border-white/8 bg-[#12121a] p-6 text-left">
        <p className="text-sm text-zinc-400">Resumen del pedido</p>
        <div className="mt-4 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm"><span className="text-white">{item.name} × {item.quantity}</span><span className="font-bold text-white">S/{(item.price * item.quantity).toFixed(2)}</span></div>
          ))}
        </div>
        <div className="mt-4 border-t border-white/8 pt-4"><div className="flex justify-between text-base font-bold"><span className="text-zinc-200">Total</span><span className="text-red-400">S/{order.total.toFixed(2)}</span></div></div>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        {order.status === 'paid' ? (
          <Link href="/stock" className="rounded-xl bg-red-600 py-3 text-center font-bold text-white transition-colors hover:bg-red-500 active:scale-[0.98]">Seguir comprando</Link>
        ) : (
          <><p className="text-sm text-zinc-500">Estamos verificando tu pago. Te notificaremos por Discord cuando esté confirmado.</p><a href={DISCORD} target="_blank" rel="noreferrer noopener" className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/8 py-3 text-sm font-bold text-indigo-300 transition-colors hover:bg-indigo-500/12"><MessageCircle className="size-4" /> Consultar en Discord</a></>
        )}
      </div>
    </div>
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
  const hasCtx = success || orderId || paymentId || externalRef

  useEffect(() => {
    if (!hasCtx) { setLoading(false); return }
    const check = async () => {
      try {
        const p = new URLSearchParams()
        const eid = orderId || externalRef
        if (eid) p.set('orderId', eid)
        if (paymentId) p.set('paymentId', paymentId)
        if (!eid && !paymentId) { setLoading(false); return }
        const res = await fetch(`/api/orders/status?${p.toString()}`)
        if (res.ok) setOrder((await res.json()).order)
        else setError((await res.json().catch(() => ({}))).error || 'Error')
      } catch { setError('Error de conexión') } finally { setLoading(false) }
    }
    check()
    if (success === 'true') { const i = setInterval(check, 5000); setTimeout(() => clearInterval(i), 60000); return () => clearInterval(i) }
  }, [success, orderId, paymentId, externalRef, hasCtx])

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-red-400" /></div>
  if (order) return <><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><SuccessView order={order} /></motion.div><div className="mx-auto mt-8 max-w-lg text-center"><Link href="/stock" className="text-sm text-zinc-500 transition-colors hover:text-red-400">← Volver al stock</Link></div></>
  if (error) return <div className="mx-auto max-w-lg px-4 pt-16 text-center"><XCircle className="mx-auto mb-4 size-12 text-zinc-600" /><h1 className="text-2xl font-black text-white">Error</h1><p className="mt-3 text-zinc-400">{error}</p><Link href="/stock" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition-colors hover:bg-red-500 active:scale-[0.98]"><ShoppingCart className="size-4" /> Ir al stock</Link></div>
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}><InfoPage /></motion.div>
}

export default function PagosPage() {
  return (
    <main className="relative min-h-screen pt-24 pb-20" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(239,35,60,0.04) 0%, transparent 40%)' }} />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,35,60,0.03)_0%,transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-red-400" /></div>}>
          <PagosContent />
        </Suspense>
      </div>
    </main>
  )
}
