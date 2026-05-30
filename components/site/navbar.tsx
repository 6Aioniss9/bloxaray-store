'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValueEvent, useScroll, type Variants } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { CartIndicator } from '@/components/site/cart-indicator'
import { Button } from '@/components/ui/button'
import { DISCORD_URL } from '@/lib/fruits'

const links = [
  { label: 'Inicio', href: '/' },
  { label: 'Stock', href: '/stock' },
  { label: 'Pagos', href: '/pagos' },
  { label: 'Resenas', href: '/resenas' },
  { label: 'FAQ', href: '/faq' },
]

const linkVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' },
  }),
}

const mobileItemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.25, ease: 'easeOut' },
  }),
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const { scrollY } = useScroll()
  const pathname = usePathname()

  useMotionValueEvent(scrollY, 'change', (current) => {
    const diff = current - lastScrollY.current
    setScrolled(current > 60)
    if (diff > 10) {
      setVisible(false)
    } else if (diff < -10) {
      setVisible(true)
    }
    lastScrollY.current = current
  })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.clientY < 120) setVisible(true)
  }

  return (
    <>
      <motion.header
        animate={{
          y: visible ? 0 : -120,
          height: scrolled ? '64px' : '88px',
          backgroundColor: scrolled ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.6)',
          boxShadow: scrolled
            ? '0 4px 30px -12px rgba(239,35,60,0.15), 0 4px 20px -8px rgba(0,0,0,0.6)'
            : '0 0 40px -12px rgba(239,35,60,0.2)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseMove={handleMouseMove}
        className="fixed inset-x-0 top-0 z-50 backdrop-blur-2xl"
      >
        <nav className="mx-auto flex h-full max-w-7xl items-center px-6 sm:px-8 lg:px-10">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="BLOXARAY"
              width={280}
              height={70}
              className="w-[160px] sm:w-[200px] lg:w-[280px] h-auto object-contain"
              priority
            />
          </Link>

          <div className="ml-auto hidden items-center gap-0.5 lg:flex">
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={linkVariants}
              >
                <Link
                  href={link.href}
                  className={`group relative px-3.5 py-2 text-sm font-semibold tracking-wide transition-all duration-200 ${
                    pathname === link.href
                      ? 'text-white'
                      : 'text-white/65 hover:text-red-400'
                  }`}
                  style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-px left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-red-500 transition-all duration-300 ease-out ${
                      pathname === link.href
                        ? 'w-[70%] opacity-100 shadow-[0_0_8px_2px_rgba(239,35,60,0.4)]'
                        : 'w-0 opacity-0 group-hover:w-[60%] group-hover:opacity-100'
                    }`}
                  />
                </Link>
              </motion.div>
            ))}
            <div className="ml-2">
              <CartIndicator />
            </div>
            <div className="ml-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-[14px] bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_-6px_rgba(239,35,60,0.5)] transition-shadow duration-300 hover:shadow-[0_0_30px_-4px_rgba(239,35,60,0.7)]"
                >
                  <ShoppingCart className="size-4" />
                  Discord
                </a>
              </motion.div>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => setOpen((v) => !v)}
            whileTap={{ scale: 0.9 }}
            className="ml-auto inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white backdrop-blur transition-colors hover:border-red-500/40 hover:bg-red-500/10 lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </motion.button>
        </nav>
      </motion.header>

      <motion.div
        animate={{ height: scrolled ? '64px' : '88px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed inset-x-0 z-40 border-t border-red-500/20 bg-black/95 backdrop-blur-2xl lg:hidden ${
              scrolled ? 'top-[64px]' : 'top-[88px]'
            }`}
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-8 sm:px-8">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={mobileItemVariants}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-200 ${
                      pathname === link.href
                        ? 'bg-red-500/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                    style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <span className="ml-auto flex size-2 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,35,60,0.5)]" />
                    )}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 flex items-center gap-2 px-4">
                <div className="flex-1">
                  <CartIndicator />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.25 }}
                className="mt-4 px-4"
              >
                <Button
                  asChild
                  className="w-full rounded-[14px] bg-red-600 text-white shadow-[0_0_24px_-6px_rgba(239,35,60,0.5)] hover:bg-red-500"
                >
                  <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                    <ShoppingCart className="size-4" />
                    Comprar en Discord
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
