'use client'

export type Currency = 'PEN' | 'USD'

const STORAGE_KEY = 'bloxaray-currency'

let listeners: Array<() => void> = []
let cached: Currency | null = null

function read(): Currency {
  if (cached) return cached
  if (typeof window === 'undefined') return 'PEN'
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'USD' || raw === 'PEN') {
      cached = raw
      return raw
    }
  } catch {}
  return 'PEN'
}

export function getCurrency(): Currency {
  return read()
}

export function setCurrency(c: Currency) {
  cached = c
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(STORAGE_KEY, c) } catch {}
  }
  listeners.forEach((fn) => fn())
}

export function subscribe(fn: () => void) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}
