'use client'

import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SectionHeading } from '@/components/site/reveal'
import { cn } from '@/lib/utils'

const reviews = [
  {
    name: 'ShadowKing',
    handle: '@shadowk',
    rating: 5,
    text: 'Got my Kitsune in literally 4 minutes. Smooth process and super friendly support. 10/10.',
    tone: 'bg-primary/20 text-primary',
  },
  {
    name: 'LunaPvP',
    handle: '@lunapvp',
    rating: 5,
    text: 'Was nervous buying physical fruits but Aioniss is the real deal. Dragon delivered instantly.',
    tone: 'bg-accent/20 text-accent',
  },
  {
    name: 'Kaizen',
    handle: '@kaizen_rblx',
    rating: 5,
    text: 'Best prices I found anywhere and the stock is always accurate. Already came back twice.',
    tone: 'bg-success/20 text-success',
  },
  {
    name: 'Mara',
    handle: '@maraplays',
    rating: 5,
    text: 'Paid with Yape, got my Leopard right away. Clean, fast and trustworthy.',
    tone: 'bg-chart-5/20 text-chart-5',
  },
  {
    name: 'Vortex',
    handle: '@vortexgg',
    rating: 4,
    text: 'Great experience overall. Support answered all my questions before I bought Buddha.',
    tone: 'bg-primary/20 text-primary',
  },
]

export function Reviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section id="reviews" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/4 -z-10 size-[460px] -translate-x-1/2 rounded-full glow-purple blur-3xl opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Reviews"
          title="Loved by the community"
          description="Real feedback from players who trusted Aioniss with their fruits."
        />

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5">
              {reviews.map((r) => (
                <div
                  key={r.handle}
                  className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <figure className="flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-sm">
                    <Quote className="size-7 text-primary/50" />
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'size-4',
                            i < r.rating
                              ? 'fill-accent text-accent'
                              : 'text-muted',
                          )}
                        />
                      ))}
                    </div>
                    <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">
                      “{r.text}”
                    </blockquote>
                    <figcaption className="flex items-center gap-3 border-t border-border/60 pt-4">
                      <Avatar className="size-10">
                        <AvatarFallback className={cn('font-semibold', r.tone)}>
                          {r.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="flex items-center gap-1 text-sm font-semibold">
                          {r.name}
                          <BadgeCheck className="size-3.5 text-success" />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.handle}
                        </p>
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
              aria-label="Previous reviews"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next reviews"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card/60 text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
