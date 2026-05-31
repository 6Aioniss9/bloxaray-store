import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from './config.js';
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde con pong'),
    new SlashCommandBuilder()
        .setName('stock')
        .setDescription('Muestra el stock actual de frutas'),
    new SlashCommandBuilder()
        .setName('pedido')
        .setDescription('Crea un pedido manualmente')
        .addStringOption((o) => o.setName('fruta').setDescription('Nombre de la fruta').setRequired(true))
        .addIntegerOption((o) => o.setName('cantidad').setDescription('Cantidad').setRequired(true).setMinValue(1))
        .addStringOption((o) => o.setName('cliente').setDescription('Nombre del cliente').setRequired(true)),
    new SlashCommandBuilder()
        .setName('entregar')
        .setDescription('Marca un pedido como entregado')
        .addStringOption((o) => o.setName('id').setDescription('ID del pedido').setRequired(true)),
    new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Envía el panel de tickets al canal actual'),
    new SlashCommandBuilder()
        .setName('pedidos')
        .setDescription('Lista los pedidos recientes'),
];
const rest = new REST({ version: '10' }).setToken(config.token);
async function deploy() {
    try {
        console.log('Registrando comandos...');
        await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
            body: commands.map((c) => c.toJSON()),
        });
        console.log('Comandos registrados correctamente.');
    }
    catch (err) {
        console.error('Error al registrar comandos:', err);
        process.exit(1);
    }
}
deploy();
//# sourceMappingURL=deploy-commands.js.map