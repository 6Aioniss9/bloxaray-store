import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Reveal, SectionHeading } from '@/components/site/reveal'

const faqs = [
  {
    q: 'What exactly am I buying?',
    a: 'You are buying physical Blox Fruits — the actual in-game fruit item delivered to your account or inventory, not a script or anything that risks your account.',
  },
  {
    q: 'How fast is delivery?',
    a: 'Most orders are delivered in under 5 minutes after payment is confirmed. During peak hours it may take slightly longer, but our team keeps you updated the whole time.',
  },
  {
    q: 'How do I receive my fruit?',
    a: 'After purchasing through Discord, our staff will coordinate a safe in-game trade or drop. We walk you through every step so the handoff is smooth.',
  },
  {
    q: 'Is this safe for my account?',
    a: 'Yes. We use legitimate in-game trading methods only. We never ask for your password and never use anything that could get your account banned.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Binance (USDT), Yape, Plin and bank transfer. All payments are processed through verified, secure channels.',
  },
  {
    q: 'What if my fruit goes out of stock?',
    a: 'Our stock updates daily and is shown live on the site. If something sells out after you order, we will restock fast or issue a full refund — your choice.',
  },
]

export function Faq() {
  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you need to know before placing your first order."
        />

        <Reveal>
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3"
            defaultValue="item-0"
          >
            {faqs.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card/50 px-5 backdrop-blur-sm data-[state=open]:border-primary/40"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
