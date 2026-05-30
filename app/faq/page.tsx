'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Reveal } from '@/components/site/reveal'

const faqs = [
  {
    q: 'Que estoy comprando exactamente?',
    a: 'Estas comprando frutas fisicas de Blox Fruits: el item real dentro del juego, entregado a tu inventario mediante un intercambio seguro. No es un script ni nada que arriesgue tu cuenta.',
  },
  {
    q: 'Que tan rapida es la entrega?',
    a: 'La mayoria de pedidos se entregan en menos de 5 minutos despues de confirmar el pago. En horas pico puede tomar un poco mas, pero nuestro equipo te mantiene informado todo el tiempo.',
  },
  {
    q: 'Como recibo mi fruta?',
    a: 'Despues de comprar a traves de Discord, nuestro staff coordinara un intercambio seguro dentro del juego. Te guiamos en cada paso para que la entrega sea sencilla.',
  },
  {
    q: 'Es seguro para mi cuenta?',
    a: 'Si. Solo usamos metodos de intercambio legitimos dentro del juego. Nunca pedimos tu contrasena ni usamos nada que pueda poner en riesgo tu cuenta.',
  },
  {
    q: 'Que metodos de pago aceptan?',
    a: 'Aceptamos Binance (USDT), Yape, Plin y transferencia bancaria. Todos los pagos se procesan a traves de canales seguros y verificados.',
  },
  {
    q: 'Que pasa si mi fruta se agota?',
    a: 'Nuestro stock se actualiza diariamente y se muestra en vivo en la pagina. Si algo se agota despues de tu pedido, lo reabastecemos rapido o te reembolsamos el total, tu eliges.',
  },
]

export default function FaqPage() {
  return (
    <main className="relative min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400">
            FAQ
          </span>
          <h1
            className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Preguntas Frecuentes
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-400">
            Todo lo que necesitas saber antes de hacer tu primer pedido.
          </p>
        </Reveal>

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
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-5 backdrop-blur-sm data-[state=open]:border-red-500/40"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-white hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-zinc-400">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </main>
  )
}
