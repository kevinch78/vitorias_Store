import React from 'react';
import type { OrderPayload } from '../../types';
import { Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface OfficialReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderPayload;
}

export const OfficialReceiptModal: React.FC<OfficialReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    `VICTORIA-ORDER:${order.codigoPedido}|CLIENTE:${order.nombre}|TOTAL:${order.total}|FECHA:${order.fecha}`
  )}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Container con estilos de pantalla y clase para print */}
      <div className="relative w-full max-w-3xl my-6 bg-dark-surface border border-dark-border rounded-2xl shadow-2xl overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none print:bg-white print:text-black">
        
        {/* Barra superior de herramientas (se oculta al imprimir) */}
        <div className="p-4 bg-dark-card border-b border-dark-border flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-volt animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-300">
              Comprobante Oficial de Compra • Vista Previa
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-volt hover:bg-[#ccff00] text-black font-black uppercase text-xs tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)] active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white bg-dark-surface hover:bg-dark-border rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── HOJA DEL RECIBO (Optimizada para pantalla oscura y para imprimir en blanco/negro) ── */}
        <div id="official-receipt-print" className="p-6 sm:p-10 space-y-8 bg-[#0D1019] text-gray-200 print:bg-white print:text-black print:p-6">
          
          {/* Header Institucional */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-white/10 print:border-black/20 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-volt rounded-full inline-block print:bg-black" />
                <h1 className="text-2xl font-black uppercase tracking-tight text-white print:text-black">
                  Victoria Performance Nutrition
                </h1>
              </div>
              <p className="text-xs font-mono text-gray-400 print:text-gray-600">
                Distribución Oficial de Nutrición Deportiva SiS (Science in Sport)
              </p>
              <p className="text-xs text-gray-400 print:text-gray-700">
                <strong>NIT:</strong> 901.842.319-1 • Régimen Comercial Colombiano
              </p>
              <p className="text-xs text-gray-400 print:text-gray-700">
                Bogotá D.C., Colombia • Soporte: contacto@victoriaperformance.com
              </p>
            </div>

            <div className="sm:text-right bg-dark-card print:bg-gray-100 p-4 rounded-xl border border-white/10 print:border-gray-300 min-w-[220px]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-volt print:text-black block mb-1">
                COMPROBANTE DE ORDEN
              </span>
              <p className="text-xl font-mono font-black text-white print:text-black">
                #{order.codigoPedido}
              </p>
              <p className="text-xs text-gray-400 print:text-gray-600 mt-1">
                {order.fecha}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-volt/10 text-volt border border-volt/20 print:bg-black print:text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>REGISTRADO EN SISTEMA</span>
              </div>
            </div>
          </div>

          {/* Información del Cliente y Despacho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-card print:bg-gray-50 p-5 rounded-xl border border-white/5 print:border-gray-200">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase text-gray-400 print:text-gray-600 mb-1">
                Datos del Comprador / Atleta
              </p>
              <p className="font-bold text-white print:text-black text-base">{order.nombre}</p>
              <p className="text-sm text-gray-300 print:text-gray-700">Tel: +57 {order.telefono}</p>
              <p className="text-xs text-gray-400 print:text-gray-600 mt-1">
                Método de Pago: <strong className="uppercase">{order.metodoPago}</strong>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-mono font-bold uppercase text-gray-400 print:text-gray-600 mb-1">
                Destino y Envío Asegurado
              </p>
              <p className="font-bold text-white print:text-black text-base">{order.ciudad}, Colombia</p>
              <p className="text-sm text-gray-300 print:text-gray-700">{order.direccion}</p>
              <p className="text-xs text-gray-400 print:text-gray-600 mt-1">
                Modalidad: {order.tipoEnvio === 'domicilio' ? 'Entrega Local' : 'Despacho Nacional Certificado'}
              </p>
              {order.notas && (
                <p className="text-xs italic text-gray-400 print:text-gray-600 mt-1">
                  Nota: "{order.notas}"
                </p>
              )}
            </div>
          </div>

          {/* Tabla de Productos SiS */}
          <div className="overflow-hidden border border-white/10 print:border-gray-300 rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-dark-card print:bg-gray-200 text-gray-400 print:text-gray-700 text-xs uppercase font-mono border-b border-white/10 print:border-gray-300">
                <tr>
                  <th className="p-3.5 pl-4">Ítem / Suplemento</th>
                  <th className="p-3.5 text-center">Cant.</th>
                  <th className="p-3.5 text-right">Precio Unit.</th>
                  <th className="p-3.5 pr-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-gray-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] print:hover:bg-transparent">
                    <td className="p-3.5 pl-4">
                      <p className="font-bold text-white print:text-black">{item.nombre}</p>
                      <span className="text-[11px] text-gray-400 print:text-gray-600 font-mono">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-gray-200 print:text-black">
                      {item.cantidad}
                    </td>
                    <td className="p-3.5 text-right font-mono text-gray-300 print:text-gray-800">
                      ${item.precio.toLocaleString('es-CO')}
                    </td>
                    <td className="p-3.5 pr-4 text-right font-mono font-bold text-white print:text-black">
                      ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumen de Liquidación y Código QR */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pt-2">
            {/* QR de Trazabilidad */}
            <div className="flex items-center gap-4 bg-dark-card print:bg-gray-50 p-3.5 rounded-xl border border-white/5 print:border-gray-200">
              <img
                src={qrUrl}
                alt="QR Validación"
                className="w-20 h-20 bg-white p-1 rounded-lg border border-white/10 print:border-gray-400 shrink-0"
              />
              <div className="text-xs space-y-1">
                <span className="font-mono font-bold text-volt print:text-black uppercase text-[10px] block">
                  Verificación Digital
                </span>
                <p className="text-gray-300 print:text-gray-700 font-mono">
                  Código: #{order.codigoPedido}
                </p>
                <p className="text-[11px] text-gray-400 print:text-gray-600 max-w-[200px]">
                  Escanea para validar autenticidad de la orden con el servidor central.
                </p>
              </div>
            </div>

            {/* Totales */}
            <div className="w-full sm:w-72 space-y-2 bg-dark-card print:bg-gray-100 p-4 rounded-xl border border-white/10 print:border-gray-300">
              <div className="flex justify-between text-xs text-gray-400 print:text-gray-700">
                <span>Subtotal Suplementos:</span>
                <span className="font-mono font-bold text-gray-200 print:text-black">
                  ${order.subtotal.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 print:text-gray-700">
                <span>Envío ({order.tipoEnvio === 'domicilio' ? 'Local' : 'Nacional'}):</span>
                <span className="font-mono font-bold text-gray-200 print:text-black">
                  ${order.costoEnvio.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="h-px bg-white/10 print:bg-gray-300 my-1" />
              <div className="flex justify-between items-center text-sm">
                <span className="font-black text-white print:text-black uppercase">
                  TOTAL A PAGAR:
                </span>
                <span className="font-mono text-xl font-black text-volt print:text-black">
                  ${order.total.toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>
          </div>

          {/* Respaldo Legal y Cláusulas de Garantía */}
          <div className="pt-4 border-t border-white/10 print:border-gray-300 space-y-3">
            <div className="flex items-center gap-2 text-volt print:text-black font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantías y Protección Legal al Consumidor</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-gray-400 print:text-gray-700 leading-relaxed font-sans">
              <div className="bg-dark-card/50 print:bg-transparent p-2.5 rounded-lg border border-white/5 print:border-none">
                <strong className="text-gray-200 print:text-black block mb-0.5">🔬 Autenticidad SiS:</strong>
                Lotes certificados por <em>Informed Sport</em>. Suplementos libres de sustancias prohibidas WADA/AMA.
              </div>
              <div className="bg-dark-card/50 print:bg-transparent p-2.5 rounded-lg border border-white/5 print:border-none">
                <strong className="text-gray-200 print:text-black block mb-0.5">⚖️ Ley 1480 de 2011:</strong>
                Estatuto del Consumidor en Colombia. Derecho al retracto dentro de 5 días hábiles con empaque sellado.
              </div>
              <div className="bg-dark-card/50 print:bg-transparent p-2.5 rounded-lg border border-white/5 print:border-none">
                <strong className="text-gray-200 print:text-black block mb-0.5">📦 Envíos Asegurados:</strong>
                Paquete protegido contra pérdida o deterioro en transporte intermunicipal.
              </div>
            </div>

            <p className="text-[10px] text-center text-gray-500 print:text-gray-600 font-mono pt-2">
              Victoria Performance Nutrition S.A.S. • Este documento es soporte digital de liquidación de pedido comercial.
            </p>
          </div>

        </div>

        {/* Footer del Modal (oculto en impresión) */}
        <div className="p-4 bg-dark-card border-t border-dark-border flex items-center justify-between print:hidden">
          <p className="text-xs text-gray-400">
            Consejo: Puedes imprimir en papel o seleccionar <strong>"Guardar como PDF"</strong> en el diálogo de impresión.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-dark-surface hover:bg-dark-border text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
