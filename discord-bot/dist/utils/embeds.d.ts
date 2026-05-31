import { EmbedBuilder } from 'discord.js';
import type { Fruit, Order } from './api.js';
export declare function fruitStockEmbed(fruits: Fruit[]): EmbedBuilder;
export declare function orderCreatedEmbed(order: Order): EmbedBuilder;
export declare function ticketEmbed(): EmbedBuilder;
export declare function ticketWelcomeEmbed(userTag: string): EmbedBuilder;
//# sourceMappingURL=embeds.d.ts.map