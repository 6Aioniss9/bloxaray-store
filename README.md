# BLOXARAY Store

Tienda online de frutas de Blox Fruits. Catálogo con stock en vivo, carrito de compras, pagos con Mercado Pago / Yape / Plin / Binance, panel admin y sistema de soporte integrado.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript (strict)
- **Estilos:** Tailwind CSS v4 + shadcn/ui
- **Base de datos:** SQLite via Prisma + Better-SQLite3
- **Autenticación:** NextAuth v5 (Discord OAuth)
- **Pagos:** Mercado Pago SDK + webhooks
- **Animaciones:** Framer Motion
- **Carrito:** localStorage
- **Soporte:** Discord OAuth + chat en vivo

## Requisitos

- Node.js 20+
- npm o pnpm

## Instalación

```bash
git clone <repo>
cd bloxaray-store
npm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

```
# Base de datos (SQLite)
DATABASE_URL="file:./dev.db"

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_WEBHOOK_SECRET=

# Discord (OAuth + Webhook + Bot)
AUTH_DISCORD_ID=
AUTH_DISCORD_SECRET=
AUTH_SECRET=
DISCORD_WEBHOOK_URL=

# Pago manual
NEXT_PUBLIC_YAPE_NUMBER=
NEXT_PUBLIC_YAPE_NAME=
NEXT_PUBLIC_PLIN_NUMBER=
NEXT_PUBLIC_PLIN_NAME=
NEXT_PUBLIC_BINANCE_ID=
NEXT_PUBLIC_BINANCE_NAME=
```

## Base de datos

```bash
npx prisma generate
npx prisma db push
npm run seed
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
npm run typecheck
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run seed` | Poblar base de datos |

## Estructura

```
app/              Rutas y páginas
components/       Componentes React
  site/           Componentes del sitio (navbar, footer, etc.)
  ui/             Componentes shadcn/ui
lib/              Utilidades, datos, config
prisma/           Schema + migraciones + seed
public/           Imágenes, iconos
discord-bot/      Bot de Discord para administración
```
