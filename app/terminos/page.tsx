import type { Metadata } from 'next'
import { Reveal } from '@/components/site/reveal'

export const metadata: Metadata = {
  title: 'Terminos y Condiciones — BLOXARAY',
  description:
    'Terminos y condiciones de compra de frutas fisicas de Blox Fruits en BLOXARAY. Al usar nuestro servicio aceptas estos terminos.',
}

const sections = [
  {
    title: '1. Aceptacion de los Terminos',
    content:
      'Al acceder o utilizar BLOXARAY, confirmas que has leido, entendido y aceptas quedar vinculado por estos Terminos y Condiciones. Si no estas de acuerdo, no utilices nuestros servicios.',
  },
  {
    title: '2. Descripcion del Servicio',
    content:
      'BLOXARAY es un marketplace que permite a los usuarios comprar frutas fisicas (items dentro del juego) de Blox Fruits. Actuamos como intermediarios para facilitar la compra y entrega de estos items a traves de intercambios seguros dentro del juego.',
  },
  {
    title: '3. Proceso de Compra',
    content:
      'Para realizar una compra, el usuario debe seleccionar una fruta disponible en stock, completar el pago a traves de nuestro sistema de pago (Stripe) o metodos alternativos (Binance, Yape, Plin, Transferencia). Una vez confirmado el pago, nuestro equipo coordina la entrega del item dentro del juego mediante un intercambio seguro.',
  },
  {
    title: '4. Precios y Pagos',
    content:
      'Todos los precios estan expresados en soles peruanos (S/) y dolares estadounidenses (USD). Los precios pueden variar segun la demanda y disponibilidad. El pago debe completarse en su totalidad antes de realizar la entrega del item. Nos reservamos el derecho de actualizar precios en cualquier momento sin previo aviso.',
  },
  {
    title: '5. Entregas',
    content:
      'Las entregas se realizan dentro del juego Blox Fruits mediante intercambio seguro. El tiempo estimado de entrega es de 5 a 20 minutos despues de la confirmacion del pago, aunque puede variar segun la disponibilidad de nuestro staff. BLOXARAY no se hace responsable por demoras causadas por mantenimiento del juego, actualizaciones o problemas tecnicos ajenos a nuestra operacion.',
  },
  {
    title: '6. Reembolsos y Cancelaciones',
    content:
      'Una vez que el item ha sido entregado en el juego, no se realizan reembolsos. Si el pago fue completado pero la entrega no se ha realizado, el usuario puede solicitar un reembolso total dentro de las 24 horas posteriores a la compra. Las solicitudes de reembolso deben realizarse a traves de nuestro canal de soporte en Discord.',
  },
  {
    title: '7. Responsabilidad del Usuario',
    content:
      'El usuario es responsable de proporcionar informacion correcta para la entrega, incluyendo su nombre de usuario dentro del juego. BLOXARAY no se hace responsable por entregas fallidas debido a informacion incorrecta proporcionada por el usuario. El usuario debe cumplir con los Terminos de Servicio de Blox Fruits / Roblox.',
  },
  {
    title: '8. Privacidad',
    content:
      'BLOXARAY recopila solo la informacion necesaria para procesar tu compra: nombre de usuario del juego, correo electronico y metodo de pago. No almacenamos contraseñas ni informacion sensible de tu cuenta de Roblox. Consulta nuestra Politica de Privacidad para mas detalles.',
  },
  {
    title: '9. Limitacion de Responsabilidad',
    content:
      'BLOXARAY no sera responsable por danos directos, indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar nuestros servicios. Nuestra responsabilidad maxima se limita al monto pagado por el producto o servicio en cuestion.',
  },
  {
    title: '10. Modificaciones',
    content:
      'Nos reservamos el derecho de modificar estos terminos en cualquier momento. Los cambios entraran en vigor inmediatamente despues de su publicacion en esta pagina. Es responsabilidad del usuario revisar periodicamente los terminos actualizados.',
  },
  {
    title: '11. Contacto',
    content:
      'Para cualquier consulta sobre estos terminos, puedes contactarnos a traves de nuestro Discord oficial o enviando un correo a soporte@bloxaray.store.',
  },
]

export default function TerminosPage() {
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
            Terminos y Condiciones
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
