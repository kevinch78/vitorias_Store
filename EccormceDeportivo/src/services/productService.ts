import { api } from './api';
import type { Product } from '../types';
import { getImageUrl } from '../utils/image';

const mapProduct = (data: any): Product => ({
  ...data,
  categoria: data.categoria?.nombre || data.categoria,
  imagenUrl: getImageUrl(data.imagen),
});

export const productService = {
  getProducts: async (params?: { search?: string; categoriaSlug?: string; orden?: string; limit?: number; page?: number }) => {
    const { data } = await api.get('/productos', { params });
    return { ...data, data: data.data.map(mapProduct) };
  },
  getProductBySlug: async (slug: string) => {
    const { data } = await api.get(`/productos/${slug}`);
    return mapProduct(data);
  },
  createProduct: async (formData: FormData) => {
    const { data } = await api.post('/admin/productos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapProduct(data);
  },
  updateProduct: async (id: string, updateData: Partial<Product> | FormData) => {
    const headers = updateData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const { data } = await api.patch(`/admin/productos/${id}`, updateData, { headers });
    return mapProduct(data);
  },
  deleteProduct: async (id: string) => {
    const { data } = await api.delete(`/admin/productos/${id}`);
    return data;
  },
};
