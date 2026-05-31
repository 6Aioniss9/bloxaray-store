import 'dotenv/config';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde con pong'),
];
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
client.once('ready', async () => {
    console.log('Bot conectado como', client.user?.tag);
    await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.GUILD_ID), { body: commands.map((c) => c.toJSON()) });
    console.log('Comando /ping registrado');
});
client.on('interactionCreate', async (interaction) => {
    console.log('Interacción recibida:', interaction.type, interaction.commandName);
    if (interaction.isChatInputCommand() && interaction.commandName === 'ping') {
        await interaction.reply({ content: 'Pong! 🏓', ephemeral: true });
        console.log('Respondió ping');
    }
});
client.login(process.env.DISCORD_BOT_TOKEN);
//# sourceMappingURL=keep-alive.js.map