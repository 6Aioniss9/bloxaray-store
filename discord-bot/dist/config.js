import 'dotenv/config';
export const config = {
    token: process.env.DISCORD_BOT_TOKEN ?? '',
    clientId: process.env.DISCORD_CLIENT_ID ?? '',
    guildId: process.env.GUILD_ID ?? '',
    staffRoleId: process.env.STAFF_ROLE_ID ?? '',
    ticketCategoryId: process.env.TICKET_CATEGORY_ID ?? '',
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3000',
};
//# sourceMappingURL=config.js.map