import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  Search,
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MessageCircle,
  FileText,
  Upload,
  MapPin,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '../components/layout/Navbar';
import { orderService } from '../services/orderService';
import { getImageUrl } from '../utils/image';
import { OfficialReceiptModal } from '../components/orders/OfficialReceiptModal';
import { getStoreWhatsAppNumber } from '../utils/whatsapp';
import type { OrderPayload } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const { codigo } = useParams<{ codigo?: string }>();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q');

  const [query, setQuery] = useState(codigo || queryParam || '');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal de Recibo Oficial
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Upload de comprobante desde la página de rastreo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchOrderData = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await orderService.trackOrders(searchTerm.trim());
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
        setActiveOrder(data[0]);
      } else if (data && data.codigo) {
        setOrders([data]);
        setActiveOrder(data);
      } else {
        setOrders([]);
        setActiveOrder(null);
        toast.error('No se encontró ningún pedido con esa referencia');
      }
    } catch (err: any) {
      setOrders([]);
      setActiveOrder(null);
      toast.error(err?.response?.data?.message || 'No se encontró ningún pedido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const term = codigo || queryParam;
    if (term) {
      setQuery(term);
      fetchOrderData(term);
    }
  }, [codigo, queryParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Ingresa un código de pedido o número celular');
      return;
    }
    fetchOrderData(query);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeOrder) return;

    setIsUploading(true);
    try {
      const res = await orderService.uploadComprobante(activeOrder.codigo, file);
      setActiveOrder((prev: any) => ({ ...prev, comprobantePago: res.comprobanteUrl }));
      toast.success('¡Comprobante cargado con éxito! Tesorería lo revisará a la brevedad.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al subir el comprobante');
    } finally {
      setIsUploading(false);
    }
  };

  // Mapeo de estados a pasos de la línea de tiempo
  const getStepProgress = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 1;
      case 'EN_PREPARACION':
        return 2;
      case 'ENVIADO':
        return 3;
      case 'ENTREGADO':
        return 4;
      case 'CANCELADO':
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = activeOrder ? getStepProgress(activeOrder.estado) : 0;

  // Adaptar orden al tipo OrderPayload para el modal de recibo
  const receiptOrderPayload: OrderPayload | null = activeOrder
    ? {
        codigoPedido: activeOrder.codigo,
        nombre: activeOrder.nombreCliente,
        telefono: activeOrder.telefono,
        ciudad: activeOrder.ciudad,
        direccion: activeOrder.direccion,
        notas: activeOrder.notas || '',
        tipoEnvio: activeOrder.metodoEnvio === 'Local' ? 'domicilio' : 'nacional',
        metodoPago: activeOrder.metodoPago?.toLowerCase() === 'nequi' ? 'nequi' : 'bancolombia',
        items: (activeOrder.detalles || []).map((d: any) => ({
          id: d.producto?.id || d.id,
          nombre: d.producto?.nombre || 'Producto SiS',
          slug: d.producto?.slug || '',
          categoria: d.producto?.categoria?.nombre || 'Nutrición Deportiva',
          precio: d.precio,
          descripcion: d.producto?.descripcion || '',
          imagenUrl: d.producto?.imagen || '',
          stock: 10,
          badges: [],
          cantidad: d.cantidad,
        })),
        subtotal: (activeOrder.detalles || []).reduce((acc: number, d: any) => acc + d.precio * d.cantidad, 0),
        costoEnvio: activeOrder.total - (activeOrder.detalles || []).reduce((acc: number, d: any) => acc + d.precio * d.cantidad, 0),
        total: activeOrder.total,
        fecha: new Date(activeOrder.createdAt).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
    : null;

  return (
    <div className="min-h-screen bg-dark-base text-gray-200">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* ── HEADER DEL PORTAL ── */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-volt/10 border border-volt/20 text-volt text-xs font-mono font-bold uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5" />
            <span>Portal de Trazabilidad en Vivo</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Rastreo Oficial de Pedidos
          </h1>

          <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto">
            Consulta en tiempo real el estado de alistamiento y despacho de tus suplementos SiS directamente desde nuestra base de datos.
          </p>
        </div>

        {/* ── BUSCADOR DE PEDIDOS ── */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-4 sm:p-6 shadow-2xl mb-10">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ingresa tu código (ej: PED-381449) o tu celular (300...)"
                className="w-full pl-12 pr-4 py-3.5 bg-dark-card border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-volt focus:ring-1 focus:ring-volt font-mono text-sm transition-all"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 bg-volt hover:bg-[#ccff00] text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:opacity-50 active:scale-95 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Rastrear Pedido</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span className="font-mono text-gray-500">Búsqueda rápida:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('PED-381449');
                fetchOrderData('PED-381449');
              }}
              className="text-volt hover:underline font-mono bg-volt/5 px-2 py-0.5 rounded border border-volt/10"
            >
              #PED-381449
            </button>
          </div>
        </div>

        {/* ── SELECTOR SI SE ENCONTRARON VARIOS PEDIDOS POR TELÉFONO ── */}
        {orders.length > 1 && (
          <div className="mb-8 bg-dark-card border border-white/10 rounded-2xl p-4">
            <p className="text-xs font-mono font-bold uppercase text-gray-400 mb-3">
              Se encontraron {orders.length} pedidos asociados. Selecciona uno:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {orders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => setActiveOrder(ord)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    activeOrder?.id === ord.id
                      ? 'bg-volt/10 border-volt text-white'
                      : 'bg-dark-surface border-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <p className="font-mono font-bold text-white text-sm">#{ord.codigo}</p>
                  <p className="text-[11px] text-gray-400">{new Date(ord.createdAt).toLocaleDateString('es-CO')}</p>
                  <span className="text-[10px] font-bold text-volt uppercase">{ord.estado}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── VISTA PRINCIPAL DEL PEDIDO ENCONTRADO ── */}
        {activeOrder && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Banner de Estado Hero */}
            <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                      #{activeOrder.codigo}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono px-3 py-1 rounded-full border uppercase tracking-wider ${
                        activeOrder.estado === 'ENTREGADO'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : activeOrder.estado === 'ENVIADO'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : activeOrder.estado === 'EN_PREPARACION'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          : activeOrder.estado === 'CANCELADO'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {activeOrder.estado === 'PENDIENTE'
                        ? '🟡 Pendiente de Pago'
                        : activeOrder.estado === 'EN_PREPARACION'
                        ? '📦 En Alistamiento / Bodega'
                        : activeOrder.estado === 'ENVIADO'
                        ? '🚚 En Camino / Despachado'
                        : activeOrder.estado === 'ENTREGADO'
                        ? '🏆 Entregado al Atleta'
                        : '❌ Cancelado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Registrado el {new Date(activeOrder.createdAt).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(true)}
                    className="px-4 py-2 bg-dark-card hover:bg-white/10 text-white border border-white/10 hover:border-volt/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-volt" />
                    <span>Recibo Oficial (PDF)</span>
                  </button>
                </div>
              </div>

              {/* ── LÍNEA DE TIEMPO INTERACTIVA EN VIVO ── */}
              {activeOrder.estado !== 'CANCELADO' ? (
                <div className="py-8">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center relative">
                    
                    {/* Paso 1: Pedido Registrado */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-volt text-black flex items-center justify-center font-black mb-2 shadow-[0_0_20px_rgba(204,255,0,0.4)]">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        1. Pedido Creado
                      </p>
                      <p className="text-[11px] text-volt font-mono font-bold">Completado</p>
                    </div>

                    {/* Paso 2: Validación de Pago */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black mb-2 transition-all ${
                          currentStep >= 2 || activeOrder.comprobantePago
                            ? 'bg-volt text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {currentStep >= 2 ? (
                          <Check className="w-6 h-6 stroke-[3]" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        2. Verificación Pago
                      </p>
                      <p
                        className={`text-[11px] font-mono font-bold ${
                          currentStep >= 2
                            ? 'text-volt'
                            : activeOrder.comprobantePago
                            ? 'text-amber-400'
                            : 'text-gray-400'
                        }`}
                      >
                        {currentStep >= 2
                          ? 'Confirmado'
                          : activeOrder.comprobantePago
                          ? 'Comprobante en Revisión'
                          : 'Pendiente de Pago'}
                      </p>
                    </div>

                    {/* Paso 3: Embalaje SiS */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black mb-2 transition-all ${
                          currentStep >= 3
                            ? 'bg-volt text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]'
                            : currentStep === 2
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse'
                            : 'bg-dark-card border border-white/10 text-gray-500'
                        }`}
                      >
                        {currentStep >= 3 ? (
                          <Check className="w-6 h-6 stroke-[3]" />
                        ) : (
                          <PackageCheck className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        3. Alistamiento SiS
                      </p>
                      <p className="text-[11px] font-mono font-bold text-gray-400">
                        {currentStep >= 3 ? 'Listo para Despacho' : currentStep === 2 ? 'Empacando en Bodega' : 'En Cola'}
                      </p>
                    </div>

                    {/* Paso 4: Despacho y Entrega */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black mb-2 transition-all ${
                          currentStep >= 4
                            ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                            : currentStep === 3
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse'
                            : 'bg-dark-card border border-white/10 text-gray-500'
                        }`}
                      >
                        {currentStep >= 4 ? (
                          <Check className="w-6 h-6 stroke-[3]" />
                        ) : (
                          <Truck className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        4. En Ruta / Entrega
                      </p>
                      <p className="text-[11px] font-mono font-bold text-gray-400">
                        {currentStep >= 4 ? 'Entregado' : currentStep === 3 ? 'En Camino' : 'Pendiente'}
                      </p>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl my-6">
                  <XCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-bold text-sm">Este pedido fue cancelado.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Si crees que se trata de un error, contáctanos de inmediato por WhatsApp.
                  </p>
                </div>
              )}

              {/* Si el pedido está pendiente y no tiene comprobante, permitir subirlo aquí */}
              {activeOrder.estado === 'PENDIENTE' && (
                <div className="bg-dark-card border border-white/10 rounded-xl p-5 mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-volt" />
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        ¿Ya realizaste la transferencia?
                      </p>
                    </div>
                    {activeOrder.comprobantePago && (
                      <span className="text-[10px] text-volt bg-volt/10 border border-volt/20 px-2 py-0.5 rounded-full font-bold">
                        Comprobante Adjuntado
                      </span>
                    )}
                  </div>

                  {activeOrder.comprobantePago ? (
                    <div className="flex items-center gap-3 text-xs text-gray-300 bg-dark-base p-3 rounded-lg border border-white/5">
                      <CheckCircle2 className="w-4 h-4 text-volt shrink-0" />
                      <span>
                        Tu comprobante ya está registrado en el sistema. El equipo de tesorería lo validará para pasar a empaque.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                        Adjunta tu comprobante Nequi o Bancolombia para que tu pedido sea priorizado.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-5 py-2.5 bg-volt hover:bg-[#ccff00] text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Cargando...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Subir Comprobante Ahora</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* ── DETALLE DEL PEDIDO Y PRODUCTOS ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Columna Izquierda: Productos (2 cols) */}
              <div className="md:col-span-2 bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-volt" />
                  <span>Suplementos SiS en este Pedido</span>
                </h3>

                <div className="divide-y divide-white/5">
                  {(activeOrder.detalles || []).map((item: any) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getImageUrl(item.producto?.imagen)}
                          alt={item.producto?.nombre || 'Producto'}
                          className="w-12 h-12 rounded-xl border border-white/10 bg-black/40 object-contain p-1 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {item.producto?.nombre || 'Producto SiS'}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            {item.cantidad} x ${item.precio.toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white shrink-0">
                        ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                  <span className="font-bold uppercase text-gray-400 text-xs">Total Liquidado</span>
                  <span className="font-mono font-black text-2xl text-volt">
                    ${activeOrder.total.toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              {/* Columna Derecha: Datos de Entrega y Soporte (1 col) */}
              <div className="space-y-6">
                
                {/* Datos de Entrega */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 shadow-xl space-y-3">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-volt" />
                    <span>Destino de Envío</span>
                  </h4>

                  <div className="text-xs text-gray-300 space-y-1.5 leading-relaxed font-sans">
                    <p><strong className="text-white">Atleta:</strong> {activeOrder.nombreCliente}</p>
                    <p><strong className="text-white">Ciudad:</strong> {activeOrder.ciudad}, Colombia</p>
                    <p><strong className="text-white">Dirección:</strong> {activeOrder.direccion}</p>
                    <p><strong className="text-white">Método:</strong> {activeOrder.metodoEnvio} Asegurado</p>
                    <p><strong className="text-white">Pago:</strong> {activeOrder.metodoPago}</p>
                    {activeOrder.notas && (
                      <p className="text-gray-400 italic pt-1">"{activeOrder.notas}"</p>
                    )}
                  </div>
                </div>

                {/* Contacto Directo WhatsApp */}
                <div className="bg-gradient-to-br from-[#121624] to-[#0A0D14] border border-[#25D366]/20 rounded-2xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-[#25D366]">
                    <MessageCircle className="w-5 h-5" />
                    <h4 className="font-bold text-sm uppercase tracking-wider text-white">
                      ¿Preguntas sobre tu Pedido?
                    </h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Escribe directamente a nuestra línea oficial de atención para consultar avances o requerimientos especiales.
                  </p>
                  <a
                    href={`https://wa.me/${getStoreWhatsAppNumber()}?text=${encodeURIComponent(
                      `¡Hola Victoria Performance! Consulto sobre mi pedido #${activeOrder.codigo} a nombre de ${activeOrder.nombreCliente}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chatear por WhatsApp</span>
                  </a>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ── MENSAJE SI NO HA BUSCADO O NO ENCONTRÓ ── */}
        {!activeOrder && hasSearched && !isLoading && (
          <div className="text-center py-12 bg-dark-surface border border-dark-border rounded-2xl p-8 space-y-4">
            <XCircle className="w-12 h-12 text-gray-500 mx-auto" />
            <h3 className="text-xl font-bold text-white uppercase">
              No se encontraron pedidos
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Verifica haber escrito correctamente tu código (ej: <strong>PED-381449</strong>) o el número de teléfono con el que realizaste la compra.
            </p>
          </div>
        )}

        {/* ── SELLOS DE GARANTÍA LEGAL ── */}
        <div className="mt-16 pt-8 border-t border-dark-border text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-volt" />
              <span>Lotes SiS Informed Sport Certified</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
              <Truck className="w-4 h-4 text-volt" />
              <span>Envíos Asegurados a Todo Colombia</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-volt" />
              <span>Protegido por Ley 1480 de 2011</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 font-mono">
            Victoria Performance Nutrition S.A.S. • NIT 901.842.319-1 • Bogotá D.C., Colombia
          </p>
        </div>

      </div>

      {/* ── MODAL DEL RECIBO OFICIAL IMPRIMIBLE / PDF ── */}
      {receiptOrderPayload && (
        <OfficialReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          order={receiptOrderPayload}
        />
      )}
    </div>
  );
};
