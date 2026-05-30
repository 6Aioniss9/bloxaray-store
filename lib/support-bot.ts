export type BotResult = {
  response: string
  requiresHuman: boolean
}

type Intent = {
  intent: string
  keywords: string[]
  response: string
  requiresHuman?: boolean
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const intents: Intent[] = [
  {
    intent: 'greeting',
    keywords: ['hola', 'buenas', 'hello', 'hi', 'buen dia', 'buen día', 'buenas tardes', 'buenos dias', 'buenos días', 'que tal', 'qué tal', 'saludos'],
    response: '¡Hola! Bienvenido a BLOXARAY. Puedo ayudarte con stock, compras, pagos y entregas.',
  },
  {
    intent: 'buy',
    keywords: ['comprar', 'quiero comprar', 'como compro', 'cómo compro', 'como comprar', 'cómo comprar', 'quiero una fruta', 'quiero adquirir', 'comprar fruta', 'hacer pedido', 'quiero pedir'],
    response: 'Para comprar, elige una fruta del stock y presiona Comprar. Luego te atenderemos por Discord para coordinar el pago y la entrega.',
  },
  {
    intent: 'stock',
    keywords: ['stock', 'disponible', 'disponibles', 'hay stock', 'tienen stock', 'frutas disponibles', 'que tienen', 'qué tienen', 'que frutas', 'qué frutas', 'tienen frutas', 'hay frutas', 'tienen', 'hay', 'que venden', 'qué venden'],
    response: 'El stock actualizado está disponible en la sección Stock. Lo que ves publicado es lo que está disponible para entrega.',
  },
  {
    intent: 'specific_fruit',
    keywords: ['kitsune', 'tiger', 'yeti', 'lobo', 'portal', 'venom', 'dragon', 'leopard', 'dough', 'control', 'spirit', 'blizzard', 'shadow', 'gravity', 'mammoth', 'trex', 't-rex', 'buddha', 'phoenix', 'flame', 'dark', 'ice', 'sand', 'light', 'magma', 'smoke', 'spike', 'rocket', 'spring', 'rubber', 'pain', 'love', 'ghost', 'sound', 'barrier', 'falcon', 'diamond', 'quake', 'string', 'gas', 'human', 'fruit'],
    response: 'Puedes revisar el stock actualizado en la sección Stock. Si la fruta que buscas aparece publicada, está disponible.',
  },
  {
    intent: 'price',
    keywords: ['precio', 'cuanto cuesta', 'cuánto cuesta', 'cuanto vale', 'cuánto vale', 'valor', 'costo', 'cost', 'price', 'precios', 'cuanto', 'cuánto'],
    response: 'Cada fruta muestra su precio en soles y dólares dentro de su card. Revisa el catálogo para ver el precio actualizado.',
  },
  {
    intent: 'price_pen',
    keywords: ['soles', 'pen', 'sol', 'soles peruanos', 'precio en soles', 'cuanto en soles', 'cuánto en soles', 'pago en soles'],
    response: 'Los precios en soles (PEN) están publicados en cada fruta. Si necesitas un precio exacto, revisa la card de la fruta.',
  },
  {
    intent: 'price_usd',
    keywords: ['dolares', 'dólares', 'usd', 'dollar', 'precio en dolares', 'precio en dólares', 'cuanto en dolares', 'cuánto en dólares', 'pago en dolares', 'pago en dólares'],
    response: 'Los precios en dólares (USD) están publicados en cada fruta. Revisa la card para ver el precio actualizado.',
  },
  {
    intent: 'payment',
    keywords: ['pago', 'pagar', 'pagos', 'metodo de pago', 'método de pago', 'metodos de pago', 'métodos de pago', 'como pago', 'cómo pago', 'donde pago', 'dónde pago', 'forma de pago', 'pagar fruta'],
    response: 'Aceptamos métodos de pago disponibles como Yape, Plin, Binance y otros. Antes de entregar la fruta, el soporte confirma el pago contigo por Discord.',
  },
  {
    intent: 'yape',
    keywords: ['yape', 'pago yape', 'yapear'],
    response: 'Sí, aceptamos Yape como método de pago. Al coordinar por Discord te indicarán los datos para pagar.',
  },
  {
    intent: 'plin',
    keywords: ['plin', 'pago plin'],
    response: 'Sí, aceptamos Plin como método de pago. Al coordinar por Discord te indicarán los datos para pagar.',
  },
  {
    intent: 'binance',
    keywords: ['binance', 'pago binance', 'binance pay', 'usdt', 'crypto', 'cripto', 'criptomoneda'],
    response: 'Sí, aceptamos Binance como método de pago. Al coordinar por Discord te indicarán los datos para pagar.',
  },
  {
    intent: 'paypal',
    keywords: ['paypal', 'pago paypal'],
    response: 'Sí, aceptamos PayPal como método de pago. Al coordinar por Discord te indicarán los datos para pagar.',
  },
  {
    intent: 'delivery',
    keywords: ['entrega', 'tiempo', 'demora', 'cuanto demora', 'cuánto demora', 'cuanto tarda', 'cuánto tarda', 'cuando llega', 'cuándo llega', 'tiempo de entrega', 'demora entrega', 'tiempo estimado', 'cuanto tiempo', 'cuánto tiempo', 'llegar', 'llega'],
    response: 'La entrega se coordina por Discord después de confirmar el pago. Normalmente toma entre 5 y 20 minutos.',
  },
  {
    intent: 'delivery_time',
    keywords: ['entrega rapida', 'entrega rápida', 'entrega inmediata', 'entrega rapido', 'entrega rápido', 'rapido', 'rápido', 'al instante'],
    response: 'Trabajamos con entrega rápida coordinada por Discord. Una vez confirmado el pago, la entrega suele ser en minutos.',
  },
  {
    intent: 'safety',
    keywords: ['seguro', 'seguridad', 'estafa', 'confiable', 'garantia', 'garantía', 'confianza', 'fiable', 'robarme', 'robo', 'timo', 'engaño', 'engañar', 'legitimo', 'legítimo', 'verdadero', 'real', 'falso'],
    response: 'BLOXARAY trabaja con atención directa por Discord, stock visible y confirmación antes de la entrega. Si tienes dudas, puedes hablar con soporte humano.',
  },
  {
    intent: 'refund',
    keywords: ['reembolso', 'devolucion', 'devolución', 'reembolsar', 'reclamo', 'reclamar', 'cancelar pedido', 'cancelar compra', 'me arrepenti', 'me arrepentí', 'quiero mi plata', 'devolver dinero', 'reembolso de dinero'],
    response: 'Si tienes un problema con tu pedido, contacta soporte humano por Discord para revisar tu caso y ver si aplica reembolso.',
    requiresHuman: true,
  },
  {
    intent: 'discord',
    keywords: ['discord', 'invitacion', 'invitación', 'link discord', 'enlace discord', 'servidor discord', 'unirme discord', 'canal discord', 'discord server'],
    response: 'Puedes encontrarnos en Discord. Usa el botón "Hablar con soporte humano" dentro de este chat para contactarnos directamente.',
  },
  {
    intent: 'support',
    keywords: ['soporte', 'humano', 'agente', 'persona', 'persona real', 'atencion', 'atención', 'atencion humana', 'atención humana', 'quiero hablar', 'hablar con alguien', 'asesor', 'ayuda humana', 'contactar soporte', 'contactarme'],
    response: 'Claro, puedes contactar con soporte humano por Discord usando el botón "Hablar con soporte humano" que está abajo en el chat.',
    requiresHuman: true,
  },
  {
    intent: 'order_problem',
    keywords: ['problema', 'problemas', 'no me llego', 'no me llegó', 'no llego', 'no llegó', 'no recibi', 'no recibí', 'no recibo', 'tuve un problema', 'no funciona', 'algo salio mal', 'algo salió mal', 'error pedido', 'fallo compra', 'falló compra'],
    response: 'Lamento el inconveniente. Para resolverlo rápido, contacta soporte humano por Discord y te atenderán personalmente.',
    requiresHuman: true,
  },
  {
    intent: 'how_to_buy',
    keywords: ['como funciona', 'cómo funciona', 'como es', 'cómo es', 'proceso de compra', 'que hago', 'qué hago', 'pasos', 'paso a paso', 'procedimiento', 'proceso'],
    response: 'El proceso es sencillo: 1) Elige tu fruta en Stock. 2) Presiona Comprar. 3) Te atenderemos por Discord. 4) Coordinas pago y entrega con soporte.',
  },
  {
    intent: 'contact',
    keywords: ['contacto', 'contactar', 'contactarnos', 'como contacto', 'cómo contacto', 'como contactar', 'cómo contactar', 'donde contacto', 'dónde contacto', 'telefono', 'teléfono', 'whatsapp', 'email', 'correo', 'correo electronico', 'correo electrónico'],
    response: 'Puedes contactarnos por Discord usando el botón "Hablar con soporte humano" dentro de este chat. También estamos en TikTok como @aioniss.',
  },
  {
    intent: 'available_fruits',
    keywords: ['cuales tienen', 'cuáles tienen', 'cuantas frutas', 'cuántas frutas', 'cuantas tienen', 'cuántas tienen', 'lista frutas', 'listado', 'catalogo', 'catálogo', 'variedad', 'variedad de frutas', 'que ofrecen', 'qué ofrecen'],
    response: 'Actualmente trabajamos con varias frutas Mythical. Puedes ver el listado completo y actualizado en la sección Stock.',
  },
  {
    intent: 'delivery_method',
    keywords: ['como recibo', 'cómo recibo', 'como me entregan', 'cómo me entregan', 'como recibo mi fruta', 'cómo recibo mi fruta', 'por donde entregan', 'por dónde entregan', 'donde me entregan', 'dónde me entregan'],
    response: 'La fruta se entrega directamente por Discord después de coordinar con soporte. Recibirás instrucciones precisas al momento de la compra.',
  },
  {
    intent: 'payment_confirm',
    keywords: ['confirmar pago', 'confirmacion de pago', 'confirmación de pago', 'comprobante', 'voucher', 'foto pago', 'captura pago', 'captura de pago'],
    response: 'Al pagar, guarda tu comprobante y compártelo por Discord con el soporte para confirmar tu pedido.',
  },
  {
    intent: 'scam_prevention',
    keywords: ['me pueden estafar', 'van a estafar', 'es estafa', 'es falso', 'es fake', 'es trola', 'son confiables', 'son legales', 'son verdaderos', 'tienen rating', 'tienen reseñas', 'opiniones', 'reviews', 'resenas', 'reseñas', 'reputacion', 'reputación'],
    response: 'BLOXARAY es una tienda con atención directa por Discord y stock visible. Puedes revisar las reseñas de otros clientes en la sección Reseñas para mayor confianza.',
  },
  {
    intent: 'off_topic',
    keywords: [],
    response: 'Lo siento, solo puedo ayudarte con preguntas sobre BLOXARAY, compras, stock, pagos y entregas. Si necesitas ayuda personalizada, puedes contactar con soporte humano por Discord.',
    requiresHuman: true,
  },
]

export function getBotResponse(message: string): BotResult {
  const cleaned = stripAccents(message.toLowerCase().trim())
  if (!cleaned) return { response: intents.find((i) => i.intent === 'off_topic')!.response, requiresHuman: true }

  for (const intent of intents) {
    if (intent.intent === 'off_topic') continue
    if (intent.keywords.some((k) => cleaned.includes(k))) {
      return { response: intent.response, requiresHuman: intent.requiresHuman ?? false }
    }
  }

  return { response: intents.find((i) => i.intent === 'off_topic')!.response, requiresHuman: true }
}
