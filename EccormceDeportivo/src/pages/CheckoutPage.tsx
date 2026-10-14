import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { generateWhatsAppUrl } from '../utils/whatsapp';
import type { OrderPayload } from '../types';
import { toast } from 'sonner';
import { ArrowRight, ShoppingBag, Truck, CreditCard } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { orderService } from '../services/orderService';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    notas: '',
    tipoEnvio: 'nacional' as 'domicilio' | 'nacional',
    metodoPago: 'nequi' as 'nequi' | 'bancolombia',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      toast.info('Tu carrito está vacío, añade productos antes de procesar tu compra.');
      navigate('/');
    }
  }, [items, navigate]);

  const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const costoEnvio = formData.tipoEnvio === 'domicilio' ? 8000 : 0;
  const total = subtotal + costoEnvio;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!formData.telefono.startsWith('3') || formData.telefono.length !== 10) {
      toast.error('El celular debe tener 10 dígitos y empezar por 3.');
      return;
    }

    if (formData.nombre.trim().length < 3 || formData.ciudad.trim().length < 3 || formData.direccion.trim().length < 3) {
      toast.error('Por favor, ingresa datos válidos para nombre, ciudad y dirección (mínimo 3 caracteres).');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayloadToApi = {
        nombreCliente: formData.nombre,
        telefono: formData.telefono,
        ciudad: formData.ciudad,
        direccion: formData.direccion,
        notas: formData.notas,
        metodoEnvio: formData.tipoEnvio === 'domicilio' ? 'Local' : 'Nacional',
        metodoPago: formData.metodoPago === 'nequi' ? 'Nequi' : 'Bancolombia',
        items: items.map((i) => ({ productoId: i.id, cantidad: i.cantidad })),
      };

      const createdOrder = await orderService.createOrder(orderPayloadToApi);

      const orderPayloadToWhatsapp: OrderPayload = {
        ...formData,
        codigoPedido: createdOrder.codigo,
        items,
        subtotal,
        costoEnvio,
        total: createdOrder.total,
        fecha: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      };

      sessionStorage.setItem('lastOrder', JSON.stringify(orderPayloadToWhatsapp));

      const whatsappUrl = generateWhatsAppUrl(orderPayloadToWhatsapp);
      try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Popup prevented by browser', e);
      }

      clearCart();
      navigate('/pedido-confirmado');
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error al crear tu pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-dark-base text-gray-200">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3 mb-8">
          <span className="w-8 h-1 bg-volt block rounded-full" />
          Finalizar Compra
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Columna Izquierda: Formulario (60%) */}
          <div className="lg:w-3/5 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 bg-dark-surface p-6 rounded-2xl border border-dark-border">
              
              {/* Información de Contacto */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-volt"><ShoppingBag className="w-5 h-5" /></span>
                  Datos de Contacto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Nombre Completo</label>
                    <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full bg-dark-card border border-white/10 rounded-lg px-4 py-3 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none transition-all" placeholder="Ej: Atleta Pro" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Teléfono Celular</label>
                    <input required type="tel" pattern="[0-9]{10}" name="telefono" value={formData.telefono} onChange={handleInputChange} className="w-full bg-dark-card border border-white/10 rounded-lg px-4 py-3 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none transition-all" placeholder="300 000 0000" />
                  </div>
                </div>
              </div>

              <div className="h-px bg-dark-border w-full" />

              {/* Información de Envío */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-volt"><Truck className="w-5 h-5" /></span>
                  Entrega
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-1">Ciudad / Municipio</label>
                      <input required type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} className="w-full bg-dark-card border border-white/10 rounded-lg px-4 py-3 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none transition-all" placeholder="Ej: Medellín" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-1">Dirección y Barrio</label>
                      <input required type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="w-full bg-dark-card border border-white/10 rounded-lg px-4 py-3 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none transition-all" placeholder="Ej: Calle 123 #45-67, El Poblado" />
                    </div>
                  </div>
                  
                  {/* Tipo de Envío Selector */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Método de Envío</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none ${formData.tipoEnvio === 'domicilio' ? 'border-volt bg-volt/5' : 'border-dark-border bg-dark-card hover:border-gray-500'}`}>
                        <input type="radio" name="tipoEnvio" value="domicilio" checked={formData.tipoEnvio === 'domicilio'} onChange={handleInputChange} className="sr-only" />
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">Domicilio Local</span>
                          <span className="text-xs text-gray-400 mt-1">Medellín y AM - $8.000 COP</span>
                        </div>
                        {formData.tipoEnvio === 'domicilio' && <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-volt shadow-[0_0_10px_#ccff00]" />}
                      </label>
                      
                      <label className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none ${formData.tipoEnvio === 'nacional' ? 'border-volt bg-volt/5' : 'border-dark-border bg-dark-card hover:border-gray-500'}`}>
                        <input type="radio" name="tipoEnvio" value="nacional" checked={formData.tipoEnvio === 'nacional'} onChange={handleInputChange} className="sr-only" />
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">Envío Nacional</span>
                          <span className="text-xs text-gray-400 mt-1">Pago contra entrega - $0 COP web</span>
                        </div>
                        {formData.tipoEnvio === 'nacional' && <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-volt shadow-[0_0_10px_#ccff00]" />}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Notas (Opcional)</label>
                    <textarea name="notas" value={formData.notas} onChange={handleInputChange} rows={2} className="w-full bg-dark-card border border-white/10 rounded-lg px-4 py-3 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none transition-all resize-none" placeholder="Instrucciones para la entrega..." />
                  </div>
                </div>
              </div>

              <div className="h-px bg-dark-border w-full" />

              {/* Información de Pago */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-volt"><CreditCard className="w-5 h-5" /></span>
                  Método de Pago
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none ${formData.metodoPago === 'nequi' ? 'border-[#390099] bg-[#390099]/10' : 'border-dark-border bg-dark-card hover:border-gray-500'}`}>
                    <input type="radio" name="metodoPago" value="nequi" checked={formData.metodoPago === 'nequi'} onChange={handleInputChange} className="sr-only" />
                    <span className="font-bold text-white">Nequi</span>
                    {formData.metodoPago === 'nequi' && <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#390099] shadow-[0_0_10px_#390099]" />}
                  </label>
                  
                  <label className={`relative flex cursor-pointer rounded-xl border p-4 focus:outline-none ${formData.metodoPago === 'bancolombia' ? 'border-[#FDDA24] bg-[#FDDA24]/10' : 'border-dark-border bg-dark-card hover:border-gray-500'}`}>
                    <input type="radio" name="metodoPago" value="bancolombia" checked={formData.metodoPago === 'bancolombia'} onChange={handleInputChange} className="sr-only" />
                    <span className="font-bold text-white">Bancolombia / Transf.</span>
                    {formData.metodoPago === 'bancolombia' && <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-[#FDDA24] shadow-[0_0_10px_#FDDA24]" />}
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* Columna Derecha: Resumen (40%) */}
          <div className="lg:w-2/5 order-first lg:order-last mb-8 lg:mb-0">
            <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border sticky top-28">
              <h2 className="text-lg font-black uppercase text-white mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded bg-dark-card overflow-hidden shrink-0 border border-dark-border">
                      <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-200 line-clamp-2">{item.nombre}</h4>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-gray-500">Cant: {item.cantidad}</span>
                        <span className="font-mono text-white font-bold">${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-border pt-4 space-y-3">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">${subtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Envío</span>
                  <span className="font-mono text-white">{costoEnvio === 0 ? 'Por definir (Cobro en destino)' : `$${costoEnvio.toLocaleString('es-CO')}`}</span>
                </div>
                <div className="border-t border-dark-border pt-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold uppercase tracking-wider">Total</span>
                    <span className="text-2xl font-black text-volt font-mono">${total.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full mt-8 bg-volt hover:bg-volt-hover text-volt-contrast font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all glow-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando...' : <><ArrowRight className="w-5 h-5" /> Generar Pedido y Abrir WhatsApp</>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
