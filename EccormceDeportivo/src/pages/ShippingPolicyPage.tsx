import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Truck, MapPin, Clock } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-base flex flex-col text-gray-200">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Políticas de Envío</h1>
        
        <div className="space-y-12">
          <section className="bg-dark-surface border border-dark-border p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-volt" />
              <h2 className="text-2xl font-bold text-white">Despachos Locales (Nariño / Pasto)</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Realizamos envíos locales en la región de Nariño y el municipio de Pasto con cobertura directa. Los pedidos confirmados antes de las 2:00 PM se despachan el mismo día, garantizando tiempos récord de entrega.
            </p>
          </section>

          <section className="bg-dark-surface border border-dark-border p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-6 h-6 text-volt" />
              <h2 className="text-2xl font-bold text-white">Despachos Nacionales</h2>
            </div>
            <p className="text-gray-400 leading-relaxed mb-4">
              Llegamos a toda Colombia a través de nuestras transportadoras aliadas: <strong>Interrapidísimo, Envía y Servientrega</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>El costo del envío nacional es asumido por el comprador en modalidad <strong>Contra Entrega</strong> (pagas el flete al recibir tu paquete).</li>
              <li>Generamos y enviamos la guía de rastreo oficial a tu WhatsApp.</li>
            </ul>
          </section>

          <section className="bg-dark-surface border border-dark-border p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-volt" />
              <h2 className="text-2xl font-bold text-white">Tiempos de Entrega y Seguimiento</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Los tiempos de entrega estándar a nivel nacional son de <strong>48 a 72 horas hábiles</strong>. Todo nuestro proceso de seguimiento es personalizado: una vez confirmada tu orden, te brindaremos soporte y rastreo paso a paso mediante nuestro canal oficial de WhatsApp.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
