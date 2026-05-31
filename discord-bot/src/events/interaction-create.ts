import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Colors,
  EmbedBuilder,
  Interaction,
  MessageFlags,
  ModalBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from 'discord.js'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from '../config.js'
import { getFruits, getReviews, getOrders, createOrder, updateOrderStatus } from '../utils/api.js'
import { fruitStockEmbed, fruitDetailEmbed, reviewsEmbed, ticketEmbed, ticketWelcomeEmbed } from '../utils/embeds.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logFile = path.resolve(__dirname, '../../bot.log')

function log(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}`
  console.log(line)
  fs.appendFileSync(logFile, line + '\n')
}

const ticketCooldowns = new Map<string, number>()

function isStaff(member: Interaction['member']): boolean {
  if (!member || !('roles' in member)) return false
  return (member.roles as { cache: Map<string, unknown> }).cache.has(config.staffRoleId)
}

function safeReply(interaction: Interaction, content: string, ephemeral = true) {
  if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
    return interaction.reply({ content, ephemeral }).catch(() => {})
  }
}

function safeEditReply(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  content: string,
) {
  return interaction.editReply({ content }).catch(() => {})
}

export async function handleInteraction(interaction: Interaction) {
  const name = interaction.isChatInputCommand()
    ? interaction.commandName
    : interaction.isButton()
      ? `button:${interaction.customId}`
      : interaction.isStringSelectMenu()
        ? `select:${interaction.customId}`
        : interaction.isModalSubmit()
          ? `modal:${interaction.customId}`
          : 'unknown'

  log(`Interaction: ${name} from ${interaction.user.tag} (${interaction.user.id})`)

  try {
    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction)
    } else if (interaction.isButton()) {
      await handleButton(interaction)
    } else if (interaction.isModalSubmit()) {
      await handleModal(interaction)
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction)
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log(`ERROR in ${name}: ${msg}`)

    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Ocurrió un error inesperado. Intenta de nuevo.',
        flags: MessageFlags.Ephemeral,
      }).catch(() => {})
    }
  }
}

async function handleCommand(interaction: ChatInputCommandInteraction) {
  switch (interaction.commandName) {
    case 'ping':
      return cmdPing(interaction)
    case 'stock':
      return cmdStock(interaction)
    case 'fruta':
      return cmdFruta(interaction)
    case 'reseñas':
      return cmdResenas(interaction)
    case 'pedido':
      return cmdPedido(interaction)
    case 'entregar':
      return cmdEntregar(interaction)
    case 'ticket':
      return cmdTicket(interaction)
    case 'pedidos':
      return cmdPedidos(interaction)
    default:
      await interaction.reply({ content: 'Comando desconocido.', flags: MessageFlags.Ephemeral })
  }
}

async function cmdPing(interaction: ChatInputCommandInteraction) {
  await interaction.reply({ content: 'Pong! 🏓', flags: MessageFlags.Ephemeral })
  log('Ping responded successfully')
}

async function cmdStock(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply()

  const result = await getFruits()
  if (!result.ok) {
    log(`Stock error: ${result.error}`)
    await interaction.editReply({
      content: `No pude obtener el stock. El servidor web parece estar apagado.\n\`\`\`${result.error}\`\`\``,
    })
    return
  }

  const embed = fruitStockEmbed(result.data)
  await interaction.editReply({ embeds: [embed] })
  log(`Stock responded with ${result.data.length} fruits`)
}

async function cmdFruta(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString('nombre', true)
  const result = await getFruits()
  if (!result.ok) {
    await interaction.reply({ content: 'No pude obtener las frutas.', flags: MessageFlags.Ephemeral })
    return
  }
  const fruit = result.data.find((f: any) => f.name.toLowerCase() === name.toLowerCase())
  if (!fruit) {
    await interaction.reply({ content: `Fruta "${name}" no encontrada.`, flags: MessageFlags.Ephemeral })
    return
  }
  const embed = fruitDetailEmbed(fruit)
  await interaction.reply({ embeds: [embed] })
  log(`Fruta requested: ${fruit.name}`)
}

