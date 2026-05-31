'use client'

import { MessageCircle, Music2, Mail, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { DISCORD_URL, TIKTOK_URL } from '@/lib/fruits'

const links = [
  { label: 'Inicio', href: '/' },
  { label: 'Stock', href: '/stock' },
  { label: 'Pagos', href: '/pagos' },
  { label: 'Resenas', href: '/resenas' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Terminos', href: '/terminos' },
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Reembolsos', href: '/terminos' },
  { label: 'Envios', href: '/terminos' },
]

const socials = [
  { label: 'Discord', href: DISCORD_URL, icon: MessageCircle },
  { label: 'TikTok', href: TIKTOK_URL, icon: Music2 },
  { label: 'Correo', href: 'mailto:support@bloxaray.store', icon: Mail },
]

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-red-500/15 bg-[#050510]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent shadow-[0_0_12px_4px_rgba(239,35,60,0.08)]" />

      <div className="mx-auto max-w-7xl px-6 pb-8 pt-12 sm:px-8 lg:px-10 lg:pb-6 lg:pt-14">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.png"
              alt="BLOXARAY"
              width={280}
              height={70}
              className="w-[140px] sm:w-[160px] h-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden flex-wrap justify-center gap-x-6 gap-y-2 lg:flex">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="group relative text-[11px] font-semibold tracking-[0.12em] text-zinc-400 transition-colors duration-200 hover:text-red-400"
                style={{ fontFamily: 'var(--font-heading), sans-serif' }}
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-red-500 transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {socials.map((s) => {
              const Icon = s.icon
              return (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target={s.label !== 'Correo' ? '_blank' : undefined}
                  rel={s.label !== 'Correo' ? 'noreferrer' : undefined}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-400 backdrop-blur transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_16px_-4px_rgba(239,35,60,0.3)]"
                  aria-label={s.label}
                >
                  <Icon className="size-4" />
                </motion.a>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-6 lg:hidden">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2.5">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-[11px] font-semibold tracking-[0.12em] text-zinc-400 transition-colors duration-200 hover:text-red-400"
                style={{ fontFamily: 'var(--font-heading), sans-serif' }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative mt-10 lg:mt-12">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col items-center justify-between gap-4 pt-5 sm:flex-row sm:gap-0">
            <p className="text-xs text-zinc-600">
              &copy; 2026 BLOXARAY. Todos los derechos reservados.
            </p>

            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] text-zinc-500 transition-colors duration-200 hover:text-red-400"
              style={{ fontFamily: 'var(--font-heading), sans-serif' }}
            >
              VOLVER ARRIBA
              <ChevronUp className="size-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}
