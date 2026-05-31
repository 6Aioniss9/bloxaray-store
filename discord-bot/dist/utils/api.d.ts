import { z } from 'zod';
declare const fruitSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    image: z.ZodString;
    price: z.ZodNumber;
    priceUSD: z.ZodNumber;
    stock: z.ZodNumber;
    rarity: z.ZodString;
    blurb: z.ZodString;
}, "strip", z.ZodTypeAny, {
    stock: number;
    id: string;
    name: string;
    image: string;
    price: number;
    priceUSD: number;
    rarity: string;
    blurb: string;
}, {
    stock: number;
    id: string;
    name: string;
    image: string;
    price: number;
    priceUSD: number;
    rarity: string;
    blurb: string;
}>;
declare const orderSchema: z.ZodObject<{
    id: z.ZodString;
    items: z.ZodString;
    total: z.ZodNumber;
    totalUSD: z.ZodNumber;
    status: z.ZodString;
    paymentMethod: z.ZodNullable<z.ZodString>;
    customerName: z.ZodString;
    customerEmail: z.ZodString;
    customerRoblox: z.ZodString;
    customerDiscord: z.ZodString;
    customerNotes: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: string;
    items: string;
    total: number;
    totalUSD: number;
    paymentMethod: string | null;
    customerName: string;
    customerEmail: string;
    customerRoblox: string;
    customerDiscord: string;
    customerNotes: string | null;
    createdAt: string;
}, {
    id: string;
    status: string;
    items: string;
    total: number;
    totalUSD: number;
    paymentMethod: string | null;
    customerName: string;
    customerEmail: string;
    customerRoblox: string;
    customerDiscord: string;
    customerNotes: string | null;
    createdAt: string;
}>;
export type Fruit = z.infer<typeof fruitSchema>;
export type Order = z.infer<typeof orderSchema>;
type SafeResult<T> = {
    ok: true;
    data: T;
} | {
    ok: false;
    error: string;
};
export declare function getFruits(): Promise<SafeResult<Fruit[]>>;
export declare function getOrders(): Promise<SafeResult<Order[]>>;
export declare function createOrder(input: {
    items: {
        fruitId: string;
        name: string;
        price: number;
        priceUSD: number;
        quantity: number;
    }[];
    total: number;
    totalUSD: number;
    paymentMethod: string;
    customerName: string;
    customerEmail: string;
    customerRoblox: string;
    customerDiscord: string;
    customerNotes?: string;
}): Promise<SafeResult<{
    success: boolean;
    orderId: string;
    message: string;
}>>;
export declare function updateOrderStatus(id: string, status: string): Promise<SafeResult<{
    success: boolean;
}>>;
export {};
//# sourceMappingURL=api.d.ts.map