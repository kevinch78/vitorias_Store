export type OrderStatus = 'PENDIENTE' | 'EN_PREPARACION' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';

export type ProductCategory = 
  | 'Geles Energéticos'
  | 'Hidratación y Electrolitos'
  | 'Bebidas Energéticas'
  | 'Packs y Rendimiento';

export interface Product {
  id: string;
  nombre: string;
  slug: string;
  categoria: ProductCategory;
  precio: number;
  precioAntes?: number;
  descripcion: string;
  imagenUrl: string;
  stock: number;
  badges: string[];
  beneficios?: string[];
  especificaciones?: Record<string, string>;
  modoUso?: string;
  activo?: boolean;
}

export interface CartItem extends Product {
  cantidad: number;
}

export interface OrderPayload {
  codigoPedido: string;
  nombre: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  notas: string;
  tipoEnvio: 'domicilio' | 'nacional';
  metodoPago: 'nequi' | 'bancolombia';
  items: CartItem[];
  subtotal: number;
  costoEnvio: number;
  total: number;
  fecha: string;
}

export interface Order extends OrderPayload {
  estado: OrderStatus;
}
