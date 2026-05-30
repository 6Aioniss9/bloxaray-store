'use client'

import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Reveal } from '@/components/site/reveal'
import { cn } from '@/lib/utils'

const reviews = [
  {
    name: 'ShadowKing',
    handle: '@shadowk',
    rating: 5,
    text: 'Consegui mi Kitsune en literalmente 4 minutos. Proceso rapido y soporte muy amable. 10/10.',
    tone: 'bg-red-500/20 text-red-400',
  },
  {
    name: 'LunaPvP',
    handle: '@lunapvp',
    rating: 5,
    text: 'Estaba nervioso comprando frutas fisicas pero BLOXARAY es legitimo. Dragon entregado al instante.',
    tone: 'bg-orange-500/20 text-orange-400',
  },
  {
    name: 'Kaizen',
    handle: '@kaizen_rblx',
    rating: 5,
    text: 'Los mejores precios que encontre en cualquier lado y el stock siempre es preciso. Ya volvi dos veces.',
    tone: 'bg-green-500/20 text-green-400',
  },
  {
    name: 'Mara',
    handle: '@maraplays',
    rating: 5,
    text: 'Pague con Yape y recibi mi Leopard al instante. Limpio, rapido y confiable.',
    tone: 'bg-blue-500/20 text-blue-400',
  },
  {
    name: 'Vortex',
    handle: '@vortexgg',
    rating: 4,
    text: 'Gran experiencia en general. El soporte respondio todas mis dudas antes de comprar Buddha.',
    tone: 'bg-red-500/20 text-red-400',
  },
]

export default function ResenasPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <main className="relative min-h-screen pt-24 pb-20">
      <div className="pointer-events-none absolute left-1/2 top-1/4 -z-10 size-[460px] -translate-x-1/2 rounded-full glow-red blur-3xl opacity-30" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400">
            Resenas
          </span>
          <h1
            className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Lo Que Dicen Nuestros Clientes
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-400">
            Opiniones reales de jugadores que confiaron en BLOXARAY para sus
            frutas.
          </p>
        </Reveal>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5">
              {reviews.map((r) => (
                <div
                  key={r.handle}
                  className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <figure className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                    <Quote className="size-7 text-red-500/50" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'size-4',
                            i < r.rating
                              ? 'fill-orange-400 text-orange-400'
                              : 'text-zinc-600',
                          )}
                        />
                      ))}
                    </div>
                    <blockquote className="flex-1 text-sm leading-relaxed text-white/80">
                      &ldquo;{r.text}&rdquo;
                    </blockquote>
                    <figcaption className="flex items-center gap-3 border-t border-white/10 pt-4">
                      <Avatar className="size-10">
                        <AvatarFallback
                          className={cn('font-semibold', r.tone)}
                        >
                          {r.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="flex items-center gap-1 text-sm font-semibold text-white">
                          {r.name}
                          <BadgeCheck className="size-3.5 text-green-400" />
                        </p>
                        <p className="text-xs text-zinc-500">{r.handle}</p>
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Resenas anteriores"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Siguientes resenas"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
