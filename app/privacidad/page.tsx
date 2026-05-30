import type { Metadata } from 'next'
import { Reveal } from '@/components/site/reveal'

export const metadata: Metadata = {
  title: 'Politica de Privacidad — BLOXARAY',
  description:
    'Politica de privacidad de BLOXARAY. Informacion sobre como recopilamos, usamos y protegemos tus datos personales.',
}

const sections = [
  {
    title: '1. Informacion que Recopilamos',
    content:
      'Recopilamos la siguiente informacion cuando utilizas nuestros servicios: nombre de usuario de Roblox/Blox Fruits necesario para la entrega de tu compra, correo electronico para comunicacion relacionada con tu pedido, informacion de pago procesada a traves de Stripe (no almacenamos datos de tarjetas de credito), y mensajes de chat de soporte para mejorar nuestra atencion al cliente.',
  },
  {
    title: '2. Uso de la Informacion',
    content:
      'Utilizamos tu informacion unicamente para: procesar y completar tus compras, comunicarnos contigo sobre el estado de tu pedido, mejorar nuestro servicio de soporte al cliente, cumplir con obligaciones legales y regulatorias. No utilizamos tu informacion para fines de marketing no solicitado.',
  },
  {
    title: '3. Proteccion de Datos',
    content:
      'Implementamos medidas de seguridad tecnicas y organizativas para proteger tu informacion personal contra acceso no autorizado, alteracion, divulgacion o destruccion. Esto incluye cifrado SSL/TLS para todas las comunicaciones, almacenamiento seguro de datos y acceso restringido a personal autorizado.',
  },
  {
    title: '4. Comparticion de Datos',
    content:
      'No vendemos, comerciamos ni transferimos tu informacion personal a terceros, excepto: a Stripe para el procesamiento de pagos (sujeto a su propia politica de privacidad), cuando sea requerido por ley o para proteger nuestros derechos legales.',
  },
  {
    title: '5. Cookies',
    content:
      'Utilizamos cookies esenciales para el funcionamiento de la pagina web y cookies de sesion para mantener tu sesion de navegacion. No utilizamos cookies de seguimiento publicitario ni de terceros con fines de marketing.',
  },
  {
    title: '6. Retencion de Datos',
    content:
      'Conservamos tu informacion personal solo durante el tiempo necesario para cumplir con los fines descritos en esta politica, o segun lo requerido por la ley. Los registros de chat y tickets de soporte se conservan por un maximo de 12 meses.',
  },
  {
    title: '7. Tus Derechos',
    content:
      'Tienes derecho a: acceder a tus datos personales que almacenamos, solicitar la correccion de datos inexactos, solicitar la eliminacion de tus datos, retirar tu consentimiento en cualquier momento. Para ejercer estos derechos, contactanos a traves de nuestro Discord o correo electronico.',
  },
  {
    title: '8. Servicios de Terceros',
    content:
      'Nuestro sitio utiliza servicios de terceros como Stripe para el procesamiento de pagos. Estos servicios tienen sus propias politicas de privacidad y no nos hacemos responsables por sus practicas. Te recomendamos revisar la Politica de Privacidad de Stripe para mas informacion.',
  },
  {
    title: '9. Cambios a esta Politica',
    content:
      'Podemos actualizar esta Politica de Privacidad periodicamente. Te notificaremos sobre cambios significativos a traves de nuestro sitio web o por correo electronico. La fecha de la ultima actualizacion se indica al inicio de esta pagina.',
  },
  {
    title: '10. Contacto',
    content:
      'Si tienes preguntas sobre esta Politica de Privacidad o sobre como manejamos tus datos, contactanos a traves de nuestro Discord oficial o enviando un correo a soporte@bloxaray.store.',
  },
]

export default function PrivacidadPage() {
  return (
    <main className="relative min-h-screen pt-24 pb-20">
      <div className="pointer-events-none absolute left-0 top-1/4 -z-10 size-[420px] rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, rgba(239,35,60,0.15), transparent)' }} />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400">
            Legal
          </span>
          <h1
            className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Politica de Privacidad
          </h1>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-zinc-500">
            Ultima actualizacion: Mayo 2026
          </p>
        </Reveal>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <Reveal key={i} delay={Math.min(i * 0.04, 0.3)}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all hover:border-red-500/10">
                <h2 className="mb-3 text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                  {s.title}
                </h2>
                <p className="text-sm leading-relaxed text-zinc-400">{s.content}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  )
}
