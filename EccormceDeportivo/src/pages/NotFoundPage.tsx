import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center justify-center p-4 text-center">
      <div className="relative">
        <h1 className="text-8xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 leading-none">
          404
        </h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-volt opacity-10 blur-[100px] pointer-events-none" />
      </div>
      
      <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-widest mt-4">
        ZONA FUERA DE RUTA
      </h2>
      
      <p className="text-gray-400 mt-4 max-w-md font-medium mb-10">
        El enlace que intentas abrir no existe o ha sido movido. Mantente hidratado y regresa al área de entrenamiento.
      </p>

      <button 
        onClick={() => navigate('/')}
        className="bg-volt hover:bg-volt-hover text-volt-contrast font-black uppercase tracking-wider py-4 px-8 rounded-xl transition-all glow-hover flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" /> Regresar al Catálogo
      </button>
    </div>
  );
};
