export type PaymentMethod = 'mercadopago' | 'yape' | 'plin' | 'binance'

type ManualPaymentInfo = {
  number: string
  name: string
  instructions: string[]
  qrData: string | null
}

export function getManualPaymentInfo(method: PaymentMethod): ManualPaymentInfo | null {
  switch (method) {
    case 'yape':
      return {
        number: process.env.NEXT_PUBLIC_YAPE_NUMBER || '951 118 020',
        name: process.env.NEXT_PUBLIC_YAPE_NAME || 'BLOXARAY',
        qrData: (process.env.NEXT_PUBLIC_YAPE_NUMBER || '951118020').replace(/\s/g, ''),
        instructions: [
          'Abre Yape y busca el número indicado',
          'Envía el monto exacto del pedido',
          'Captura la pantalla de confirmación',
          'Sube el comprobante abajo',
        ],
      }
    case 'plin':
      return {
        number: process.env.NEXT_PUBLIC_PLIN_NUMBER || '951 118 020',
        name: process.env.NEXT_PUBLIC_PLIN_NAME || 'BLOXARAY',
        qrData: (process.env.NEXT_PUBLIC_PLIN_NUMBER || '951118020').replace(/\s/g, ''),
        instructions: [
          'Abre Plin y busca el número indicado',
          'Envía el monto exacto del pedido',
          'Captura la pantalla de confirmación',
          'Sube el comprobante abajo',
        ],
      }
    case 'binance':
      return {
        number: process.env.NEXT_PUBLIC_BINANCE_ID || 'ID: 123456789',
        name: process.env.NEXT_PUBLIC_BINANCE_NAME || 'BLOXARAY',
        qrData: null,
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
