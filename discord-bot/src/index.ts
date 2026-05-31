import { Client, GatewayIntentBits } from 'discord.js'
import { config } from './config.js'
import { handleInteraction } from './events/interaction-create.js'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.once('ready', () => {
  console.log(`Bot conectado como ${client.user?.tag}`)
})

client.on('interactionCreate', handleInteraction)

client.login(config.token).catch((err) => {
  console.error('Error al conectar:', err)
  process.exit(1)
})
