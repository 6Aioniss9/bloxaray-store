export type PaymentMethod = 'mercadopago' | 'yape' | 'plin' | 'binance'

type ManualPaymentInfo = {
  number: string
  name: string
  instructions: string[]
}

function getEnv(key: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]!
  }
  return fallback
}

export function getManualPaymentInfo(method: PaymentMethod): ManualPaymentInfo | null {
  switch (method) {
    case 'yape':
      return {
        number: getEnv('NEXT_PUBLIC_YAPE_NUMBER', 'Configura YAPE_NUMBER en .env'),
        name: getEnv('NEXT_PUBLIC_YAPE_NAME', 'BLOXARAY'),
        instructions: [
          'Abre Yape y busca el número indicado',
          'Envía el monto exacto del pedido',
          'Captura la pantalla de confirmación',
          'Sube el comprobante abajo',
        ],
      }
    case 'plin':
      return {
        number: getEnv('NEXT_PUBLIC_PLIN_NUMBER', 'Configura PLIN_NUMBER en .env'),
        name: getEnv('NEXT_PUBLIC_PLIN_NAME', 'BLOXARAY'),
        instructions: [
          'Abre Plin y busca el número indicado',
          'Envía el monto exacto del pedido',
          'Captura la pantalla de confirmación',
          'Sube el comprobante abajo',
        ],
      }
    case 'binance':
      return {
        number: getEnv('NEXT_PUBLIC_BINANCE_ID', 'Configura BINANCE_ID en .env'),
        name: getEnv('NEXT_PUBLIC_BINANCE_NAME', 'BLOXARAY'),
        instructions: [
          'Abre Binance y ve a P2P / Enviar',
          'Busca el ID indicado',
          'Envía el monto exacto del pedido en USDT',
          'Captura la pantalla de confirmación',
          'Sube el comprobante abajo',
        ],
      }
    default:
      return null
  }
}
