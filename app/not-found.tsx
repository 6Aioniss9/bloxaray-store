import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(239,35,60,0.04) 0%, transparent 40%)' }} />
      <span className="text-[140px] font-black leading-none text-white/5 sm:text-[200px]">404</span>
      <h1 className="-mt-8 text-2xl font-black text-white sm:text-4xl">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">La página que buscás no existe o fue movida. Revisá la URL o volvé al inicio.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-500">Ir al inicio</Link>
        <Link href="/stock" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-bold text-zinc-300 transition-colors hover:bg-white/5">Ver stock</Link>
      </div>
    </main>
  )
}
