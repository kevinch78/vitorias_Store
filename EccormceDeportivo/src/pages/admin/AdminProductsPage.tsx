import React, { useState, useEffect, useMemo } from 'react';
import type { Product } from '../../types';
import { 
  Plus, 
  Edit2, 
  Search, 
  X, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Boxes, 
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../services/productService';
import { Link } from 'react-router-dom';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODOS');
  const [stockFilter, setStockFilter] = useState<'TODOS' | 'BAJO' | 'AGOTADO'>('TODOS');
  const [isLoading, setIsLoading] = useState(false);

  const defaultFormState = {
    nombre: '',
    slug: '',
    categoria: 'Geles Energéticos' as Product['categoria'],
    precio: 0,
    precioAntes: 0,
    descripcion: '',
    stock: 0,
    badges: '',
    beneficios: '',
    modoUso: '',
    activo: true
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [specsList, setSpecsList] = useState<{key: string, value: string}[]>([]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getProducts();
      setProducts(data.data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormData(defaultFormState);
    setImageFile(null);
    setSpecsList([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      precioAntes: product.precioAntes || 0,
      badges: product.badges ? product.badges.join(', ') : '',
      beneficios: product.beneficios ? product.beneficios.join('\n') : '',
      modoUso: product.modoUso || '',
      activo: product.activo ?? true
    } as typeof defaultFormState);
    
    const parsedSpecs = product.especificaciones || {};
    setSpecsList(Object.entries(parsedSpecs).map(([k, v]) => ({ key: k, value: String(v) })));
    
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['precio', 'precioAntes', 'stock'].includes(name) ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formPayload = new FormData();
      formPayload.append('nombre', formData.nombre);
      formPayload.append('categoria', formData.categoria);
      formPayload.append('precio', formData.precio.toString());
      formPayload.append('descripcion', formData.descripcion);
      formPayload.append('stock', formData.stock.toString());
      
      const parsedBadges = formData.badges.split(',').map(b => b.trim()).filter(Boolean);
      formPayload.append('badges', JSON.stringify(parsedBadges));
      
      const parsedBeneficios = formData.beneficios.split('\n').map(b => b.trim()).filter(Boolean);
      formPayload.append('beneficios', JSON.stringify(parsedBeneficios));
      
      const specsObj = specsList.reduce((acc, curr) => {
        if (curr.key.trim() && curr.value.trim()) {
          acc[curr.key.trim()] = curr.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);
      formPayload.append('especificaciones', JSON.stringify(specsObj));
      
      formPayload.append('modoUso', formData.modoUso);
      formPayload.append('activo', String(formData.activo));

      if (formData.precioAntes > 0) {
        formPayload.append('precioAntes', formData.precioAntes.toString());
      }
      
      if (imageFile) {
        formPayload.append('imagen', imageFile);
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formPayload);
        toast.success('Producto actualizado exitosamente');
      } else {
        await productService.createProduct(formPayload);
        toast.success('Producto creado exitosamente');
      }
      
      fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar el producto');
      console.error(error);
    }
  };

  const toggleProductActive = async (id: string, activo: boolean) => {
    try {
      await productService.updateProduct(id, { activo: !activo });
      toast.success(activo ? 'Producto desactivado' : 'Producto activado');
      fetchProducts();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.activo).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const inventoryValuation = products.reduce((acc, p) => acc + (p.precio * p.stock), 0);

    return { total, active, lowStock, outOfStock, inventoryValuation };
  }, [products]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = categoryFilter === 'TODOS' || product.categoria === categoryFilter;
      
      const matchesStock = 
        stockFilter === 'TODOS' ? true :
        stockFilter === 'BAJO' ? (product.stock > 0 && product.stock <= 5) :
        product.stock === 0;

      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        product.nombre.toLowerCase().includes(term) ||
        (product.categoria && product.categoria.toLowerCase().includes(term)) ||
        (product.badges && product.badges.some(b => b.toLowerCase().includes(term)));

      return matchesCategory && matchesStock && matchesSearch;
    });
  }, [products, categoryFilter, stockFilter, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Total Catálogo */}
        <div className="bg-[#0B0E17] border border-white/5 hover:border-volt/30 rounded-2xl p-4 sm:p-5 transition-all group relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              Total Catálogo
            </span>
            <div className="p-2 rounded-xl bg-volt/10 text-volt border border-volt/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
            {metrics.total}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {metrics.active} activos en tienda
          </div>
        </div>

        {/* Valor de Inventario */}
        <div className="bg-[#0B0E17] border border-white/5 hover:border-white/20 rounded-2xl p-4 sm:p-5 transition-all group relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              Valor Inventario
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-gray-300 border border-white/10">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
            ${metrics.inventoryValuation.toLocaleString('es-CO')}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
            Valoración total en stock
          </div>
        </div>

        {/* Alerta Stock Bajo */}
        <div className="bg-[#0B0E17] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 transition-all group relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Stock Bajo (≤5)
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-amber-400 tracking-tight">
            {metrics.lowStock}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-400/80 font-mono">
            {metrics.lowStock > 0 ? '● Requiere reposición' : 'Existencias saludables'}
          </div>
        </div>

        {/* Agotados */}
        <div className="bg-[#0B0E17] border border-rose-500/20 hover:border-rose-500/40 rounded-2xl p-4 sm:p-5 transition-all group relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-400">
              Agotados (0)
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-rose-400 tracking-tight">
            {metrics.outOfStock}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-rose-400/80 font-mono">
            Sin existencias disponibles
          </div>
        </div>
      </div>

      {/* ── SEARCH, FILTER & NEW PRODUCT BUTTON ── */}
      <div className="bg-[#0B0E17] border border-white/5 rounded-2xl p-4 space-y-4">
        
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar producto por nombre o etiqueta..."
              className="w-full bg-[#121624] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-volt/60 focus:ring-1 focus:ring-volt/60 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              disabled={isLoading}
              title="Recargar inventario"
              className="p-2.5 bg-[#121624] border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-volt' : ''}`} />
            </button>

            <button 
              onClick={handleOpenNew}
              className="bg-volt hover:bg-volt-hover text-black font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> 
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Category & Stock Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
          {/* Categorías */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['TODOS', 'Geles Energéticos', 'Hidratación y Electrolitos', 'Bebidas Energéticas', 'Packs y Rendimiento'].map(cat => {
              const isSelected = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isSelected 
                      ? 'bg-volt text-black shadow-[0_0_12px_rgba(204,255,0,0.3)]' 
                      : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Filtro de Stock */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-gray-500 hidden sm:inline">Stock:</span>
            <button
              onClick={() => setStockFilter('TODOS')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                stockFilter === 'TODOS' ? 'bg-white/10 border-white/20 text-white' : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStockFilter('BAJO')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                stockFilter === 'BAJO' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'text-gray-500 border-transparent hover:text-amber-400'
              }`}
            >
              Bajo Stock (≤5)
            </button>
            <button
              onClick={() => setStockFilter('AGOTADO')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                stockFilter === 'AGOTADO' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'text-gray-500 border-transparent hover:text-rose-400'
              }`}
            >
              Agotados
            </button>
          </div>
        </div>
      </div>

      {/* ── PRODUCTS TABLE ── */}
      <div className="bg-[#0B0E17] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121624]/60 border-b border-white/5 text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-3 py-3 pl-4 sm:pl-5 w-14">Item</th>
                <th className="px-3 py-3">Producto / Detalles</th>
                <th className="px-3 py-3">Categoría</th>
                <th className="px-3 py-3">Precio COP</th>
                <th className="px-3 py-3">Stock</th>
                <th className="px-3 py-3 text-center">Estado</th>
                <th className="px-3 py-3 pr-4 sm:pr-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredProducts.map(product => {
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const isOutOfStock = product.stock === 0;

                return (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-white/[0.02] transition-colors group ${!product.activo ? 'opacity-60 bg-black/20' : ''}`}
                  >
                    {/* Img Thumbnail */}
                    <td className="px-3 py-3 pl-4 sm:pl-5">
                      <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center p-1 group-hover:border-volt/40 transition-colors">
                        <img 
                          src={product.imagenUrl} 
                          alt={product.nombre} 
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" 
                        />
                      </div>
                    </td>

                    {/* Producto */}
                    <td className="px-3 py-3">
                      <div className="max-w-[220px] md:max-w-[260px]">
                        <p className="font-bold text-white text-sm truncate group-hover:text-volt transition-colors">
                          {product.nombre}
                        </p>
                        
                        {/* Badges preview */}
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {product.badges && product.badges.slice(0, 2).map((badge, idx) => {
                            const clean = badge.replace(/^[<\[\s]+|[>\]\s]+$/g, '').trim();
                            if (!clean) return null;
                            const display = clean.toLowerCase().includes('sdas') ? 'DESTACADO' : clean;
                            return (
                              <span key={idx} className="text-[9px] font-mono font-bold uppercase bg-volt/10 text-volt border border-volt/20 px-1.5 py-0.2 rounded">
                                {display}
                              </span>
                            );
                          })}
                          {product.slug && (
                            <span className="text-[10px] text-gray-500 font-mono truncate max-w-[160px]">
                              /{product.slug}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="px-3 py-3">
                      <span className="text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                        {product.categoria}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="px-3 py-3">
                      <div className="font-mono whitespace-nowrap">
                        <p className="font-black text-sm text-volt">
                          ${product.precio.toLocaleString('es-CO')}
                        </p>
                        {product.precioAntes && product.precioAntes > product.precio && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-gray-500 line-through">
                              ${product.precioAntes.toLocaleString('es-CO')}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">
                              -{Math.round(((product.precioAntes - product.precio) / product.precioAntes) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                          isOutOfStock 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                            : isLowStock 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse' 
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {product.stock} und
                        </span>
                      </div>
                    </td>

                    {/* Estado Switch */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <button 
                        onClick={() => toggleProductActive(product.id, product.activo || false)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                          product.activo 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                            : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                        }`}
                      >
                        {product.activo ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Activo
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="px-3 py-3 pr-4 sm:pr-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Link a tienda */}
                        {product.slug && (
                          <Link
                            to={`/producto/${product.slug}`}
                            target="_blank"
                            title="Ver en la tienda"
                            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-gray-400 hover:text-white transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Botón Editar */}
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          title="Editar producto"
                          className="p-1.5 bg-white/5 hover:bg-volt/10 hover:text-volt border border-white/10 hover:border-volt/30 rounded-lg text-gray-400 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Package className="w-10 h-10 opacity-30 text-gray-400" />
                      <p className="font-bold text-sm text-gray-400 uppercase tracking-wider">
                        No se encontraron productos
                      </p>
                      <p className="text-xs text-gray-600 max-w-sm">
                        Prueba con otros términos de búsqueda o añade un nuevo producto al catálogo.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE / EDIT PRODUCT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0E17] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 bg-[#121624]/70 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-volt" />
                  {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editingProduct ? `ID: ${editingProduct.id}` : 'Completa la ficha técnica para publicar en la tienda'}
                </p>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Form */}
            <form 
              id="product-form" 
              onSubmit={handleSubmit} 
              className="p-6 overflow-y-auto space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full text-xs"
            >
              
              {/* Nombre y Visibilidad */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121624]/50 border border-white/5 p-4 rounded-2xl">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Nombre del Producto *
                  </label>
                  <input 
                    required 
                    type="text" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleInputChange} 
                    placeholder="Ej: Proteína Whey Isolate 100% Pura"
                    className="w-full bg-[#0B0E17] border border-white/10 rounded-xl px-4 py-2.5 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none text-sm font-semibold" 
                  />
                </div>
                
                <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-4">
                  <span className="text-xs font-semibold text-gray-400">¿Visible en tienda?</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, activo: !prev.activo }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      formData.activo ? 'bg-volt' : 'bg-gray-700'
                    }`}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                        formData.activo ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white'
                      }`} 
                    />
                  </button>
                </div>
              </div>
              
              {/* Categoría y Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Categoría *
                  </label>
                  <select 
                    required 
                    name="categoria" 
                    value={formData.categoria} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-2.5 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none font-semibold"
                  >
                    <option value="Geles Energéticos">Geles Energéticos</option>
                    <option value="Hidratación y Electrolitos">Hidratación y Electrolitos</option>
                    <option value="Bebidas Energéticas">Bebidas Energéticas</option>
                    <option value="Packs y Rendimiento">Packs y Rendimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Stock en Unidades *
                  </label>
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-2.5 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none font-mono" 
                  />
                </div>
              </div>

              {/* Precios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Precio Venta (COP) *
                  </label>
                  <input 
                    required 
                    type="number" 
                    min="0" 
                    name="precio" 
                    value={formData.precio} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-2.5 focus:border-volt focus:ring-1 focus:ring-volt text-volt font-black font-mono text-sm outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Precio Anterior / Tachado (Opcional)
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    name="precioAntes" 
                    value={formData.precioAntes} 
                    onChange={handleInputChange} 
                    className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-2.5 focus:border-volt focus:ring-1 focus:ring-volt text-gray-400 font-mono text-sm outline-none" 
                  />
                </div>
              </div>

              {/* Imagen */}
              <div className="bg-[#121624]/50 border border-white/5 p-4 rounded-2xl">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Imagen del Producto
                </label>
                <div className="flex items-center gap-4">
                  {editingProduct?.imagenUrl && !imageFile && (
                    <div className="w-16 h-16 shrink-0 bg-black/60 rounded-xl overflow-hidden border border-white/10 p-1 flex items-center justify-center">
                      <img src={editingProduct.imagenUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  {imageFile && (
                    <div className="w-16 h-16 shrink-0 bg-black/60 rounded-xl overflow-hidden border border-volt/60 p-1 flex items-center justify-center">
                      <img src={URL.createObjectURL(imageFile)} alt="New Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                      className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-volt/20 hover:file:text-volt cursor-pointer" 
                    />
                    {editingProduct && !imageFile && (
                      <p className="text-[11px] text-gray-500 mt-1">Selecciona un archivo si deseas reemplazar la imagen actual.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Badges / Etiquetas (Separadas por comas)
                </label>
                <input 
                  type="text" 
                  name="badges" 
                  value={formData.badges} 
                  onChange={handleInputChange} 
                  className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-2.5 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none" 
                  placeholder="Ej: ISOLATE, 0 AZÚCAR, TOP 1" 
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Descripción Corta *
                </label>
                <textarea 
                  required 
                  name="descripcion" 
                  value={formData.descripcion} 
                  onChange={handleInputChange} 
                  rows={2} 
                  className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-2.5 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none resize-none leading-relaxed" 
                />
              </div>

              {/* Beneficios */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Beneficios Clave (Un beneficio por línea)
                </label>
                <textarea 
                  name="beneficios" 
                  value={formData.beneficios} 
                  onChange={handleInputChange} 
                  rows={3} 
                  className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-2.5 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none resize-none leading-relaxed" 
                  placeholder="25g de proteína pura por porción&#10;Cero azúcar añadida&#10;Digestión ultrarrápida" 
                />
              </div>

              {/* Modo de Uso */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Modo de Uso
                </label>
                <textarea 
                  name="modoUso" 
                  value={formData.modoUso} 
                  onChange={handleInputChange} 
                  rows={2} 
                  className="w-full bg-[#121624] border border-white/10 rounded-xl px-4 py-2.5 focus:border-volt focus:ring-1 focus:ring-volt text-white outline-none resize-none" 
                  placeholder="Mezclar 1 scoop (30g) con 250ml de agua o leche de almendras después de entrenar." 
                />
              </div>

              {/* Especificaciones Técnicas Dinámicas */}
              <div className="bg-[#121624]/50 border border-white/5 p-4 rounded-2xl">
                <div className="flex justify-between items-center mb-2.5">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Especificaciones Técnicas (Specs)
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setSpecsList([...specsList, { key: '', value: '' }])} 
                    className="text-xs font-bold text-volt hover:underline flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Añadir Dato
                  </button>
                </div>
                {specsList.length === 0 && (
                  <p className="text-[11px] text-gray-500">No hay especificaciones añadidas.</p>
                )}
                <div className="space-y-2 mt-2">
                  {specsList.map((spec, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="Clave (Ej: Porciones)" 
                        value={spec.key} 
                        onChange={(e) => { 
                          const newSpecs = [...specsList]; 
                          newSpecs[idx].key = e.target.value; 
                          setSpecsList(newSpecs); 
                        }} 
                        className="w-1/3 bg-[#0B0E17] border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-volt text-white outline-none" 
                      />
                      <input 
                        type="text" 
                        placeholder="Valor (Ej: 30 servicios)" 
                        value={spec.value} 
                        onChange={(e) => { 
                          const newSpecs = [...specsList]; 
                          newSpecs[idx].value = e.target.value; 
                          setSpecsList(newSpecs); 
                        }} 
                        className="flex-1 bg-[#0B0E17] border border-white/10 rounded-xl px-3 py-2 text-xs focus:border-volt text-white outline-none" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setSpecsList(specsList.filter((_, i) => i !== idx))} 
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-white/5 bg-[#121624]/70 flex gap-3">
              <button 
                type="submit" 
                form="product-form"
                className="flex-1 bg-volt hover:bg-volt-hover text-black font-black uppercase tracking-wider text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.25)] transition-all active:scale-[0.99]"
              >
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold uppercase text-xs tracking-wider rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
