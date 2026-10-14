import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { OrderPayload } from '../types';
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  ArrowLeft,
  FileText,
  Upload,
  ShieldCheck,
  Lock,
  Check,
  Loader2,
  Clock,
  PackageCheck,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { generateWhatsAppUrl, getStoreWhatsAppNumber } from '../utils/whatsapp';
import { Navbar } from '../components/layout/Navbar';
import { OfficialReceiptModal } from '../components/orders/OfficialReceiptModal';
import { orderService } from '../services/orderService';

export const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Estados de carga de comprobante
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState<string | null>(null);
  const [isUploadingVoucher, setIsUploadingVoucher] = useState(false);
  const [voucherUploadedUrl, setVoucherUploadedUrl] = useState<string | null>(null);

  // Copia de textos
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem('lastOrder');
    if (savedOrder) {
      const parsed = JSON.parse(savedOrder);
      setOrder(parsed);

      // Verificar si ya había subido un comprobante en la sesión
      const savedVoucher = sessionStorage.getItem(`voucher_${parsed.codigoPedido}`);
      if (savedVoucher) {
        setVoucherUploadedUrl(savedVoucher);
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!order) return null;

  const storePhone = getStoreWhatsAppNumber();
  const nequiNumber = storePhone.startsWith('57') ? storePhone.slice(2) : storePhone;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copiado al portapapeles`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Por favor selecciona una imagen (PNG, JPG) o un PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe exceder los 10MB');
      return;
    }

    setVoucherFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setVoucherPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setVoucherPreview(null);
    }
  };

  const handleUploadVoucher = async () => {
    if (!voucherFile || !order) return;

    setIsUploadingVoucher(true);
    try {
      const res = await orderService.uploadComprobante(order.codigoPedido, voucherFile);
      setVoucherUploadedUrl(res.comprobanteUrl);
      sessionStorage.setItem(`voucher_${order.codigoPedido}`, res.comprobanteUrl);
      toast.success('¡Comprobante recibido con éxito! Ha sido vinculado a tu pedido.');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Error al subir el comprobante. Intenta enviarlo por WhatsApp.');
    } finally {
      setIsUploadingVoucher(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-base text-gray-200">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
        
        {/* ── HEADER DE CONFIRMACIÓN ── */}
        <div className="w-20 h-20 bg-volt/10 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-volt rounded-full blur-xl opacity-20 animate-pulse" />
          <CheckCircle2 className="w-10 h-10 text-volt relative z-10" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-widest text-volt bg-volt/10 px-3 py-1 rounded-full border border-volt/20 mb-2">
          COMPRA REGISTRADA EN EL SISTEMA
        </span>
        
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2 text-center">
          ¡Orden Generada con Éxito!
        </h1>
        
        <p className="text-gray-400 text-center mb-8 max-w-lg text-sm sm:text-base">
          Hola <strong className="text-white">{order.nombre}</strong>, tu pedido <strong className="text-volt font-mono">#{order.codigoPedido}</strong> ha sido reservado en bodega. Para despachar tus suplementos SiS, sigue las instrucciones de transferencia a continuación.
        </p>

        {/* ── LÍNEA DE TIEMPO DEL PEDIDO (PROGRESS TRACKER) ── */}
        <div className="w-full bg-dark-surface border border-dark-border rounded-2xl p-5 mb-8 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            
            {/* Paso 1 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-volt text-black flex items-center justify-center font-black mb-2 shadow-[0_0_15px_rgba(204,255,0,0.35)]">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">1. Pedido Creado</p>
              <p className="text-[11px] text-volt font-mono font-bold">Completado</p>
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black mb-2 transition-all ${
                voucherUploadedUrl 
                  ? 'bg-volt text-black shadow-[0_0_15px_rgba(204,255,0,0.35)]' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
              }`}>
                {voucherUploadedUrl ? <Check className="w-5 h-5 stroke-[3]" /> : <Clock className="w-5 h-5" />}
              </div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">2. Comprobante</p>
              <p className={`text-[11px] font-mono font-bold ${voucherUploadedUrl ? 'text-volt' : 'text-amber-400'}`}>
                {voucherUploadedUrl ? 'Subido / En Validación' : 'Pendiente por Adjuntar'}
              </p>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-dark-card border border-white/10 text-gray-500 flex items-center justify-center font-bold mb-2">
                <PackageCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">3. Embalaje SiS</p>
              <p className="text-[11px] text-gray-600 font-mono">En Bodega</p>
            </div>

            {/* Paso 4 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-dark-card border border-white/10 text-gray-500 flex items-center justify-center font-bold mb-2">
                <Truck className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">4. Despacho</p>
              <p className="text-[11px] text-gray-600 font-mono">Guía de Envío</p>
            </div>

          </div>
        </div>

        {/* ── RECIBO RESUMIDO Y BOTÓN OFICIAL DE PDF ── */}
        <div className="w-full bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-2xl mb-8">
          
          {/* Header del Recibo */}
          <div className="bg-dark-card p-6 border-b border-dark-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                Referencia de Compra
              </p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-black text-white">#{order.codigoPedido}</span>
                <span className="bg-volt/10 text-volt text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-volt/20">
                  En Proceso
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <div className="sm:text-right">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                  Total a Transferir
                </p>
                <span className="font-mono text-2xl sm:text-3xl font-black text-volt">
                  ${order.total.toLocaleString('es-CO')} COP
                </span>
              </div>

              {/* Botón Descargar Comprobante Oficial (Opción 2) */}
              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark-surface hover:bg-white/10 text-white hover:text-volt border border-white/10 hover:border-volt/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <FileText className="w-4 h-4 text-volt" />
                <span>Ver / Descargar Recibo Oficial (PDF)</span>
              </button>
            </div>
          </div>

          {/* ── SECCIÓN DE TRANSFERENCIA (Opción 5) ── */}
          <div className="p-6 md:p-8 space-y-6 bg-dark-base relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-volt rounded-full inline-block" />
                Datos Oficiales de Transferencia ({order.metodoPago === 'nequi' ? 'Nequi' : 'Bancolombia'})
              </h3>
              <span className="text-xs font-mono text-gray-400">
                Lote Seguro • Sin comisiones
              </span>
            </div>

            {/* Tarjeta de Cuenta */}
            {order.metodoPago === 'nequi' ? (
              <div className="bg-dark-card border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-5 sm:p-6 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-[11px] uppercase tracking-wider">
                        Llave Nequi Verificada
                      </span>
                      <span className="text-xs text-gray-400 font-mono">Colombia</span>
                    </div>

                    <p className="text-xs text-gray-400">Número de Celular para Transferir:</p>
                    <p className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
                      {nequiNumber}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                      <p>Titular: <strong className="text-white">Victoria Performance</strong></p>
                      <p>Tipo: <strong className="text-white">Nequi Personal / Empresa</strong></p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(nequiNumber, 'Número Nequi')}
                      className="px-5 py-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
                    >
                      {copiedField === 'Número Nequi' ? <Check className="w-4 h-4 text-volt" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedField === 'Número Nequi' ? 'Copiado' : 'Copiar Número'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(order.total.toString(), 'Valor Total')}
                      className="px-5 py-2.5 bg-dark-surface hover:bg-dark-border text-gray-300 hover:text-white border border-dark-border rounded-xl font-semibold text-xs tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      {copiedField === 'Valor Total' ? <Check className="w-3.5 h-3.5 text-volt" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar Monto (${order.total.toLocaleString('es-CO')})</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-dark-card border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-5 sm:p-6 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px] uppercase tracking-wider">
                        Bancolombia Cuenta Oficial
                      </span>
                      <span className="text-xs text-gray-400 font-mono">Ahorros</span>
                    </div>

                    <p className="text-xs text-gray-400">Número de Cuenta de Ahorros:</p>
                    <p className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wider">
                      012 3456 7890
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400 pt-1">
                      <p>Titular: <strong className="text-white">Victoria Performance Nutrition S.A.S.</strong></p>
                      <p>NIT: <strong className="text-white font-mono">901.842.319-1</strong></p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy('01234567890', 'Número de Cuenta')}
                      className="px-5 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
                    >
                      {copiedField === 'Número de Cuenta' ? <Check className="w-4 h-4 text-volt" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedField === 'Número de Cuenta' ? 'Copiado' : 'Copiar Cuenta'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(order.total.toString(), 'Valor Total')}
                      className="px-5 py-2.5 bg-dark-surface hover:bg-dark-border text-gray-300 hover:text-white border border-dark-border rounded-xl font-semibold text-xs tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      {copiedField === 'Valor Total' ? <Check className="w-3.5 h-3.5 text-volt" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar Monto (${order.total.toLocaleString('es-CO')})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── ALERTA DE SEGURIDAD ANTIFRAUDE ── */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-200/90 leading-relaxed space-y-1">
                <p className="font-bold text-blue-300">
                  Garantía de Seguridad Oficial Antifraude
                </p>
                <p>
                  Verifica que el titular del destinatario coincida con <strong>Victoria Performance</strong> antes de confirmar tu transferencia. Nuestro equipo nunca te solicitará claves dinámicas ni códigos de seguridad por WhatsApp ni llamada telefónica.
                </p>
              </div>
            </div>

            {/* ── MÓDULO DE CARGA DE COMPROBANTE DE PAGO (Opción 5) ── */}
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-volt" />
                  <h4 className="font-bold text-white text-base">
                    Adjuntar Comprobante de Pago
                  </h4>
                </div>
                {voucherUploadedUrl ? (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-volt bg-volt/10 border border-volt/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Comprobante Recibido
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-gray-400">
                    Opcional pero recomendado
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Sube la captura de pantalla de tu transferencia Nequi o Bancolombia para que nuestro equipo de tesorería valide tu pago de inmediato y priorice el empaque de tus suplementos SiS.
              </p>

              {/* Input oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Zona de Arrastre / Selección */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  voucherFile
                    ? 'border-volt/50 bg-volt/5'
                    : 'border-white/10 hover:border-white/30 bg-dark-surface/50 hover:bg-dark-surface'
                }`}
              >
                {voucherPreview ? (
                  <div className="space-y-3">
                    <img
                      src={voucherPreview}
                      alt="Vista previa del comprobante"
                      className="max-h-48 rounded-xl border border-white/20 mx-auto shadow-lg object-contain"
                    />
                    <p className="text-xs text-volt font-mono font-bold">
                      {voucherFile?.name} ({(voucherFile!.size / 1024).toFixed(0)} KB) - Clic para cambiar
                    </p>
                  </div>
                ) : voucherFile ? (
                  <div className="space-y-2">
                    <FileText className="w-10 h-10 text-volt mx-auto" />
                    <p className="text-xs font-bold text-white">{voucherFile.name}</p>
                    <p className="text-[11px] text-gray-400">Documento listo para cargar. Clic para cambiar.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
                      <Upload className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">
                      Haz clic para seleccionar la captura o PDF
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Formatos admitidos: PNG, JPG, WEBP o PDF (Hasta 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Botón de Enviar Comprobante al Servidor */}
              {voucherFile && !voucherUploadedUrl && (
                <button
                  type="button"
                  onClick={handleUploadVoucher}
                  disabled={isUploadingVoucher}
                  className="w-full py-3.5 bg-volt hover:bg-[#ccff00] text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:opacity-50"
                >
                  {isUploadingVoucher ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subiendo y Vinculando Comprobante...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registrar Comprobante en mi Pedido</span>
                    </>
                  )}
                </button>
              )}

              {voucherUploadedUrl && (
                <div className="p-3 bg-volt/10 border border-volt/20 rounded-xl text-xs text-volt flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>
                    Comprobante registrado con éxito. Nuestro equipo validará el pago en los próximos minutos.
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── BOTONES DE ACCIÓN (WHATSAPP PRINCIPAL) ── */}
        <div className="w-full space-y-4 mb-12">
          <a
            href={generateWhatsAppUrl(order, Boolean(voucherUploadedUrl))}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-black font-black uppercase text-sm sm:text-base tracking-wider py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(37,211,102,0.35)] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            <MessageCircle className="w-6 h-6 shrink-0" />
            <span>
              {voucherUploadedUrl
                ? 'Notificar Pago por WhatsApp a la Tienda'
                : 'Enviar Comprobante a WhatsApp Ahora'}
            </span>
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="w-full bg-dark-card hover:bg-dark-surface border border-dark-border text-gray-200 hover:text-white font-bold uppercase text-xs tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-volt" />
              <span>Ver Comprobante Oficial</span>
            </button>

            <Link
              to="/"
              className="w-full bg-dark-card hover:bg-dark-surface border border-dark-border text-gray-400 hover:text-white font-bold uppercase text-xs tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </Link>
          </div>
        </div>

        {/* ── SELLOS DE CONFIANZA Y CUMPLIMIENTO LEGAL (FOOTER) ── */}
        <div className="w-full border-t border-dark-border pt-8 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-volt/10 text-volt border border-volt/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-xs uppercase text-white tracking-wider">
                Original SiS Garantizado
              </h5>
              <p className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
                Productos oficiales Science in Sport con certificación anti-dopaje <em>Informed Sport</em>.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/5 text-gray-300 border border-white/10 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-xs uppercase text-white tracking-wider">
                Estatuto del Consumidor
              </h5>
              <p className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
                Compra respaldada por la Ley 1480 de 2011 de Colombia. Derecho al retracto de 5 días.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/5 text-gray-300 border border-white/10 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-xs uppercase text-white tracking-wider">
                Envíos 100% Asegurados
              </h5>
              <p className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
                Despachos nacionales con Servientrega e Interrapidísimo asegurados contra pérdida o avería.
              </p>
            </div>

          </div>

          <p className="text-[10px] text-center text-gray-600 font-mono mt-8">
            Victoria Performance Nutrition S.A.S. • NIT 901.842.319-1 • Bogotá D.C., Colombia
          </p>
        </div>

      </div>

      {/* ── MODAL DEL RECIBO OFICIAL PARA IMPRIMIR / GUARDAR PDF ── */}
      <OfficialReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        order={order}
      />
    </div>
  );
};
