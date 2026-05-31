import { EmbedBuilder, Colors } from 'discord.js'
import type { Fruit, Review, Order } from './api.js'

export function fruitStockEmbed(fruits: Fruit[]): EmbedBuilder {
  const total = fruits.reduce((s, f) => s + f.stock, 0)
  const mythical = fruits.filter((f) => f.rarity === 'Mythical')

  const desc = mythical
    .map(
      (f) =>
        `**${f.name}** — S/ ${f.price.toFixed(2)} ($${f.priceUSD.toFixed(2)}) — Stock: **${f.stock}**\n_${f.blurb}_`,
    )
    .join('\n\n')

  return new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle('Stock BLOXARAY')
    .setDescription(desc || 'No hay frutas disponibles.')
    .setFooter({ text: `Total: ${total} frutas | ${mythical.length} tipos` })
    .setTimestamp()
}

export function fruitDetailEmbed(fruit: Fruit): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle(fruit.name)
    .setDescription(fruit.blurb)
    .addFields(
      { name: 'Rareza', value: fruit.rarity, inline: true },
      { name: 'Precio', value: `S/ ${fruit.price.toFixed(2)}`, inline: true },
      { name: 'Precio USD', value: `$${fruit.priceUSD.toFixed(2)}`, inline: true },
      { name: 'Stock', value: String(fruit.stock), inline: true },
    )
    .setTimestamp()
}

export function reviewsEmbed(reviews: Review[]): EmbedBuilder {
  const desc = reviews
    .map((r) => {
      const stars = '⭐'.repeat(r.rating) + '☆'.repeat(5 - r.rating)
      return `**${r.name}** ${r.handle}\n${stars}\n"${r.text}"`
    })
    .join('\n\n')

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return new EmbedBuilder()
    .setColor(Colors.Gold)
    .setTitle('Reseñas de Clientes')
    .setDescription(desc || 'No hay reseñas aún.')
    .setFooter({ text: `Promedio: ${avg.toFixed(1)} ⭐ | ${reviews.length} reseñas` })
    .setTimestamp()
}

export function orderCreatedEmbed(order: Order): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.Blue)
    .setTitle('Nuevo Pedido')
    .addFields(
      { name: 'ID', value: `\`${order.id}\``, inline: true },
      { name: 'Cliente', value: order.customerName, inline: true },
      { name: 'Discord', value: order.customerDiscord, inline: true },
      { name: 'Roblox', value: order.customerRoblox, inline: true },
      { name: 'Método', value: order.paymentMethod ?? 'N/A', inline: true },
      { name: 'Total', value: `S/ ${order.total.toFixed(2)}`, inline: true },
    )
    .setTimestamp()
}

export function ticketEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.Red)
    .setTitle('BLOXARAY — Comprar')
    .setDescription(
      'Presiona el botón de abajo para abrir un ticket y comprar frutas.\n\n' +
        'Uno de nuestros vendedores te atenderá a la brevedad.',
    )
    .setFooter({ text: 'BLOXARAY Store' })
}

export function ticketWelcomeEmbed(userTag: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle('Ticket Abierto')
    .setDescription(
      `Bienvenido ${userTag}!\n\n` +
        'Por favor indica qué fruta(s) deseas comprar y el método de pago.\n\n' +
        'Un miembro del staff te atenderá pronto.',
    )
    .addFields(
      { name: 'Fruta', value: 'Ej: Kitsune x1', inline: true },
      { name: 'Método de pago', value: 'Yape / Plin / Binance / PayPal', inline: true },
    )
    .setTimestamp()
}
