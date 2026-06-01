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

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BLOXARAY',
  url: 'https://bloxaray.com/',
  description:
    'Tu marketplace confiable para frutas físicas de Blox Fruits. Stock actualizado diariamente, entrega rápida y atención personalizada.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://bloxaray.com/stock?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BLOXARAY',
  url: 'https://bloxaray.com/',
  logo: 'https://bloxaray.com/logo.png',
  sameAs: [
    'https://discord.gg/aioniss',
    'https://tiktok.com/@aioniss',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${montserrat.variable} ${geistMono.variable}`}>
      <body className="bg-background font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
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
