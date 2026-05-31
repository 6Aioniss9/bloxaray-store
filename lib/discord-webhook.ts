const WEBHOOK_URL = () => process.env.DISCORD_WEBHOOK_URL

type OrderData = {
  id: string
  total: number
  totalUSD: number
  status: string
  paymentMethod: string | null
  customerName: string
  customerEmail: string
  customerRoblox: string
  customerDiscord: string
  customerNotes?: string | null
  items: string
  paymentId?: string | null
}

const statusEmoji: Record<string, string> = {
  pending_payment: ':clock1:',
  paid: ':white_check_mark:',
  pending_manual_review: ':eyes:',
  delivered: ':package:',
  cancelled: ':x:',
  refunded: ':arrows_counterclockwise:',
}

const paymentEmoji: Record<string, string> = {
  mercadopago: ':credit_card:',
  yape: ':mobile_phone:',
  plin: ':mobile_phone:',
  binance: ':coin:',
}

function formatItems(itemsJson: string): string {
  try {
    const items = JSON.parse(itemsJson) as { name: string; quantity: number; price: number }[]
    if (items.length === 0) return '*(vacío)*'
    return items
      .map((i) => `  • ${i.name} x${i.quantity} — S/ ${i.price.toFixed(2)} c/u`)
      .join('\n')
  } catch {
    return '*(error al parsear items)*'
  }
}

export async function sendOrderNotification(order: OrderData, event: 'created' | 'paid' | 'updated') {
  const url = WEBHOOK_URL()
  if (!url) return

  const eventTitles: Record<string, string> = {
    created: 'Nuevo Pedido',
    paid: 'Pago Confirmado',
    updated: 'Pedido Actualizado',
  }

  const eventColors: Record<string, number> = {
    created: 0x5865f2,
    paid: 0x57f287,
    updated: 0xfee75c,
  }

  const embed = {
    title: `${statusEmoji[order.status] || ''} ${eventTitles[event]}`,
    color: eventColors[event] || 0x5865f2,
    fields: [
      {
        name: ':id: ID',
        value: `\`${order.id}\``,
        inline: true,
      },
      {
        name: ':moneybag: Total',
        value: `S/ ${order.total.toFixed(2)} ($${order.totalUSD.toFixed(2)})`,
        inline: true,
      },
      {
        name: `${paymentEmoji[order.paymentMethod ?? ''] || ':money_with_wings:'} Método`,
        value: order.paymentMethod ?? 'N/A',
        inline: true,
      },
      {
        name: ':bust_in_silhouette: Cliente',
        value: order.customerName,
        inline: true,
      },
      {
        name: ':envelope: Email',
        value: order.customerEmail,
        inline: true,
      },
      {
        name: ':video_game: Roblox',
        value: order.customerRoblox,
        inline: true,
      },
      {
        name: ':speech_balloon: Discord',
        value: order.customerDiscord,
        inline: true,
      },
      ...(order.customerNotes
        ? [{ name: ':pencil: Notas', value: order.customerNotes, inline: false }]
        : []),
      {
        name: ':shopping_cart: Items',
        value: formatItems(order.items),
        inline: false,
      },
      ...(order.paymentId
        ? [{ name: ':credit_card: Payment ID', value: `\`${order.paymentId}\``, inline: false }]
        : []),
    ],
    timestamp: new Date().toISOString(),
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'BLOXARAY Store',
        avatar_url: 'https://bloxaray.com/favicon.ico',
        embeds: [embed],
      }),
    })
    if (!res.ok) {
      console.error('[Discord Webhook] Error:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('[Discord Webhook] Failed to send:', err)
  }
}

export async function sendErrorNotification(context: string, error: unknown) {
  const url = WEBHOOK_URL()
  if (!url) return

  const embed = {
    title: ':warning: Error en BLOXARAY',
    color: 0xed4245,
    fields: [
      { name: 'Contexto', value: context, inline: false },
      { name: 'Error', value: `\`\`\`${String(error)}\`\`\``, inline: false },
    ],
    timestamp: new Date().toISOString(),
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'BLOXARAY Errors', embeds: [embed] }),
    })
  } catch {
    // silent
  }
}
