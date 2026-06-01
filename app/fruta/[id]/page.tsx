import { notFound } from 'next/navigation'
import { fruits } from '@/lib/fruits'
import { FruitDetailClient } from './client-page'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return fruits.map((f) => ({ id: f.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const fruit = fruits.find((f) => f.id === id)
  if (!fruit) {
    return { title: 'Fruta no encontrada — BLOXARAY' }
  }

  return {
    title: `${fruit.name} — ${fruit.rarity} | BLOXARAY`,
    description: fruit.blurb,
    openGraph: {
      title: `${fruit.name} — ${fruit.rarity} | BLOXARAY`,
      description: fruit.blurb,
      images: [{ url: `https://bloxaray.com${fruit.image}` }],
    },
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fruit = fruits.find((f) => f.id === id)
  if (!fruit) notFound()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: fruit.name,
            description: fruit.blurb,
            image: `https://bloxaray.com${fruit.image}`,
            offers: {
              '@type': 'Offer',
              price: fruit.price,
              priceCurrency: 'PEN',
              availability: fruit.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: `https://bloxaray.com/fruta/${fruit.id}`,
            },
          }),
        }}
      />
      <FruitDetailClient fruit={fruit} />
    </>
  )
}
