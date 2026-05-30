import MercadoPagoConfig, { Preference, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
})

export const preference = new Preference(client)
export const payment = new Payment(client)
