import 'dotenv/config'
import { REST, Routes } from 'discord.js'

async function check() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!)
  try {
    const cmds = await rest.get(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID!,
        process.env.GUILD_ID!,
      ),
    )
    console.log('Comandos registrados:', JSON.stringify(cmds, null, 2))
  } catch (e) {
    console.error('Error:', e)
  }
}

check()
