'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(239,35,60,0.04) 0%, transparent 40%)' }} />
      <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
        <span className="text-3xl font-black text-red-400">!</span>
      </div>
      <h1 className="mt-6 text-2xl font-black text-white sm:text-4xl">Algo salió mal</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400 sm:text-base">Ocurrió un error inesperado. Ya lo registramos, pero podés intentar de nuevo.</p>
      <button onClick={reset} className="mt-8 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-500">Intentar de nuevo</button>
    </main>
  )
}
