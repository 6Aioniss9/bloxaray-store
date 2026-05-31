'use client'

import { Suspense, useState } from 'react'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, XCircle, Clock, Loader2, Package, ShoppingCart, ShieldCheck, Zap, HeadphonesIcon, Copy, Check, Pointer, Wallet, Upload, MessageCircle, ExternalLink } from 'lucide-react'
import { getManualPaymentInfo } from '@/lib/payment-methods'

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
  brand: string
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

const DISCORD_URL = 'https://discord.gg/aioniss'

const howItWorks = [
  { icon: Pointer, title: 'Elegí', desc: 'Seleccioná el método de pago que prefieras' },
  { icon: Wallet, title: 'Pagá', desc: 'Transferí el monto exacto a los datos indicados' },
  { icon: Upload, title: 'Comprobante', desc: 'Subí la captura de confirmación de tu pago' },
  { icon: Package, title: 'Recibí', desc: 'Te entregamos tu fruta al instante en el juego' },
]

const paymentMethods: PaymentMethod[] = [
  {
    id: 'binance',
    name: 'Binance',
    subtitle: 'Pago rápido y seguro',
    desc: 'Paga con criptomonedas desde tu cuenta Binance. Transferencia internacional inmediata.',
    image: '/payments/binance.png',
    tags: ['Cripto', 'Seguro', 'Internacional'],
    color: 'text-amber-400',
    brand: '#f59e0b',
    glow: 'rgba(251,191,36,0.25)',
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
    brand: '#d946ef',
    glow: 'rgba(217,70,239,0.25)',
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
    brand: '#06b6d4',
    glow: 'rgba(6,182,212,0.25)',
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
    brand: '#38bdf8',
    glow: 'rgba(56,189,248,0.25)',
    border: 'border-sky-500/30 group-hover:border-sky-400/60',
    bgGlow: 'from-sky-500/5',
  },
]

const trustItems = [
  { icon: ShieldCheck, label: 'Pago 100% Seguro', desc: 'Tus datos están protegidos' },
  { icon: Zap, label: 'Entrega Inmediata', desc: 'Recibes tu fruta al instante' },
  { icon: HeadphonesIcon, label: 'Soporte 24/7', desc: 'Atención personalizada por Discord' },
]

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white active:scale-95"
    >
      {copied ? (
        <><Check className="size-4 text-green-400" /> Copiado</>
      ) : (
        <><Copy className="size-4" /> {label}</>
      )}
    </button>
  )
}

function ReceiptUpload({ orderId: initialOrderId }: { orderId?: string }) {
  const [orderId, setOrderId] = useState(initialOrderId || '')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleUpload = async () => {
    if (!file || !orderId.trim()) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('orderId', orderId.trim())
      const res = await fetch('/upload/receipt', { method: 'POST', body: formData })
      if (res.ok) {
        setUploaded(true)
        setFile(null)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Error al subir el comprobante')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setUploading(false)
    }
  }

  if (uploaded) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/8 px-5 py-4">
        <CheckCircle className="size-5 shrink-0 text-green-400" />
        <p className="text-sm font-medium text-green-300">Comprobante subido correctamente</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-sm font-semibold text-white">Subí tu comprobante de pago</p>
      <p className="mt-1 text-xs text-zinc-500">Si ya realizaste el pago, subí la captura de pantalla acá</p>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="ID del pedido (opcional si ya lo tenés)"
          className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-red-500/40"
        />

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-red-500/40 bg-red-500/5 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10">
            {file ? file.name : 'Seleccionar imagen'}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || uploading || !orderId.trim()}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
        </div>

        {error && <p className="text-xs font-medium text-red-400">{error}</p>}
      </div>
    </div>
  )
}