async function cmdResenas(interaction: ChatInputCommandInteraction) {
  const result = await getReviews()
  if (!result.ok) {
    await interaction.reply({ content: 'No pude obtener las reseñas.', flags: MessageFlags.Ephemeral })
    return
  }
  const embed = reviewsEmbed(result.data)
  await interaction.reply({ embeds: [embed] })
  log(`Resenas responded with ${result.data.length} reviews`)
}

async function cmdPedido(interaction: ChatInputCommandInteraction) {
  if (!isStaff(interaction.member)) {
    return safeReply(interaction, 'Solo el staff puede usar este comando.')
  }

  const fruitName = interaction.options.getString('fruta', true)
  const quantity = interaction.options.getInteger('cantidad', true)
  const clientName = interaction.options.getString('cliente', true)

  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  const fruitsResult = await getFruits()
  if (!fruitsResult.ok) {
    return safeEditReply(interaction, `Error al obtener frutas: ${fruitsResult.error}`)
  }

  const fruit = fruitsResult.data.find(
    (f) => f.name.toLowerCase() === fruitName.toLowerCase(),
  )

  if (!fruit) {
    return safeEditReply(interaction, `Fruta "${fruitName}" no encontrada. Usa /stock para ver disponibles.`)
  }

  if (fruit.stock < quantity) {
    return safeEditReply(interaction, `Stock insuficiente. "${fruit.name}" tiene solo ${fruit.stock} disponible(s).`)
  }

  const orderResult = await createOrder({
    items: [
      {
        fruitId: fruit.id,
        name: fruit.name,
        price: fruit.price,
        priceUSD: fruit.priceUSD,
        quantity,
      },
    ],
    total: fruit.price * quantity,
    totalUSD: fruit.priceUSD * quantity,
    paymentMethod: 'yape',
    customerName: clientName,
    customerEmail: 'pedido@discord.bot',
    customerRoblox: clientName,
    customerDiscord: interaction.user.tag,
  })

  if (!orderResult.ok) {
    return safeEditReply(interaction, `Error al crear pedido: ${orderResult.error}`)
  }

  log(`Order created: ${orderResult.data.orderId} by ${interaction.user.tag}`)
  await interaction.editReply({
    content: `Pedido creado: \`${orderResult.data.orderId}\` — ${fruit.name} x${quantity} para ${clientName}`,
  })
}

async function cmdEntregar(interaction: ChatInputCommandInteraction) {
  if (!isStaff(interaction.member)) {
    return safeReply(interaction, 'Solo el staff puede usar este comando.')
  }

  const id = interaction.options.getString('id', true)
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  const result = await updateOrderStatus(id, 'delivered')
  if (!result.ok) {
    return safeEditReply(interaction, `Error al marcar entregado: ${result.error}`)
  }

  log(`Order delivered: ${id} by ${interaction.user.tag}`)
  await interaction.editReply({ content: `Pedido \`${id}\` marcado como entregado.` })
}

async function cmdTicket(interaction: ChatInputCommandInteraction) {
  if (!isStaff(interaction.member)) {
    return safeReply(interaction, 'Solo el staff puede usar este comando.')
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId('ticket_fruit_select')
    .setPlaceholder('Selecciona una fruta (opcional)')
    .setMinValues(0)
    .setMaxValues(1)

  const fruitsResult = await getFruits()
  if (fruitsResult.ok) {
    for (const f of fruitsResult.data.filter((f) => f.stock > 0)) {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(`${f.name} — S/ ${f.price.toFixed(2)} (Stock: ${f.stock})`)
          .setValue(f.id),
      )
    }
  }

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('open_ticket')
      .setLabel('Abrir Ticket')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🎫'),
  )

  const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)

  if (!interaction.channel || !('send' in interaction.channel)) return
  await interaction.channel.send({
    embeds: [ticketEmbed()],
    components: [row1, row2],
  })

  await interaction.reply({ content: 'Panel de tickets enviado.', flags: MessageFlags.Ephemeral })
}

