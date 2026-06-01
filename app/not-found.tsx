import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(239,35,60,0.04) 0%, transparent 40%)' }} />
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ backgroundImage: 'radial-gradient(rgba(239,35,60,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="relative">
        <div className="absolute left-1/2 top-1/2 -z-10 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(239,35,60,0.1) 0%, transparent 70%)' }} />
        <span className="select-none text-[160px] font-black leading-none text-white/[0.03] sm:text-[220px]" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>404</span>
      </div>
      <h1 className="-mt-12 text-2xl font-black text-white sm:text-4xl" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
        Fruta no encontrada
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">
        Esta fruta no está en nuestro catálogo. Probá con otra búsqueda o volvé al stock.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-500 active:scale-[0.97]">
          Ir al inicio
        </Link>
        <Link href="/stock" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 active:scale-[0.97]">
          Ver stock completo
        </Link>
        <Link href="/tracking" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5 active:scale-[0.97]">
          Rastrear pedido
        </Link>
      </div>
    </main>
  )
}
