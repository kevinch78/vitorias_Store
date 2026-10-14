import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';
import { toast } from 'sonner';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product) => {
        // Validación estricta: asegurar que el id es un UUID del backend (y no un string como "1" o mock)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(product.id)) {
          toast.error('Producto inválido o desactualizado. Por favor, limpia tu caché.');
          console.error(`Invalid product ID (not UUID): ${product.id}`);
          return;
        }

        const { items } = get();
        const existingItem = items.find((i) => i.id === product.id);

        if (existingItem) {
          if (existingItem.cantidad >= product.stock) {
            toast.error('No hay más stock disponible');
            return;
          }
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, cantidad: i.cantidad + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, cantidad: 1 }] });
        }
        set({ isOpen: true });
        toast.success(`${product.nombre} añadido al carrito`);
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, cantidad) => {
        const { items } = get();
        const item = items.find((i) => i.id === id);
        if (item && cantidad > item.stock) {
          toast.error('Supera el stock disponible');
          return;
        }
        if (cantidad < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, cantidad } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: 'cart-storage',
      version: 1, // Bump para limpiar el localStorage viejo con mocks
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Si viene de la versión 0 (datos viejos), limpiar el carrito
          return { items: [] };
        }
        return persistedState;
      },
      partialize: (state) => ({ items: state.items }),
    }
  )
);
