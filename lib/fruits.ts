export type Rarity = 'Common' | 'Rare' | 'Legendary' | 'Mythical'

export type Fruit = {
  id: string
  name: string
  image: string
  price: number
  priceUSD: number
  stock: number
  rarity: Rarity
  blurb: string
  featured?: boolean
}

export const fruits: Fruit[] = [
  {
    id: 'kitsune',
    name: 'Kitsune',
    image: '/fruits/premium/Kitsune.png',
    price: 10,
    priceUSD: 2.94,
    stock: 24,
    rarity: 'Mythical',
    blurb: 'Zorro de nueve colas.',
    featured: true,
  },
  {
    id: 'tiger',
    name: 'Tiger',
    image: '/fruits/premium/Tiger.png',
    price: 4.50,
    priceUSD: 1.32,
    stock: 15,
    rarity: 'Mythical',
    blurb: 'Felino de combate.',
    featured: true,
  },
  {
    id: 'yeti',
    name: 'Yeti',
    image: '/fruits/premium/Yeti.png',
    price: 4.50,
    priceUSD: 1.32,
    stock: 6,
    rarity: 'Mythical',
    blurb: 'Bestia de hielo.',
    featured: true,
  },
  {
    id: 'lobo',
    name: 'Lobo',
    image: '/fruits/premium/Lobo.png',
    price: 21,
    priceUSD: 6.18,
    stock: 7,
    rarity: 'Mythical',
    blurb: 'Lobo salvaje de batalla.',
    featured: true,
  },
  {
    id: 'fiend-yeti',
    name: 'Fiend Yeti',
    image: '/fruits/premium/Fiend_Yeti.png',
    price: 20,
    priceUSD: 5.88,
    stock: 3,
    rarity: 'Mythical',
    blurb: 'Yeti oscuro y poderoso.',
  },
  {
    id: 'rumble-verde',
    name: 'Rumble Verde',
    image: '/fruits/premium/Rumble_Verde.png',
    price: 11.50,
    priceUSD: 3.38,
    stock: 10,
    rarity: 'Mythical',
    blurb: 'Tormenta de energia verde.',
  },
  {
    id: 'rumble-amarilla',
    name: 'Rumble Amarilla',
    image: '/fruits/premium/Rumble_Amarilla.png',
    price: 33,
    priceUSD: 9.71,
    stock: 2,
    rarity: 'Mythical',
    blurb: 'Rayo amarillo devastador.',
  },
  {
    id: 'super-spirit-pain',
    name: 'Super Spirit Pain',
    image: '/fruits/premium/Super_Spirit_Pain.png',
    price: 33,
    priceUSD: 9.71,
    stock: 1,
    rarity: 'Mythical',
    blurb: 'Espiritu supremo del dolor.',
  },
  {
    id: 'divine-portal',
    name: 'Divine Portal',
    image: '/fruits/premium/Divine_Portal.png',
    price: 26,
    priceUSD: 7.65,
    stock: 1,
    rarity: 'Mythical',
    blurb: 'Portal divino dimensional.',
  },
]

const rarityColors: Record<Rarity, { label: string; chip: string; glow: string; border: string }> = {
  Common: {
    label: 'Common',
    chip: 'border-zinc-600 bg-zinc-800/60 text-zinc-400',
    glow: 'rgba(113,113,122,0.3)',
    border: 'border-zinc-600/40',
  },
  Rare: {
    label: 'Rare',
    chip: 'border-purple-500/40 bg-purple-500/15 text-purple-400',
    glow: 'rgba(168,85,247,0.35)',
    border: 'border-purple-500/30',
  },
  Legendary: {
    label: 'Legendary',
    chip: 'border-orange-500/40 bg-orange-500/15 text-orange-400',
    glow: 'rgba(249,115,22,0.4)',
    border: 'border-orange-500/30',
  },
  Mythical: {
    label: 'Mythical',
    chip: 'border-red-500/40 bg-red-500/15 text-red-400',
    glow: 'rgba(239,35,60,0.5)',
    border: 'border-red-500/30',
  },
}

export function getRarityStyle(rarity: Rarity) {
  return rarityColors[rarity]
}

export const DISCORD_URL = 'https://discord.gg/aioniss'
export const TIKTOK_URL = 'https://tiktok.com/@aioniss'
