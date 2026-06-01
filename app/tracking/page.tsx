import type { Metadata } from 'next'
import { TrackingClient } from './tracking-client'

export const metadata: Metadata = {
  title: 'Rastrear Pedido — BLOXARAY',
  description: 'Consultá el estado de tu pedido en BLOXARAY con tu código de seguimiento.',
  robots: { index: false, follow: false },
}

export default function TrackingPage() {
  return <TrackingClient />
}
