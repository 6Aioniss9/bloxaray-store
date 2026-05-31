import MercadoPagoConfig, { Preference, Payment } from 'mercadopago'

let _client: MercadoPagoConfig | null = null
let _preference: Preference | null = null
let _payment: Payment | null = null

export function getMpClient(): MercadoPagoConfig {
  if (!_client) {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!token) throw new Error('MERCADO_PAGO_ACCESS_TOKEN no configurado')
    _client = new MercadoPagoConfig({ accessToken: token })
  }
  return _client
}

export function getPreference(): Preference {
  if (!_preference) _preference = new Preference(getMpClient())
  return _preference
}

export function getPayment(): Payment {
  if (!_payment) _payment = new Payment(getMpClient())
  return _payment
}
