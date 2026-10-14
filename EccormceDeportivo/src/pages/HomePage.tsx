import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton';
import { Navbar } from '../components/layout/Navbar';
import { CartDrawer } from '../components/cart/CartDrawer';
import { Zap, ShieldCheck, Award, Plus, MessageCircle, ArrowRight } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../types';
import logoImg from '../assets/img/logoSinFondo.png';

export const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getProducts();
        setActiveProducts(response.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);



  const featuredProducts = useMemo(() => {
    return activeProducts.slice(0, 4);
  }, [activeProducts]);

  const faqs = [
    {
      q: '¿Cómo funciona el despacho en Pasto y envíos nacionales?',
      a: 'Para Pasto ofrecemos despacho prioritario el mismo día (compras antes de las 2 PM) y envío gratuito por pedidos mayores a $150.000 COP. A nivel nacional despachamos en menos de 24 horas con número de guía en tiempo real.'
    },
    {
      q: '¿Es seguro pagar con Nequi o Transferencia?',
      a: '100% seguro y directo. Al finalizar tu pedido en la web, se genera tu resumen oficial y te redirige a nuestro canal de WhatsApp. Allí compartes el comprobante y confirmamos el despacho en minutos.'
    },
    {
      q: '¿Tienen garantía de originalidad y registro INVIMA?',
      a: 'Garantía total. Todos nuestros suplementos son 100% legítimos, cuentan con registro sanitario INVIMA, sellos de fábrica de seguridad y fechas de vencimiento garantizadas.'
    },
    {
      q: '¿Cómo puedo recibir asesoría personalizada para mi objetivo?',
      a: 'Solo haz clic en el botón de Chat con el Coach. Te asesoramos completamente gratis evaluando tu disciplina, peso y meta para recomendarte el combo óptimo.'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-base bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] flex flex-col">
      <Navbar />
      <CartDrawer />

      {/* Hero Section — Replica exacta del diseño */}
      <div className="relative overflow-hidden border-b border-white/10 bg-dark-base min-h-[560px] md:min-h-[640px] flex items-center">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:28px_28px]" />
        {/* Glow ambiental verde arriba-derecha (imagen) */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-volt opacity-[0.07] rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        {/* Glow izquierdo — le da profundidad atmosférica al copy */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-volt opacity-[0.04] rounded-full blur-[100px] pointer-events-none -translate-x-1/2 translate-y-1/3" />
        {/* Acento vertical izquierdo — borde de luz sutil */}
        <div className="absolute left-0 inset-y-0 w-[2px] bg-gradient-to-b from-transparent via-volt/30 to-transparent pointer-events-none" />
        {/* Línea de luz diagonal decorativa en zona izquierda */}
        <div className="absolute left-[8%] top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent rotate-6 pointer-events-none" />


        <div className="w-full relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">

              {/* COLUMNA IZQUIERDA: Copy */}
              <div className="order-2 lg:order-1 py-16 md:py-24 text-center lg:text-left z-20 relative">

                {/* Badge "Stock Renovable" — diseño premium con acento lateral */}
                <div className="inline-flex items-center gap-0 mb-7">
                  <div className="flex items-center gap-3 px-4 py-2 bg-dark-surface/80 border border-white/10 backdrop-blur-sm rounded-full relative overflow-hidden">
                    {/* Acento izquierdo verde */}
                    <span className="absolute left-0 inset-y-0 w-1 bg-volt rounded-l-full shadow-[0_0_8px_#ccff00]" />
                    <span className="w-2 h-2 rounded-full bg-volt shadow-[0_0_10px_2px_#ccff00] animate-pulse ml-1" />
                    <span className="text-[10px] font-black text-gray-200 tracking-[0.25em] uppercase">Stock Renovable Semanal</span>
                  </div>
                </div>

                <h1 className="font-black italic uppercase leading-[0.88] tracking-[-0.02em] mb-6">
                  <span className="block text-white text-[clamp(3rem,7vw,5.8rem)]">Lleva tu</span>
                  <span className="block text-white text-[clamp(3rem,7vw,5.8rem)]">cuerpo al</span>
                  <span className="block text-volt text-[clamp(3rem,7.2vw,6rem)] drop-shadow-[0_0_25px_rgba(204,255,0,0.45)]">Siguiente Nivel</span>
                </h1>

                <p className="text-gray-400 text-base md:text-lg font-medium max-w-[420px] mb-9 mx-auto lg:mx-0 leading-relaxed">
                  Suplementación deportiva de élite para atletas que no conocen los límites. Calidad premium, resultados reales.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-6">
                  <Link to="/catalogo" className="w-full sm:w-auto bg-volt hover:bg-volt-hover text-dark-base px-8 py-4 rounded-xl font-black tracking-[0.08em] uppercase text-sm flex items-center justify-center gap-2.5 transition-all hover:scale-[1.03] shadow-[0_0_35px_rgba(204,255,0,0.28)]">
                    Explorar Catálogo <ArrowRight className="w-4 h-4" />
                  </Link>
                  <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className="text-xl">⭐</span>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-black text-white leading-none tracking-tight">4.9/5</span>
                      <span className="text-[11px] text-gray-400 font-semibold leading-none mt-1 tracking-wide">+1.200 Atletas en Colombia</span>
                    </div>
                  </div>
                </div>

                {/* BADGE "Despacho Hoy" — ahora en la columna izquierda, debajo de los botones */}
                <div className="flex justify-center lg:justify-start">
                  <div className="inline-flex items-center gap-3.5 bg-dark-surface/70 backdrop-blur-xl border border-white/10 border-l-2 border-l-volt px-5 py-3.5 rounded-xl shadow-lg">
                    <div className="w-9 h-9 rounded-lg bg-volt/10 border border-volt/20 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-volt" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-white font-black text-sm leading-none tracking-tight">Despacho Hoy</span>
                      <span className="text-gray-400 text-[10px] uppercase tracking-[0.18em] font-bold mt-1.5">Pedidos antes de 2 PM</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* COLUMNA DERECHA: Frame inclinado tipo paralelo grama */}
              <div className="order-1 lg:order-2 relative h-[340px] sm:h-[460px] lg:h-[640px] overflow-visible">
                <div className="absolute inset-0">

                  {/* PANEL PRINCIPAL skewed — borde verde neón */}
                  <div className="absolute inset-y-0 left-[6%] right-[-2rem] lg:right-[-4rem] xl:right-[-6rem] overflow-hidden"
                    style={{ transform: 'skewX(-12deg)' }}>
                    {/* Borde volt exterior */}
                    <div className="absolute inset-0 bg-gradient-to-r from-volt/70 via-volt/90 to-volt/50 shadow-[0_0_60px_rgba(204,255,0,0.25)]" />
                    {/* Imagen + efectos (des-skewed) */}
                    <div className="absolute inset-[2px] overflow-hidden bg-dark-base">
                      <img
                        src="https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=85"
                        alt="Atleta preparando suplementos Victoria"
                        className="absolute inset-0 h-full object-cover object-center"
                        style={{ width: '130%', transform: 'skewX(12deg) translateX(-12%)', opacity: 0.9 }}
                      />
                      {/* Tinte verde cinematográfico */}
                      <div className="absolute inset-0 bg-green-500/10 mix-blend-color" />
                      {/* Fade izquierda para fusión */}
                      <div className="absolute inset-0 bg-gradient-to-r from-dark-base/85 via-dark-base/20 to-transparent" />
                      {/* Fade abajo */}
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-base/50 via-transparent to-transparent" />
                    </div>
                  </div>

                  {/* STRIPE NEÓN 1 — línea verde brillante izquierda del panel */}
                  <div className="absolute inset-y-0 z-20 pointer-events-none"
                    style={{ left: '4%', width: '8px', transform: 'skewX(-12deg)', background: 'linear-gradient(to bottom, transparent 5%, #ccff00 25%, #ccff00 75%, transparent 95%)', boxShadow: '0 0 20px 6px rgba(204,255,0,0.7)', opacity: 0.9 }} />
                  {/* STRIPE NEÓN 2 — línea verde más delgada, segunda */}
                  <div className="absolute inset-y-0 z-20 pointer-events-none"
                    style={{ left: '9.5%', width: '4px', transform: 'skewX(-12deg)', background: 'linear-gradient(to bottom, transparent 5%, #ccff00 25%, #ccff00 75%, transparent 95%)', boxShadow: '0 0 12px 3px rgba(204,255,0,0.5)', opacity: 0.6 }} />

                  {/* PANEL OSCURO SUPERPUESTO — lado izquierdo (sombra del frame) */}
                  <div className="absolute inset-y-0 left-0 w-[7%] bg-dark-base z-10"
                    style={{ transform: 'skewX(-12deg)', transformOrigin: 'bottom left' }} />

                  {/* GLOWING V LOGO — esquina inferior derecha como en el diseño de referencia */}
                  <img
                    src={logoImg}
                    alt="Victoria"
                    aria-hidden="true"
                    className="absolute right-4 bottom-4 lg:right-10 lg:bottom-8 pointer-events-none z-30 select-none drop-shadow-[0_0_35px_rgba(204,255,0,0.7)]"
                    style={{ width: 'clamp(100px, 14vw, 160px)', height: 'clamp(100px, 14vw, 160px)', objectFit: 'contain', opacity: 0.95 }}
                  />

                  {/* Badge Despacho Hoy ELIMINADO de aquí — movido a columna izquierda */}

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>


      <main className="flex-grow w-full relative z-10">

        {/* ══ SECCIÓN 01: DESTACADOS DEL MES ══ */}
        <div className="relative py-16 md:py-24 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-volt/[0.03] rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Header de sección */}
            <div className="flex justify-between items-end mb-12 md:mb-16">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-volt font-mono font-black text-sm tracking-[0.2em]">01 //</span>
                  <span className="h-[1px] w-12 bg-volt/50" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
                  Destacados<br />
                  <span className="text-volt">del Mes</span>
                </h2>
                <p className="text-gray-500 mt-3 text-sm font-semibold tracking-wide">Selección de élite para resultados comprobados.</p>
              </div>
              <Link
                to="/catalogo"
                className="hidden md:flex items-center gap-2 text-gray-400 hover:text-volt font-bold tracking-wider uppercase text-xs transition-all group border border-dark-border hover:border-volt/30 px-5 py-3 rounded-xl hover:bg-volt/5"
              >
                Ver Todo <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Grid de productos */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center bg-dark-surface border border-dark-border rounded-2xl">
                <span className="text-5xl mb-4">🏋️‍♂️</span>
                <h3 className="text-xl font-bold text-white mb-2">Sin productos en inventario</h3>
                <p className="text-gray-500">Regresa pronto para ver nuestras novedades.</p>
              </div>
            )}

            <div className="mt-8 md:hidden">
              <Link to="/catalogo" className="w-full flex items-center justify-center gap-2 py-4 border border-volt/30 text-volt hover:bg-volt hover:text-dark-base rounded-xl font-black uppercase tracking-widest transition-all text-sm">
                Explorar Todo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ══ SECCIÓN 02: ELIGE TU OBJETIVO ══ */}
        <div className="relative overflow-hidden border-y border-white/5 bg-dark-surface/40 py-20 md:py-28">
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#ccff00_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-volt/[0.05] blur-[90px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-14 md:mb-18">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="h-[1px] w-10 bg-volt/50" />
                <span className="text-volt font-mono font-black text-xs md:text-sm tracking-[0.25em] uppercase">02 // NUTRICIÓN ENDURANCE</span>
                <span className="h-[1px] w-10 bg-volt/50" />
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
                Líneas de <span className="text-volt drop-shadow-[0_0_25px_rgba(204,255,0,0.35)]">Rendimiento SiS</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base font-medium leading-relaxed">
                Selecciona tu disciplina y descubre la nutrición científica diseñada para mantener el glucógeno y romper tus marcas en fondo y competición.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {[
                { 
                  num: '01', 
                  tag: 'FAST ENERGY', 
                  title: 'Geles\nEnergéticos', 
                  subtitle: 'SiS GO Isotonic · Beta Fuel · Nootrópicos',
                  img: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                  categoria: 'geles-energeticos'
                },
                { 
                  num: '02', 
                  tag: 'HYDRATION', 
                  title: 'Hidratación\n& Sales', 
                  subtitle: 'Hydro Pastillas · Sobres · Cero Calambres',
                  img: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                  categoria: 'hidratacion-electrolitos'
                },
                { 
                  num: '03', 
                  tag: 'ENDURANCE', 
                  title: 'Bebidas\nEnergéticas', 
                  subtitle: 'GO Electrolyte 1.6kg & 500g · Glucógeno Continuo',
                  img: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                  categoria: 'bebidas-energeticas'
                },
                { 
                  num: '04', 
                  tag: 'RACE PACKS', 
                  title: 'Packs &\nRendimiento', 
                  subtitle: 'Kits Endurance Pro · Beta Fuel 42K · Ahorro',
                  img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
                  categoria: 'packs-rendimiento'
                },
              ].map(({ num, tag, title, subtitle, img, categoria }) => (
                <Link
                  key={tag}
                  to={`/catalogo?categoria=${categoria}`}
                  className="group relative h-[380px] md:h-[420px] overflow-hidden cursor-pointer rounded-2xl border border-white/10 hover:border-volt/80 transition-all duration-500 shadow-2xl hover:shadow-[0_0_35px_rgba(204,255,0,0.2)] flex flex-col justify-end p-6"
                >
                  {/* Imagen de fondo con zoom fluido */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    style={{ backgroundImage: `url('${img}')` }}
                  />
                  {/* Gradientes oscuros de alto contraste */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-base via-dark-base/75 to-dark-base/20 group-hover:via-dark-base/65 transition-colors duration-500" />
                  
                  {/* Acento vertical neón al hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-volt opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_15px_#ccff00]" />

                  {/* Contenido */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-volt font-mono font-black tracking-[0.25em] text-[11px] uppercase">{num} // {tag}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase leading-[0.95] mb-2 whitespace-pre-line group-hover:text-volt transition-colors duration-300">
                      {title}
                    </h3>

                    <p className="text-gray-400 text-xs font-semibold mb-5 tracking-wide line-clamp-2">
                      {subtitle}
                    </p>

                    <div className="flex items-center justify-between pt-3.5 border-t border-white/10">
                      <span className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-volt flex items-center gap-1.5 transition-colors">
                        Explorar <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 group-hover:border-volt/40 group-hover:bg-volt group-hover:text-dark-base flex items-center justify-center transition-all text-gray-400">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ══ SECCIÓN 03: ASESORÍA COACH VIP ══ */}
        <div className="relative overflow-hidden py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-volt/30 bg-gradient-to-br from-[#121824] via-dark-surface to-[#0B0F17] shadow-[0_0_60px_rgba(204,255,0,0.12)] p-8 md:p-14">
              
              {/* Elementos lumínicos de fondo */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-volt/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-volt/5 rounded-full blur-[90px] pointer-events-none" />
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ccff00_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                
                <div className="text-center lg:text-left max-w-xl">
                  {/* Badge en vivo */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-volt/10 border border-volt/30 mb-6">
                    <span className="w-2 h-2 rounded-full bg-volt animate-ping" />
                    <span className="text-volt font-mono font-black text-[11px] tracking-widest uppercase">03 // ASESORÍA EXPERTA 1 A 1</span>
                  </div>

                  <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.95] mb-5">
                    ¿No sabes cuál es el <br className="hidden sm:block" />
                    <span className="text-volt drop-shadow-[0_0_20px_rgba(204,255,0,0.4)]">suplemento ideal</span> para ti?
                  </h3>

                  <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6 font-medium">
                    Habla directamente con nuestro Coach deportivo en WhatsApp. Analizamos tu nivel, objetivos y peso para recomendarte el combo con mejores resultados comprobados sin gastar de más.
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-gray-300">
                    <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                      <Zap className="w-3.5 h-3.5 text-volt" /> Respuesta en &lt; 15 min
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-volt" /> 100% Personalizado
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-3.5 h-3.5 text-volt" /> Sin costo alguno
                    </span>
                  </div>
                </div>

                {/* Columna Botón y Social Proof */}
                <div className="flex flex-col items-center shrink-0 w-full lg:w-auto">
                  <a
                    href="https://wa.me/573000000000?text=Hola,%20quisiera%20asesoría%20personalizada%20con%20mi%20suplementación%20deportiva."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto group flex items-center justify-center gap-3.5 bg-volt text-dark-base px-9 py-5 rounded-2xl font-black uppercase tracking-[0.1em] text-sm md:text-base hover:bg-volt-hover transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(204,255,0,0.4)] active:scale-95"
                  >
                    <MessageCircle className="w-6 h-6 text-dark-base group-hover:scale-110 transition-transform" />
                    Chatear con el Coach
                  </a>
                  <span className="text-gray-500 text-[11px] font-bold tracking-widest uppercase mt-3">
                    Canal Oficial de WhatsApp
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>

      </main>

      {/* ══ SECCIÓN 04: TRUST & GARANTÍAS ══ */}
      <section className="relative border-t border-white/5 bg-dark-surface/50 overflow-hidden py-18">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ccff00_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="group p-8 rounded-2xl bg-dark-card/70 border border-white/5 hover:border-volt/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(204,255,0,0.08)]">
              <div className="w-13 h-13 rounded-xl bg-volt/10 border border-volt/20 flex items-center justify-center mb-6 group-hover:bg-volt group-hover:text-dark-base transition-all duration-300">
                <Zap className="w-6 h-6 text-volt group-hover:text-dark-base transition-colors" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Despacho Prioritario</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Entregas el mismo día para pedidos en Pasto antes de las 2 PM y despachos exprés a toda Colombia con guía inmediata.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-dark-card/70 border border-white/5 hover:border-volt/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(204,255,0,0.08)]">
              <div className="w-13 h-13 rounded-xl bg-volt/10 border border-volt/20 flex items-center justify-center mb-6 group-hover:bg-volt group-hover:text-dark-base transition-all duration-300">
                <ShieldCheck className="w-6 h-6 text-volt group-hover:text-dark-base transition-colors" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Pago 100% Seguro</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Paga de forma rápida y confiable mediante Nequi, Daviplata o Bancolombia con validación y recibo digital al instante.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-dark-card/70 border border-white/5 hover:border-volt/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(204,255,0,0.08)]">
              <div className="w-13 h-13 rounded-xl bg-volt/10 border border-volt/20 flex items-center justify-center mb-6 group-hover:bg-volt group-hover:text-dark-base transition-all duration-300">
                <Award className="w-6 h-6 text-volt group-hover:text-dark-base transition-colors" />
              </div>
              <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Calidad & INVIMA</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Productos 100% legítimos y sellados de fábrica con registro INVIMA vigente. Cuidamos tu cuerpo y tu inversión.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ══ FAQ SECTION ══ */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-[1px] w-12 bg-volt/40" />
              <span className="text-volt font-mono font-black text-xs tracking-[0.25em] uppercase">PREGUNTAS FRECUENTES</span>
              <span className="h-[1px] w-12 bg-volt/40" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Resolvemos tus <span className="text-volt drop-shadow-[0_0_20px_rgba(204,255,0,0.35)]">Dudas</span>
            </h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  openFaq === index
                    ? 'border-volt/40 bg-dark-surface shadow-[0_0_30px_rgba(204,255,0,0.06)]'
                    : 'border-white/5 bg-dark-surface/40 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-7 py-6 flex items-center justify-between text-left focus:outline-none group/faq"
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-black font-mono transition-colors ${openFaq === index ? 'text-volt' : 'text-gray-500'}`}>
                      0{index + 1} //
                    </span>
                    <span className="font-bold text-white text-base md:text-lg pr-4">
                      {faq.q}
                    </span>
                  </div>
                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      openFaq === index
                        ? 'bg-volt text-dark-base rotate-45 shadow-[0_0_12px_rgba(204,255,0,0.6)]'
                        : 'bg-white/5 text-gray-400 group-hover/faq:bg-volt/10 group-hover/faq:text-volt'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
                <div
                  className={`px-7 overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pl-10">
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ELEVADO ══ */}
      <footer className="relative border-t border-white/5 bg-dark-surface overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-volt/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[250px] bg-volt/[0.03] blur-[80px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start mb-12">
            
            {/* Columna Brand */}
            <div className="md:col-span-2 flex flex-col items-start gap-4">
              <Link to="/" className="flex items-center group">
                <img src={logoImg} alt="Victoria" className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(204,255,0,0.4)]" />
                <span className="font-black italic uppercase text-white text-2xl tracking-tighter ml-[-2px] group-hover:text-volt transition-colors">
                  ICTORIA
                </span>
              </Link>
              <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                Suplementación deportiva de élite para atletas y entusiastas del fitness en Pasto y toda Colombia. Máxima potencia, pureza certificada.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-volt uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-volt shadow-[0_0_8px_#ccff00]" />
                Pasto, Nariño · Envíos Nacionales
              </div>
            </div>

            {/* Columna Navegación */}
            <div>
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">Catálogo</h5>
              <div className="flex flex-col gap-2.5 text-sm font-semibold text-gray-400">
                <Link to="/catalogo?categoria=Suplementos" className="hover:text-volt transition-colors">Suplementos</Link>
                <Link to="/catalogo?categoria=Hidratación" className="hover:text-volt transition-colors">Hidratación</Link>
                <Link to="/catalogo?categoria=Accesorios" className="hover:text-volt transition-colors">Accesorios</Link>
                <Link to="/catalogo" className="hover:text-volt transition-colors">Todos los Productos</Link>
              </div>
            </div>

            {/* Columna Confianza y Medios */}
            <div>
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">Atención & Legal</h5>
              <div className="flex flex-col gap-2.5 text-sm font-semibold text-gray-400">
                <Link to="/envios" className="hover:text-volt transition-colors">Políticas de Envío</Link>
                <Link to="/terminos" className="hover:text-volt transition-colors">Términos & Garantías</Link>
                <a
                  href="https://wa.me/573000000000?text=Hola,%20tengo%20una%20consulta%20sobre%20la%20tienda."
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-volt transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-volt" /> Contacto WhatsApp
                </a>
              </div>
            </div>

          </div>

          {/* Barra inferior */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-500">
            <p>© {new Date().getFullYear()} Victoria Performance Nutrition. Todos los derechos reservados.</p>
            <div className="flex items-center gap-3 text-[11px] font-mono tracking-widest uppercase">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">Nequi</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">Bancolombia</span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">Daviplata</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
