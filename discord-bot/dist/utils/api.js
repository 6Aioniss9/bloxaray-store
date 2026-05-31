import { config } from '../config.js';
import { z } from 'zod';
const fruitSchema = z.object({
    id: z.string(),
    name: z.string(),
    image: z.string(),
    price: z.number(),
    priceUSD: z.number(),
    stock: z.number(),
    rarity: z.string(),
    blurb: z.string(),
});
const orderSchema = z.object({
    id: z.string(),
    items: z.string(),
    total: z.number(),
    totalUSD: z.number(),
    status: z.string(),
    paymentMethod: z.string().nullable(),
    customerName: z.string(),
    customerEmail: z.string(),
    customerRoblox: z.string(),
    customerDiscord: z.string(),
    customerNotes: z.string().nullable(),
    createdAt: z.string(),
});
async function fetchApi(path, options) {
    const url = `${config.apiBaseUrl}${path}`;
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error');
        throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json();
}
async function safeFetch(fn) {
    try {
        const data = await fn();
        return { ok: true, data };
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, error: message };
    }
}
export async function getFruits() {
    return safeFetch(async () => {
        const data = await fetchApi('/api/fruits');
        return data.data;
    });
}
export async function getOrders() {
    return safeFetch(() => fetchApi('/api/orders'));
}
export async function createOrder(input) {
    return safeFetch(() => fetchApi('/api/orders', {
        method: 'POST',
        body: JSON.stringify(input),
    }));
}
export async function updateOrderStatus(id, status) {
    return safeFetch(() => fetchApi('/api/orders', {
        method: 'PATCH',
        body: JSON.stringify({ id, status }),
    }));
}
//# sourceMappingURL=api.js.map