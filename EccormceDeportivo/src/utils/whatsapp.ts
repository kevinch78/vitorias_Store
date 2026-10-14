import type { OrderPayload } from '../types';

/**
 * Número oficial de WhatsApp de la tienda (configurable por variable de entorno).
 * Si no está definido en .env, usa el número por defecto de Victoria.
 */
export const DEFAULT_STORE_WHATSAPP = '573001234567';

/**
 * Normaliza cualquier número de teléfono (remueve caracteres no numéricos
 * y asegura el código de país de Colombia +57 si es un celular de 10 dígitos).
 */
export function normalizePhoneNumber(rawPhone: string | undefined | null): string {
  if (!rawPhone) return DEFAULT_STORE_WHATSAPP;
  
  // Eliminar todo lo que no sea dígito
  let digits = rawPhone.replace(/\D/g, '');

  // Si tiene 10 dígitos y empieza por 3 (estándar móvil Colombia, ej: 3123456789)
  if (digits.length === 10 && digits.startsWith('3')) {
    return `57${digits}`;
  }

  // Si ya tiene el prefijo 57 y 12 dígitos en total (ej: 573123456789)
  if (digits.length === 12 && digits.startsWith('57')) {
    return digits;
  }

  // Si el usuario ingresó más o menos dígitos pero contiene al menos 10
  if (digits.length >= 10 && !digits.startsWith('57')) {
    return `57${digits.slice(-10)}`;
  }

  return digits || DEFAULT_STORE_WHATSAPP;
}

/**
 * Obtiene el número de WhatsApp oficial configurado para la tienda.
 */
export function getStoreWhatsAppNumber(): string {
  const envNumber = import.meta.env.VITE_STORE_WHATSAPP_NUMBER;
  return normalizePhoneNumber(envNumber || DEFAULT_STORE_WHATSAPP);
}

/**
 * Genera el enlace de WhatsApp que el CLIENTE envía a la TIENDA
 * para confirmar su pedido y enviar el comprobante de pago.
 */
