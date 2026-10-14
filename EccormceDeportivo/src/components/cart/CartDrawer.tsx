import React from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity } = useCartStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-dark-surface shadow-2xl border-l border-dark-border transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <h2 className="text-lg font-black uppercase tracking-wider text-white">
            Tu Equipo <span className="text-volt">({items.length})</span>
          </h2>
          <button 
            onClick={() => setCartOpen(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-dark-card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <div className="w-16 h-16 rounded-full border border-dark-border flex items-center justify-center">
                <X className="w-8 h-8 opacity-50" />
              </div>
              <p className="uppercase text-sm tracking-widest font-semibold">Carrito Vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-dark-base p-4 rounded-xl border border-dark-border">
                <img 
                  src={item.imagenUrl} 
                  alt={item.nombre} 
                  className="w-20 h-20 object-cover rounded-lg bg-dark-card"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold text-gray-200 line-clamp-2 leading-tight">
                      {item.nombre}
                    </h3>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {/* Controles cantidad */}
                    <div className="flex items-center gap-3 bg-dark-surface border border-dark-border rounded-md px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="text-gray-400 hover:text-volt transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white w-4 text-center">
                        {item.cantidad}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="text-gray-400 hover:text-volt transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-volt font-mono">
                      ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-dark-border bg-dark-card">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 font-semibold uppercase text-sm tracking-wide">Subtotal</span>
              <span className="text-xl font-bold text-white font-mono">
                ${subtotal.toLocaleString('es-CO')}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-volt hover:bg-volt-hover text-volt-contrast font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-all glow-hover"
            >
              Continuar al Checkout <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};