function PaymentDetail({ method, onClose }: { method: PaymentMethod; onClose: () => void }) {
  const info = getManualPaymentInfo(method.id as 'yape' | 'plin' | 'binance' | 'mercadopago')
  const qrData = info?.qrData || null

  if (method.id === 'mercadopago') {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="relative mt-5 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-black/50 to-black/20 p-6 backdrop-blur-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-20" style={{ background: `radial-gradient(circle at 0% 0%, ${method.glow}, transparent 70%)` }} />

          <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08]">
              <Image src={method.image} alt={method.name} width={80} height={80} className="size-12 object-contain" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Mercado Pago</h4>
              <p className="mt-1 text-sm text-zinc-400">Serás redirigido a la plataforma segura de Mercado Pago para completar el pago con tarjeta, saldo o transferencia.</p>
              <Link
                href="/checkout"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-sky-500"
              >
                Ir a pagar con Mercado Pago
                <ExternalLink className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div
        className="relative mt-5 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-black/50 to-black/20 p-6 backdrop-blur-2xl transition-all sm:p-8"
        style={{ boxShadow: `0 0 60px -30px ${method.glow}` }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-10" style={{ background: `radial-gradient(circle at 0% 0%, ${method.glow}, transparent 70%)` }} />
        <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {qrData && (
            <div className="flex flex-col items-center justify-center lg:col-span-2">
              <div className="rounded-2xl bg-white p-4 shadow-xl" style={{ boxShadow: `0 0 40px -15px ${method.glow}` }}>
                <QRCodeSVG value={qrData} size={180} bgColor="#ffffff" fgColor="#000000" />
              </div>
              <p className="mt-3 text-xs text-zinc-500">Escaneá con tu app {method.name}</p>
            </div>
          )}

          <div className={`flex flex-col justify-center ${qrData ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-xl bg-white/[0.04] ring-1 ring-white/[0.08]">
                <Image src={method.image} alt={method.name} width={60} height={60} className="size-8 object-contain" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{method.name}</h4>
                <p className="text-sm" style={{ color: method.brand }}>{info?.name}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Datos para transferir</p>
              <p className="text-base font-bold text-white sm:text-lg">{info?.number}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={info?.number || ''} label="Copiar número" />
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Pasos</p>
              <ul className="space-y-2.5">
                {info?.instructions.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: `${method.glow.replace('0.25', '0.15')}`, color: method.brand }}>
                      {i + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed text-zinc-300">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <ReceiptUpload />
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-white"
              >
                <MessageCircle className="size-4" />
                Ayuda por Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function PaymentCard({
  method,
  index,
  isSelected,
  onSelect,
}: {
  method: PaymentMethod
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      className="group relative h-full text-left"
    >
      <div
        className="absolute -inset-3 rounded-[24px] opacity-0 blur-2xl transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at center, ${method.glow}, transparent 70%)`,
          opacity: isSelected ? 1 : 0,
        }}
      />

      <div
        className={`relative flex h-full flex-col rounded-3xl border bg-gradient-to-b from-[#0c0c1a] to-[#060610] p-8 backdrop-blur-2xl transition-all duration-500 sm:p-10 ${
          isSelected
            ? '-translate-y-1 border-white/[0.18]'
            : 'border-white/[0.07] group-hover:-translate-y-1 group-hover:border-white/[0.12]'
        }`}
        style={{
          boxShadow: isSelected
            ? `0 25px 80px -20px ${method.glow}, inset 0 0 80px -40px ${method.glow}`
            : '0 25px 80px -25px rgba(0,0,0,0.6)',
        }}
      >
        <div className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

        <div className="relative z-10 flex items-start gap-5 sm:gap-6">
          <div
            className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04] ring-1 transition-all duration-500 sm:size-24"
            style={{ ['--tw-ring-color' as string]: isSelected ? `${method.brand}40` : 'rgba(255,255,255,0.08)' } as React.CSSProperties}
          >
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: isSelected ? 1 : 0, background: `radial-gradient(circle at center, ${method.glow}, transparent)` }}
            />
            <Image src={method.image} alt={method.name} width={120} height={120} className="relative size-14 object-contain sm:size-16" />
          </div>
          <div className="min-w-0 flex-1 pt-1 sm:pt-2">
            <h3 className="text-xl font-bold text-white sm:text-2xl">{method.name}</h3>
            <p className="mt-0.5 text-sm sm:text-base" style={{ color: isSelected ? method.brand : '#71717a' }}>
              {method.subtitle}
            </p>
          </div>
        </div>

        <div className="relative z-10 my-6 h-px bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-transparent" />

        <p className="relative z-10 text-sm leading-relaxed text-zinc-300 sm:text-base">
          {method.desc}
        </p>

        <div className="relative z-10 mt-auto flex flex-wrap gap-2.5 pt-6">
          {method.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 sm:text-[11px] ${
                isSelected
                  ? 'border-white/[0.15] text-zinc-200'
                  : 'border-white/[0.06] text-zinc-500 group-hover:border-white/[0.12] group-hover:text-zinc-300'
              }`}
              style={{ backgroundColor: isSelected ? `${method.glow.replace('0.25', '0.06')}` : 'rgba(255,255,255,0.03)' }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: method.brand }} />
              {tag}
            </span>
          ))}
        </div>

        <div className="relative z-10 mt-4 flex items-center gap-1 text-xs font-medium" style={{ color: method.brand }}>
          <span>Ver detalles</span>
          <span className="text-[10px]">→</span>
        </div>
      </div>
    </motion.button>
  )
}

function InfoPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const selected = paymentMethods.find((m) => m.id === selectedMethod) || null

  const handleSelect = (id: string) => {
    setSelectedMethod((prev) => (prev === id ? null : id))
  }

  return (
    <>
      <div className="mx-auto mb-14 max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-red-500/20 bg-red-500/[0.07] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400 shadow-[0_0_24px_-8px_rgba(239,35,60,0.3)] backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,35,60,0.5)]" />
            Métodos de Pago
          </span>
        </motion.div>

        <motion.h1
          className="mt-6 font-black uppercase leading-[1.05] tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
        >
          Cómo{' '}
          <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
            Pagar
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Todos nuestros métodos de pago son seguros y verificados. Elegí el que más te guste y seguí los pasos.
        </motion.p>
      </div>

      <motion.div
        className="mx-auto mb-16 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {howItWorks.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-5 text-center sm:px-6 sm:py-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
                <step.icon className="size-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  <span className="text-red-400">{i + 1}.</span> {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-7">
        {paymentMethods.map((m, i) => (
          <PaymentCard
            key={m.id}
            method={m}
            index={i}
            isSelected={selectedMethod === m.id}
            onSelect={() => handleSelect(m.id)}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <PaymentDetail
            key={selected.id}
            method={selected}
            onClose={() => setSelectedMethod(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="mx-auto mt-24 max-w-5xl"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative rounded-3xl border border-white/[0.06] bg-gradient-to-b from-black/50 to-black/20 p-8 backdrop-blur-2xl sm:p-10 lg:p-12">
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-30"
            style={{ background: 'linear-gradient(135deg, rgba(239,35,60,0.08) 0%, transparent 50%, rgba(239,35,60,0.03) 100%)' }}
          />

          <div className="absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

          <p className="relative text-center text-base leading-relaxed text-zinc-400 sm:text-lg">
            Todos los pagos se coordinan de forma segura y con atención directa.{' '}
            <span className="font-medium text-zinc-200">Si tenés dudas, contactanos por Discord.</span>
          </p>

          <div className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {trustItems.map((item) => (
              <div key={item.label} className="group flex flex-col items-center gap-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-6 py-6 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.04] sm:px-8 sm:py-8">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 transition-all duration-300 group-hover:bg-red-500/15 group-hover:ring-red-500/30">
                  <item.icon className="size-7 text-red-400" />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-white sm:text-lg">{item.label}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-8 flex justify-center">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] px-6 py-3 text-sm font-bold text-indigo-300 shadow-[0_0_24px_-8px_rgba(99,102,241,0.2)] transition-all hover:border-indigo-500/30 hover:bg-indigo-500/[0.1] hover:text-indigo-200"
            >
              <MessageCircle className="size-5" />
              Contactar por Discord
              <ExternalLink className="size-3.5 opacity-60" />
            </a>
          </div>
        </div>
      </motion.div>
    </>
  )
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
          <>
            <p className="text-sm text-zinc-500">
              Estamos verificando tu pago. Te notificaremos por Discord cuando esté confirmado.
            </p>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] py-3 text-sm font-bold text-indigo-300 transition-colors hover:bg-indigo-500/[0.12]"
            >
              <MessageCircle className="size-4" />
 Consultar en Discord
            </a>
          </>
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
        <div className="pointer-events-none absolute left-1/4 top-1/4 -z-10 -translate-x-1/2">
          <div className="size-[600px] rounded-full blur-3xl sm:size-[800px]" style={{ background: 'radial-gradient(circle, rgba(239,35,60,0.06) 0%, transparent 70%)' }} />
        </div>
        <div className="pointer-events-none absolute right-1/4 top-3/4 -z-10 translate-x-1/2">
          <div className="size-[400px] rounded-full blur-3xl sm:size-[600px]" style={{ background: 'radial-gradient(circle, rgba(239,35,60,0.04) 0%, transparent 70%)' }} />
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