export function generateWhatsAppUrl(orderData: OrderPayload, hasUploadedVoucher: boolean = false): string {
  const itemsText = orderData.items
    .map((item) => `  • ${item.cantidad}x ${item.nombre} → $${(item.precio * item.cantidad).toLocaleString('es-CO')}`)
    .join('\n');

  const storePhone = getStoreWhatsAppNumber();

  const voucherNote = hasUploadedVoucher
    ? `✅ *Comprobante de pago subido al sistema web.* Adjunto copia por aquí para validación inmediata.`
    : `📎 *Adjunto a este mensaje la captura de la transferencia.*`;

  const message = `⚡ *ORDEN CONFIRMADA - VICTORIA PERFORMANCE NUTRITION* ⚡

¡Hola equipo Victoria! Acabo de registrar mi pedido en la tienda oficial y deseo validar mi pago.

📋 *Detalle del Pedido:*
*Código Oficial:* #${orderData.codigoPedido}
*Fecha:* ${orderData.fecha}

🛒 *Suplementación Solicitada (SiS):*
${itemsText}

💰 *Liquidación Total:*
- *Subtotal:* $${orderData.subtotal.toLocaleString('es-CO')}
- *Costo de Envío:* $${orderData.costoEnvio.toLocaleString('es-CO')} (${orderData.tipoEnvio === 'domicilio' ? 'Envío Local' : 'Envío Nacional Asegurado'})
- *TOTAL A TRANSFERIR:* $${orderData.total.toLocaleString('es-CO')}

📍 *Destino y Datos de Despacho:*
- *Atleta:* ${orderData.nombre}
- *Celular:* ${orderData.telefono}
- *Ciudad:* ${orderData.ciudad}
- *Dirección:* ${orderData.direccion}
- *Observaciones:* ${orderData.notas?.trim() || 'Sin notas adicionales'}

💳 *Método de Transferencia:* ${orderData.metodoPago === 'nequi' ? 'Nequi' : 'Bancolombia'}

${voucherNote}

──────────────────────────
🏛️ Victoria Performance Nutrition S.A.S. • NIT 901.842.319-1
🔬 100% Original SiS • Informed Sport Certified
🛡️ Compra protegida por Ley 1480 de 2011 (Estatuto del Consumidor)
──────────────────────────`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${storePhone}?text=${encodedMessage}`;
}

/**
 * Genera el texto del mensaje de notificación que el ADMINISTRADOR envía al CLIENTE
 * cuando cambia el estado de su pedido.
 */
export function generateOrderStatusMessage(
  order: {
    codigo: string;
    nombreCliente: string;
    telefono: string;
    ciudad?: string;
    direccion?: string;
    total?: number;
    metodoPago?: string;
  },
  newStatus: string,
  extraNotes?: string
): string {
  const clientName = order.nombreCliente.trim().split(' ')[0] || order.nombreCliente;
  const codigo = order.codigo;

  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/pedido/${codigo}` : `https://victoriaperformance.com/pedido/${codigo}`;

  switch (newStatus) {
    case 'EN_PREPARACION':
      return `¡Hola ${clientName}! ⚡ Te saludamos del equipo de *Victoria Performance Nutrition*.

Te informamos que tu pedido *#${codigo}* ha cambiado a estado:
📦 *EN PREPARACIÓN / ALISTAMIENTO*

Nuestro equipo está empacando cuidadosamente tus suplementos de resistencia SiS en nuestro centro logístico. Te avisaremos en cuanto tu paquete sea entregado a la transportadora.

🔗 *Puedes seguir tu pedido en vivo aquí:*
${trackingUrl}

${extraNotes ? `ℹ️ *Nota del equipo:* ${extraNotes}\n\n` : ''}¡Muchas gracias por tu compra! 🚴‍♂️🏃‍♂️`;

    case 'ENVIADO':
      return `¡Hola ${clientName}! 🚚💨 ¡Excelentes noticias de *Victoria Performance Nutrition*!

Tu pedido *#${codigo}* ha sido *DESPACHADO / ENVIADO*.
📍 *Destino:* ${order.direccion || 'Dirección registrada'}, ${order.ciudad || 'Colombia'}

El paquete ya se encuentra en manos de la transportadora para entrega segura.
${extraNotes ? `📦 *Guía de Seguimiento / Notas:* ${extraNotes}\n` : ''}
🔗 *Rastrea el progreso en tiempo real:*
${trackingUrl}

Cualquier inquietud sobre tu envío, estamos disponibles por este mismo chat. ¡A romper marcas en tu próximo entrenamiento! 🔥⚡`;

    case 'ENTREGADO':
      return `¡Hola ${clientName}! ✅ Te confirmamos que tu pedido *#${codigo}* ha sido registrado como:
🏆 *ENTREGADO CON ÉXITO*

Esperamos que disfrutes al máximo tu nutrición deportiva especializada Science in Sport (SiS). Si tienes un minuto, cuéntanos cómo fue tu experiencia.

🔗 *Detalle de entrega:*
${trackingUrl}

¡Gracias por confiar en Victoria para potenciar tu rendimiento! 🚴‍♂️⚡`;

    case 'CANCELADO':
      return `Hola ${clientName}, te escribimos de *Victoria Performance Nutrition*.

Te informamos que tu orden *#${codigo}* ha sido *CANCELADA*.
${extraNotes ? `ℹ️ *Motivo:* ${extraNotes}\n` : ''}
Si realizaste un pago previamente o consideras que se trata de un error, por favor respóndenos a este mensaje para darte soporte prioritario.`;

    case 'PAGADO':
      return `¡Hola ${clientName}! 💳 Hemos verificado exitosamente tu pago para el pedido *#${codigo}* por valor de *$${(order.total || 0).toLocaleString('es-CO')}*.

Tu orden está *CONFIRMADA* y pasa de inmediato a nuestra línea de empaque y alistamiento.

🔗 *Sigue el estado en vivo:*
${trackingUrl}

¡Muchas gracias por elegir Victoria! ⚡`;

    default:
      return `¡Hola ${clientName}! Te escribimos de *Victoria Performance Nutrition* respecto a tu pedido *#${codigo}*.
Estado actual: *${newStatus}*.
🔗 *Ver pedido:* ${trackingUrl}
${extraNotes ? `\n${extraNotes}` : ''}`;
  }
}

/**
 * Genera el enlace de WhatsApp que el ADMIN abre para contactar al CLIENTE
 * con el mensaje de notificación precargado según el estado.
 */
export function generateAdminStatusWhatsAppUrl(
  order: {
    codigo: string;
    nombreCliente: string;
    telefono: string;
    ciudad?: string;
    direccion?: string;
    total?: number;
    metodoPago?: string;
  },
  newStatus: string,
  extraNotes?: string
): string {
  const customerPhone = normalizePhoneNumber(order.telefono);
  const message = generateOrderStatusMessage(order, newStatus, extraNotes);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${customerPhone}?text=${encodedMessage}`;
}

/**
 * Abre un enlace de WhatsApp de manera segura sin ser bloqueado.
 */
export function openWhatsAppLink(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
