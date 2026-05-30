import type { Metadata, Viewport } from 'next'
import { Montserrat, Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { SupportChat } from '@/components/site/support-chat'
import { SessionProvider } from '@/components/providers/session-provider'
import { PageTransition } from '@/components/animations/page-transition'
import { AmbientBackground } from '@/components/effects/ambient-background'
import { ParticlesField } from '@/components/effects/particles-field'
import { LoadingScreen } from '@/components/effects/loading-screen'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BLOXARAY — Las Mejores Frutas Fisicas de Blox Fruits',
  description:
    'Tu marketplace confiable para frutas fisicas de Blox Fruits. Stock actualizado diariamente, entrega rapida y atencion personalizada.',
  generator: 'v0.dev',
  keywords: [
    'Blox Fruits',
    'frutas fisicas',
    'Kitsune',
    'Dragon',
    'Leopard',
    'comprar frutas blox fruits',
    'BLOXARAY',
  ],
}

export const viewport: Viewport = {
  themeColor: '#050510',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${montserrat.variable} ${geistMono.variable}`}>
      <body className="bg-background font-sans antialiased">
        <SessionProvider>
          <LoadingScreen />
          <AmbientBackground />
          <ParticlesField count={24} />
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <SupportChat />
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
