import { EmbedBuilder, Colors } from 'discord.js';
export function fruitStockEmbed(fruits) {
    const total = fruits.reduce((s, f) => s + f.stock, 0);
    const mythical = fruits.filter((f) => f.rarity === 'Mythical');
    const desc = mythical
        .map((f) => `**${f.name}** — S/ ${f.price.toFixed(2)} ($${f.priceUSD.toFixed(2)}) — Stock: **${f.stock}**\n_${f.blurb}_`)
        .join('\n\n');
    return new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle('Stock BLOXARAY')
        .setDescription(desc || 'No hay frutas disponibles.')
        .setFooter({ text: `Total: ${total} frutas | ${mythical.length} tipos` })
        .setTimestamp();
}
export function orderCreatedEmbed(order) {
    return new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle('Nuevo Pedido')
        .addFields({ name: 'ID', value: `\`${order.id}\``, inline: true }, { name: 'Cliente', value: order.customerName, inline: true }, { name: 'Discord', value: order.customerDiscord, inline: true }, { name: 'Roblox', value: order.customerRoblox, inline: true }, { name: 'Método', value: order.paymentMethod ?? 'N/A', inline: true }, { name: 'Total', value: `S/ ${order.total.toFixed(2)}`, inline: true })
        .setTimestamp();
}
export function ticketEmbed() {
    return new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle('BLOXARAY — Comprar')
        .setDescription('Presiona el botón de abajo para abrir un ticket y comprar frutas.\n\n' +
        'Uno de nuestros vendedores te atenderá a la brevedad.')
        .setFooter({ text: 'BLOXARAY Store' });
}
export function ticketWelcomeEmbed(userTag) {
    return new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle('Ticket Abierto')
        .setDescription(`Bienvenido ${userTag}!\n\n` +
        'Por favor indica qué fruta(s) deseas comprar y el método de pago.\n\n' +
        'Un miembro del staff te atenderá pronto.')
        .addFields({ name: 'Fruta', value: 'Ej: Kitsune x1', inline: true }, { name: 'Método de pago', value: 'Yape / Plin / Binance / PayPal', inline: true })
        .setTimestamp();
}
//# sourceMappingURL=embeds.js.map