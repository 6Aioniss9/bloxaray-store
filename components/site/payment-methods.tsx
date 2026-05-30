import { Landmark, Smartphone, Wallet, Bitcoin } from 'lucide-react'
import { Reveal, SectionHeading } from '@/components/site/reveal'

const methods = [
  {
    name: 'Binance',
    desc: 'Pay with crypto (USDT) directly from your Binance wallet.',
    icon: Bitcoin,
    tone: 'text-accent',
  },
  {
    name: 'Yape',
    desc: 'Fast mobile payments for buyers in Peru.',
    icon: Smartphone,
    tone: 'text-primary',
  },
  {
    name: 'Plin',
    desc: 'Instant transfers supported across local banks.',
    icon: Wallet,
    tone: 'text-success',
  },
  {
    name: 'Bank Transfer',
    desc: 'Standard transfer to a verified business account.',
    icon: Landmark,
    tone: 'text-chart-5',
  },
]

export function PaymentMethods() {
  return (
    <section id="payments" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute left-0 top-1/4 -z-10 size-[420px] rounded-full glow-cyan blur-3xl opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Payments"
          title="Pay your way"
          description="Multiple secure and verified payment methods. Choose whatever is easiest for you."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((m, i) => (
            <Reveal key={m.name} delay={i * 0.07}>
              <div className="group flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40">
                <span className="flex size-12 items-center justify-center rounded-xl bg-secondary ring-1 ring-border">
                  <m.icon className={`size-6 ${m.tone}`} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {m.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
