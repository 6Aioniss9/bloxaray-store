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
    q: 'Como recibo mi fruta?',
    a: 'Despues de confirmar el pago, nuestro staff te contacta por Discord y coordina un intercambio seguro dentro del juego. Te agregamos al server de Blox Fruits y hacemos el trade. No necesitas hacer nada complejo.',
  },
  {
    q: 'Que tan rapida es la entrega?',
    a: 'La mayoria de pedidos se entregan en menos de 5 minutos despues de confirmar el pago. En horas pico puede tomar un poco mas, pero nuestro equipo te mantiene informado todo el tiempo por Discord.',
  },
  {
    q: 'Es seguro para mi cuenta de Roblox?',
    a: 'Totalmente. Solo usamos metodos de intercambio legitimos dentro del juego. Nunca pedimos tu contrasena, no usamos scripts ni exploits. Tu cuenta esta 100% segura.',
  },
  {
    q: 'Que metodos de pago aceptan?',
    a: 'Aceptamos Mercado Pago (tarjeta, saldo, transferencia), Yape, Plin y Binance (USDT). Todos los pagos se procesan a traves de canales seguros y verificados. Elegi el que te sea mas comodo.',
  },
  {
    q: 'Como pago con Yape o Plin?',
    a: 'Selecciona Yape o Plin en el checkout, ahi veras nuestro numero y un codigo QR para escanear. Envia el monto exacto, captura la pantalla y sube el comprobante. En minutos confirmamos tu pago.',
  },
  {
    q: 'Como pago con Binance?',
    a: 'Selecciona Binance en el checkout. Te mostramos nuestro ID de Binance Pay. Envia el monto exacto en USDT, captura el comprobante y subelo en la pagina. La transferencia es inmediata.',
  },
  {
    q: 'Que pasa si la fruta que compre se agoto?',
    a: 'Nuestro stock se actualiza en vivo. Si compras una fruta y se agota antes de entregarla, te reabastecemos en el menor tiempo posible o te reembolsamos el total, tu decides.',
  },
  {
    q: 'Puedo cancelar mi pedido?',
    a: 'Si el pago fue realizado pero la fruta todavia no se entrego, podes cancelar y solicitar reembolso total por Discord. Una vez entregada la fruta en el juego, no se aceptan cancelaciones.',
  },
  {
    q: 'Tienen garantia?',
    a: 'Si. Si por algun motivo no recibis tu fruta o hay un problema con la entrega, te reembolsamos o te entregamos otra fruta de igual valor. Todo esta respaldado por nuestra atencion directa.',
  },
  {
    q: 'Donde puedo ver mi pedido?',
    a: 'Despues de comprar, vas a recibir un enlace de seguimiento. Tambien podes consultar el estado de tu pedido en cualquier momento contactando a nuestro soporte por Discord.',
  },
  {
    q: 'Hacen envios a otros juegos?',
    a: 'No, solo trabajamos con Blox Fruits en Roblox. Si en el futuro expandimos a otros juegos, lo anunciaremos en nuestro Discord.',
  },
  {
    q: 'Tienen descuentos por cantidad?',
    a: 'Si haces pedidos multiples, contactanos por Discord y te hacemos un precio especial. Tambien tenemos promociones frecuentes que anunciamos en nuestro servidor.',
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