async function cmdPedidos(interaction: ChatInputCommandInteraction) {
  if (!isStaff(interaction.member)) {
    return safeReply(interaction, 'Solo el staff puede usar este comando.')
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  const ordersResult = await getOrders()
  if (!ordersResult.ok) {
    return safeEditReply(interaction, `Error al obtener pedidos: ${ordersResult.error}`)
  }

  const pending = ordersResult.data.filter((o) => o.status === 'pending_manual_review').slice(0, 10)

  if (pending.length === 0) {
    return safeEditReply(interaction, 'No hay pedidos pendientes.')
  }

  const embed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setTitle(`Pedidos Pendientes (${pending.length})`)
    .setDescription(
      pending
        .map(
          (o) =>
            `\`${o.id.slice(0, 8)}\` — **${o.customerName}** — S/ ${o.total.toFixed(2)} — ${o.paymentMethod ?? 'N/A'}`,
        )
        .join('\n'),
    )
    .setTimestamp()

  await interaction.editReply({ embeds: [embed] })
}

async function handleButton(interaction: ButtonInteraction) {
  switch (interaction.customId) {
    case 'open_ticket':
      return handleOpenTicket(interaction)
    case 'close_ticket':
      return handleCloseTicket(interaction)
  }
}

async function handleOpenTicket(interaction: ButtonInteraction) {
  const now = Date.now()
  const last = ticketCooldowns.get(interaction.user.id)
  if (last && now - last < 30000) {
    return safeReply(interaction, 'Espera 30 segundos antes de abrir otro ticket.')
  }

  const guild = interaction.guild
  if (!guild) return

  const existing = guild.channels.cache.find(
    (ch: { type: number; name: string }) =>
      ch.type === ChannelType.GuildText &&
      ch.name === `ticket-${interaction.user.username.toLowerCase()}`,
  )
  if (existing) {
    return safeReply(interaction, `Ya tienes un ticket abierto: ${existing}`)
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  const category = config.ticketCategoryId
    ? guild.channels.cache.get(config.ticketCategoryId)
    : undefined

  try {
    const channel = await guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: category?.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        },
        ...(config.staffRoleId
          ? [
            {
              id: config.staffRoleId,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            } as const,
          ]
          : []),
      ],
    })

    ticketCooldowns.set(interaction.user.id, now)
    log(`Ticket created: ${channel.name} for ${interaction.user.tag}`)

    const closeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Cerrar Ticket')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔒'),
    )

    await channel.send({
      content: `<@${interaction.user.id}> <@&${config.staffRoleId}>`,
      embeds: [ticketWelcomeEmbed(interaction.user.tag)],
      components: [closeRow],
    })

    await interaction.editReply({ content: `Ticket creado: ${channel}` })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log(`Ticket creation failed: ${msg}`)
    await interaction.editReply({ content: `Error al crear ticket: ${msg}` }).catch(() => {})
  }
}

async function handleCloseTicket(interaction: ButtonInteraction) {
  const channel = interaction.channel
  if (!channel || channel.type !== ChannelType.GuildText) return

  await interaction.reply({ content: 'Cerrando ticket en 5 segundos...' })

  setTimeout(async () => {
    await channel.delete().catch(() => {})
    log(`Ticket closed: ${channel.name}`)
  }, 5000)
}

async function handleModal(interaction: ModalSubmitInteraction) {
  // Future: modal for creating orders from ticket
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction) {
  if (interaction.customId === 'ticket_fruit_select') {
    const fruitId = interaction.values[0]
    if (!fruitId) return

    const fruitsResult = await getFruits()
    if (!fruitsResult.ok) return

    const fruit = fruitsResult.data.find((f) => f.id === fruitId)
    if (!fruit) return

    const modal = new ModalBuilder()
      .setCustomId(`buy_${fruit.id}`)
      .setTitle(`Comprar ${fruit.name}`)

    const quantityInput = new TextInputBuilder()
      .setCustomId('quantity')
      .setLabel('Cantidad')
      .setStyle(TextInputStyle.Short)
      .setValue('1')
      .setRequired(true)

    const nameInput = new TextInputBuilder()
      .setCustomId('customerName')
      .setLabel('Tu nombre')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const discordInput = new TextInputBuilder()
      .setCustomId('customerDiscord')
      .setLabel('Usuario de Discord')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('ej: usuario#1234')
      .setRequired(true)

    const robloxInput = new TextInputBuilder()
      .setCustomId('customerRoblox')
      .setLabel('Usuario de Roblox')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    const emailInput = new TextInputBuilder()
      .setCustomId('customerEmail')
      .setLabel('Email')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(quantityInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(discordInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(robloxInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput),
    )

    await interaction.showModal(modal)
  }
}
