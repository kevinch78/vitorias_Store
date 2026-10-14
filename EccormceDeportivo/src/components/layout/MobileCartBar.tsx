import React from 'react';
import { useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';

export const MobileCartBar: React.FC = () => {
  const { items, toggleCart } = useCartStore();
  const location = useLocation();

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const totalValue = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // No mostrar en el admin, ni en checkout, ni si el carrito está vacío
  if (totalItems === 0 || location.pathname.startsWith('/admin') || location.pathname === '/checkout' || location.pathname === '/pedido-confirmado') {
    return null;
  }

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-surface/90 backdrop-blur-lg border-t border-white/10 p-2.5 pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{totalItems} Ítems</span>
          <span className="text-lg font-black text-white font-mono leading-none mt-1">${totalValue.toLocaleString('es-CO')}</span>
        </div>
        <button 
          onClick={toggleCart}
          className="flex-1 bg-volt hover:bg-volt-hover text-volt-contrast font-black uppercase text-xs tracking-wider py-2.5 px-4 rounded-xl transition-all glow-hover text-center"
        >
          Ver Carrito
        </button>
      </div>
    </div>
  );
};
