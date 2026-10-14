import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  return (
    <div 
      onClick={() => navigate(`/producto/${product.slug}`)}
      className="group relative bg-[#0D111A]/90 border border-white/10 hover:border-volt/70 hover:shadow-[0_0_30px_rgba(204,255,0,0.12)] transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full hover:-translate-y-1"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Contenedor de imagen */}
      <div className="relative h-44 sm:h-52 md:h-64 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden">
        {/* Badges superiores flotantes */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10 pointer-events-none max-w-[85%]">
          {product.badges && product.badges.map((badge, idx) => {
            const cleanBadge = badge.replace(/^[<\[\s]+|[>\]\s]+$/g, '').trim();
            if (!cleanBadge) return null;
            const displayBadge = cleanBadge.toLowerCase().includes('sdas') || cleanBadge.toLowerCase().includes('test')
              ? 'DESTACADO'
              : cleanBadge;
            return (
              <span
                key={idx}
                className={`bg-volt text-dark-base font-black text-[8px] sm:text-[9px] md:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded tracking-wider uppercase shadow-[0_0_12px_rgba(204,255,0,0.5)] items-center gap-1 font-mono truncate ${
                  idx > 0 ? 'hidden sm:inline-flex' : 'inline-flex'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-dark-base shrink-0 animate-pulse" />
                <span className="truncate">{displayBadge}</span>
              </span>
            );
          })}
        </div>
        
        {/* Imagen */}
        <img
          src={product.imagenUrl}
          alt={product.nombre}
          className="w-full h-full object-contain max-h-full max-w-full drop-shadow-2xl group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3 relative z-10 flex flex-col flex-1 bg-gradient-to-t from-dark-base to-transparent">
        <div className="flex-1">
          <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            {product.categoria}
          </span>
          <h3 className="text-xs sm:text-sm md:text-base text-gray-100 font-bold leading-snug mt-0.5 group-hover:text-white transition-colors line-clamp-2">
            {product.nombre}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-white/5 gap-1.5">
          <div className="flex flex-col min-w-0">
            {product.precioAntes && (
              <span className="text-[10px] sm:text-xs text-gray-500 line-through font-mono leading-none">
                ${product.precioAntes.toLocaleString('es-CO')}
              </span>
            )}
            <span className="text-sm sm:text-base md:text-xl font-black text-white font-mono leading-none mt-0.5 truncate">
              ${product.precio.toLocaleString('es-CO')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-volt hover:bg-volt-hover text-dark-base font-black text-[10px] md:text-xs p-2 sm:px-3 sm:py-2 md:px-4 md:py-2.5 rounded-lg sm:rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.15)] transition-all active:scale-95 shrink-0"
            aria-label="Añadir al carrito"
            title="Añadir al carrito"
          >
            <span className="hidden sm:inline">Agregar</span>
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

