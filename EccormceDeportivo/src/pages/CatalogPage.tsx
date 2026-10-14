import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton';
import { Navbar } from '../components/layout/Navbar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { 
  Search, 
  X, 
  ChevronDown, 
  SlidersHorizontal, 
  ShieldCheck, 
  MessageCircle, 
  Truck
} from 'lucide-react';
import { productService } from '../services/productService';
import type { Product, ProductCategory } from '../types';
import logoImg from '../assets/img/logoSinFondo.png';

const SLUG_TO_CATEGORY: Record<string, ProductCategory> = {
  'geles-energeticos': 'Geles Energéticos',
  'hidratacion-electrolitos': 'Hidratación y Electrolitos',
  'bebidas-energeticas': 'Bebidas Energéticas',
  'packs-rendimiento': 'Packs y Rendimiento',
};

const CATEGORY_TO_SLUG: Record<string, string> = {
  'Geles Energéticos': 'geles-energeticos',
  'Hidratación y Electrolitos': 'hidratacion-electrolitos',
  'Bebidas Energéticas': 'bebidas-energeticas',
  'Packs y Rendimiento': 'packs-rendimiento',
};



export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('categoria');

  const [isLoading, setIsLoading] = useState(true);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  // Resolver categoría inicial desde param
  const initialCategory = useMemo(() => {
    if (!categoryParam) return 'Todos';
    const normalized = categoryParam.toLowerCase();
    if (SLUG_TO_CATEGORY[normalized]) return SLUG_TO_CATEGORY[normalized];
    return categoryParam;
  }, [categoryParam]);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<'recientes' | 'precio-asc' | 'precio-desc'>('recientes');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    productService.getProducts().then((res) => {
      setActiveProducts(res.data.filter((p: any) => p.activo !== false));
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (categoryParam) {
      const normalized = categoryParam.toLowerCase();
      const resolved = SLUG_TO_CATEGORY[normalized] || categoryParam;
      setSelectedCategory(resolved);
      setTimeout(() => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      setSelectedCategory('Todos');
    }
  }, [categoryParam]);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'Todos') {
      setSearchParams({});
    } else {
      const slug = CATEGORY_TO_SLUG[cat] || cat;
      setSearchParams({ categoria: slug });
    }
  };

  const categories = [
    'Todos', 
    'Geles Energéticos', 
    'Hidratación y Electrolitos', 
    'Bebidas Energéticas', 
    'Packs y Rendimiento'
  ];

  // Catálogo alimentado 100% de la base de datos PostgreSQL
  const allCatalogProducts = activeProducts;

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allCatalogProducts];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.nombre.toLowerCase().includes(lowerSearch) || 
        p.descripcion.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedCategory !== 'Todos') {
      result = result.filter(p => p.categoria === selectedCategory);
    }

    switch (sortBy) {
      case 'precio-asc':
        result.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        result.sort((a, b) => b.precio - a.precio);
        break;
      case 'recientes':
      default:
        result.sort((a, b) => String(b.id).localeCompare(String(a.id)));
        break;
    }

    return result;
  }, [allCatalogProducts, searchTerm, selectedCategory, sortBy]);

  // Contadores por categoría
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: allCatalogProducts.length,
      'Geles Energéticos': allCatalogProducts.filter(p => p.categoria === 'Geles Energéticos').length,
      'Hidratación y Electrolitos': allCatalogProducts.filter(p => p.categoria === 'Hidratación y Electrolitos').length,
      'Bebidas Energéticas': allCatalogProducts.filter(p => p.categoria === 'Bebidas Energéticas').length,
      'Packs y Rendimiento': allCatalogProducts.filter(p => p.categoria === 'Packs y Rendimiento').length,
    };
    return counts;
  }, [allCatalogProducts]);

  return (
    <div className="min-h-screen bg-dark-base bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] flex flex-col">
      <Navbar />

      {/* ── HEADER BANNER ── */}
      <section className="relative py-8 sm:py-12 md:py-16 border-b border-dark-border overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-volt/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-[400px] h-[200px] bg-volt/[0.02] rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#ccff00_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-volt/10 border border-volt/25 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-volt animate-ping" />
                <span className="text-volt font-mono font-black text-[11px] tracking-widest uppercase">
                  Catálogo Oficial Endurance // SiS
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">
                Nutrición de <br />
                <span className="text-volt drop-shadow-[0_0_30px_rgba(204,255,0,0.4)]">Alto Rendimiento</span>
              </h1>
              <p className="text-gray-400 mt-3 text-xs sm:text-sm md:text-base font-medium max-w-xl leading-relaxed">
                Geles isotónicos, electrolitos científicos y bebidas energéticas formuladas para romper tus marcas personales en ciclismo, running y triatlón.
              </p>
            </div>

            {/* Micro métricas de catálogo */}
            <div className="flex items-center gap-4 sm:gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
              <div className="text-left">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white block leading-none">
                  {allCatalogProducts.length}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-mono tracking-wider mt-1 block">
                  Productos Élite
                </span>
              </div>
              <div className="h-8 w-px bg-dark-border" />
              <div className="text-left">
                <span className="text-2xl sm:text-3xl font-black font-mono text-volt block leading-none">
                  100%
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-mono tracking-wider mt-1 block">
                  Informed Sport
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL: FILTROS + GRID ── */}
      <main ref={catalogRef} className="flex-grow max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 w-full relative z-10">

        {/* ── BARRA DE BÚSQUEDA Y ORDENAMIENTO (COMPACTA EN MÓVIL) ── */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar geles, electrolitos, SiS Beta Fuel..."
              className="w-full bg-[#0D111A]/90 border border-white/10 hover:border-white/20 focus:border-volt/80 rounded-xl pl-9 sm:pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-volt/80 transition-all font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* Selector de ordenamiento adaptativo */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 sm:gap-2 bg-[#0D111A]/90 border border-white/10 hover:border-volt/50 text-gray-300 hover:text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              aria-label="Ordenar productos"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-volt" />
              <span className="hidden sm:inline">
                {sortBy === 'recientes' ? 'Novedades' : sortBy === 'precio-asc' ? 'Menor Precio' : 'Mayor Precio'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSortOpen ? 'rotate-180 text-volt' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0D111A] border border-white/15 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-1.5 z-30 backdrop-blur-xl">
                {[
                  { id: 'recientes', label: 'Más Recientes' },
                  { id: 'precio-asc', label: 'Precio: Menor a Mayor' },
                  { id: 'precio-desc', label: 'Precio: Mayor a Menor' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSortBy(opt.id as any);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      sortBy === opt.id ? 'text-volt bg-volt/10 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── PILLS DE CATEGORÍAS (SCROLL HORIZONTAL OPTIMIZADO) ── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 pb-3 mb-6 sm:mb-8">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] ?? 0;

            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`relative shrink-0 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border select-none ${
                  isSelected
                    ? 'bg-volt text-dark-base border-volt shadow-[0_0_20px_rgba(204,255,0,0.35)] scale-[1.02]'
                    : 'bg-[#0D111A]/80 text-gray-400 hover:text-white border-white/5 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                    isSelected
                      ? 'bg-dark-base text-volt'
                      : 'bg-white/5 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── RESULTADOS Y CONTEO ── */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-[11px] sm:text-xs text-gray-500 font-mono uppercase tracking-wider">
            Mostrando <span className="text-white font-bold">{filteredAndSortedProducts.length}</span> {filteredAndSortedProducts.length === 1 ? 'producto' : 'productos'}
            {selectedCategory !== 'Todos' && (
              <> en <span className="text-volt font-bold">{selectedCategory}</span></>
            )}
          </p>
          {selectedCategory !== 'Todos' && (
            <button
              onClick={() => handleCategoryClick('Todos')}
              className="text-[11px] text-gray-400 hover:text-volt font-mono uppercase underline tracking-wider transition-colors"
            >
              Ver todo el catálogo
            </button>
          )}
        </div>

        {/* ── PRODUCT GRID (2 COLUMNAS EN MÓVIL, 3 EN TABLET, 4 EN DESKTOP) ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {filteredAndSortedProducts.map((product, idx) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={idx}
              />
            ))}
          </div>
        ) : (
          /* Estado vacío */
          <div className="bg-[#0D111A]/60 border border-white/5 rounded-3xl p-10 sm:p-16 text-center my-6">
            <div className="w-16 h-16 rounded-2xl bg-volt/10 border border-volt/20 flex items-center justify-center mx-auto mb-4 text-volt">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
              No hay coincidencias para "{searchTerm}" en la categoría {selectedCategory}. Prueba buscando otro término o restablece los filtros.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                handleCategoryClick('Todos');
              }}
              className="bg-volt hover:bg-volt-hover text-dark-base font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)]"
            >
              Restablecer Filtros
            </button>
          </div>
        )}

        {/* ── BANNER ASESORÍA DEPORTIVA ── */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-r from-[#0D111A] via-[#121624] to-[#0D111A] border border-volt/20 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-volt/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="text-volt font-mono font-black text-[11px] tracking-widest uppercase block mb-1.5">
                ● ASESORÍA NUTRICIONAL DE CARRERA
              </span>
              <h4 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-white tracking-tight">
                ¿Planeando tu maratón o fondo en bicicleta?
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-xl">
                Nuestros especialistas calculan tus gramos de carbohidratos por hora según tu ritmo objetivo, desnivel y peso.
              </p>
            </div>
            <a
              href="https://wa.me/573000000000?text=Hola,%20quisiera%20asesoría%20sobre%20mi%20estrategia%20nutricional%20con%20SiS."
              target="_blank"
              rel="noreferrer"
              className="bg-volt hover:bg-volt-hover text-dark-base font-black text-xs uppercase tracking-widest px-7 py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all shrink-0 hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hablar con un Asesor</span>
            </a>
          </div>
        </div>
      </main>

      {/* ── FOOTER TRUST ── */}
      <footer className="border-t border-dark-border py-8 mt-12 bg-dark-base/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-mono">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Victoria" className="h-6 w-auto object-contain opacity-70" />
            <span>© {new Date().getFullYear()} Victoria Sports Nutrition // Endurance Division</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-volt" /> Despacho Colombia</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-volt" /> 100% Original SiS</span>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
};
