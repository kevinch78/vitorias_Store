import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { ShieldCheck, PackageX } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-base flex flex-col text-gray-200">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-8">Términos y Condiciones</h1>
        
        <div className="space-y-12">
          <section className="bg-dark-surface border border-dark-border p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-volt" />
              <h2 className="text-2xl font-bold text-white">Políticas de Garantía</h2>
            </div>
            <p className="text-gray-400 leading-relaxed mb-4">
              En Victoria nos comprometemos a ofrecer suplementos 100% originales. Sin embargo, por razones de bioseguridad y salubridad:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>Solo se aceptan devoluciones si los <strong>sellos de seguridad están intactos</strong>.</li>
              <li>No se aceptan cambios si el envase fue abierto o el producto consumido parcialmente.</li>
              <li>Cuentas con un plazo de 3 días calendario posteriores a la entrega para reportar cualquier irregularidad de fábrica.</li>
            </ul>
          </section>

          <section className="bg-dark-surface border border-dark-border p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <PackageX className="w-6 h-6 text-volt" />
              <h2 className="text-2xl font-bold text-white">Averías en Transporte</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Si tu producto llega con derrames, roturas graves o daños causados por el manejo de la transportadora, por favor realiza el <strong>reporte inmediato a nuestro WhatsApp</strong> el mismo día que lo recibes, adjuntando fotografías legibles de la caja, la guía y el producto afectado. Nuestro equipo de soporte gestionará la reposición o solución del caso.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};
