import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, Truck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { Link, useLocation } from 'react-router-dom';
import { TopAnnouncementBar } from './TopAnnouncementBar';
import logoImg from '../../assets/img/logoSinFondo.png';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const { items, toggleCart } = useCartStore();
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  useEffect(() => {
    if (totalItems > 0) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Geles Energéticos', slug: 'geles-energeticos' },
    { label: 'Hidratación & Sales', slug: 'hidratacion-electrolitos' },
    { label: 'Bebidas Energéticas', slug: 'bebidas-energeticas' },
    { label: 'Packs Rendimiento', slug: 'packs-rendimiento' },
  ];

  const isLinkActive = (slug: string) => {
    const params = new URLSearchParams(location.search);
    const current = params.get('categoria');
    if (!current) return false;
    return current.toLowerCase() === slug.toLowerCase();
  };

  return (
    <>
      <TopAnnouncementBar />
      <nav
        className={`sticky top-0 z-40 w-full transition-all duration-500 border-b relative ${
          isScrolled
            ? 'bg-dark-base/95 backdrop-blur-xl border-dark-border shadow-[0_4px_40px_rgba(0,0,0,0.6)]'
            : 'bg-dark-base/70 backdrop-blur-md border-white/5'
        }`}
      >
        {/* Volt gradient line superior — más vibrante cuando se hace scroll */}
        <div
          className={`absolute top-0 left-0 w-full h-[1.5px] transition-opacity duration-500 bg-gradient-to-r from-transparent via-volt to-transparent ${
            isScrolled ? 'opacity-80' : 'opacity-40'
          }`}
        />

        {/* Glow ambiental izquierdo — le da vida al lado del logo */}
        <div className="absolute left-0 top-0 h-full w-48 bg-gradient-to-r from-volt/[0.04] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* ── LOGO WORDMARK ── */}
            <Link to="/" className="flex items-center group relative">
              {/* Glow de fondo detrás del logo al hover */}
              <span className="absolute -inset-3 rounded-xl bg-volt/0 group-hover:bg-volt/[0.06] transition-all duration-500 blur-lg" />

              {/* Logo "V" */}
              <img
                src={logoImg}
                alt="Victoria"
                className="relative h-11 md:h-13 w-auto object-contain transition-all duration-400 group-hover:drop-shadow-[0_0_16px_rgba(204,255,0,0.7)] group-hover:scale-[1.04]"
                style={{ height: 'clamp(2.6rem, 4vw, 3.2rem)' }}
              />

              {/* "ICTORIA" — tipografía que completa el wordmark */}
              <div className="relative flex flex-col" style={{ marginLeft: '-3px' }}>
                <span
                  className="font-black italic uppercase text-white leading-none transition-all duration-300 group-hover:text-volt"
                  style={{
                    fontSize: 'clamp(1.45rem, 2.4vw, 1.9rem)',
                    letterSpacing: '-0.04em',
                    textShadow: '0 0 0 transparent',
                  }}
                >
                  ICTORIA
                </span>
                {/* Línea decorativa bajo el wordmark */}
                <span className="h-[2px] w-0 group-hover:w-full bg-volt transition-all duration-400 ease-out rounded-full mt-0.5 shadow-[0_0_6px_#ccff00]" />
              </div>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, slug }) => {
                const active = isLinkActive(slug);
                return (
                  <Link
                    key={slug}
                    to={`/catalogo?categoria=${slug}`}
                    className={`relative px-2.5 lg:px-3.5 py-2 text-[11px] lg:text-[12px] xl:text-[13px] font-bold tracking-[0.08em] uppercase transition-all duration-200 group/nav ${
                      active ? 'text-volt' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {label}
                    {/* Underline animado */}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-volt rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(204,255,0,0.8)] ${
                        active ? 'w-full' : 'w-0 group-hover/nav:w-full'
                      }`}
                    />
                    {/* Hover bg glow */}
                    <span className="absolute inset-0 rounded-lg bg-volt/0 group-hover/nav:bg-volt/[0.06] transition-all duration-300" />
                  </Link>
                );
              })}
            </div>

            {/* ── ACTIONS ── */}
            <div className="flex items-center gap-1.5 md:gap-3">
              {/* Rastrear Pedido */}
              <Link
                to="/rastreo"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] lg:text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 hover:border-volt/30 transition-all group/track"
                title="Rastrear estado de mi pedido"
              >
                <Truck className="w-3.5 h-3.5 text-volt transition-transform group-hover/track:scale-110" />
                <span>Rastrear Pedido</span>
              </Link>

              {/* Carrito */}
              <button
                onClick={toggleCart}
                className="relative p-2.5 text-gray-400 hover:text-volt transition-all duration-200 rounded-lg hover:bg-volt/[0.08] group/cart"
              >
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 group-hover/cart:scale-110" />
                {totalItems > 0 && (
                  <span
                    className={`absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-black text-dark-base bg-volt rounded-full shadow-[0_0_8px_rgba(204,255,0,0.6)] transition-transform ${
                      isBouncing ? 'scale-150' : 'scale-100'
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Hamburger móvil */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 text-gray-400 hover:text-volt hover:bg-volt/[0.08] rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-dark-border ${
            isMobileMenuOpen ? 'max-h-72 opacity-100 border-b bg-dark-surface/95 backdrop-blur-xl' : 'max-h-0 opacity-0 border-transparent'
          }`}
        >
          <div className="px-4 py-5 flex flex-col space-y-1">
            {navLinks.map(({ label, slug }) => (
              <Link
                key={slug}
                to={`/catalogo?categoria=${slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 ${
                  isLinkActive(slug)
                    ? 'text-volt bg-volt/10 border border-volt/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isLinkActive(slug) ? 'bg-volt shadow-[0_0_6px_#ccff00]' : 'bg-gray-600'}`} />
                {label}
              </Link>
            ))}
            <div className="border-t border-dark-border pt-3 mt-2 space-y-1">
              <Link
                to="/rastreo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-volt hover:text-white uppercase tracking-widest transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Rastrear Mi Pedido</span>
              </Link>
              <Link
                to="/envios"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors"
              >
                Políticas de Envío
              </Link>
            </div>
          </div>
        </div>

        {/* Volt glow sutil en la parte inferior del nav */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-volt/20 via-transparent to-transparent pointer-events-none" />
      </nav>
    </>
  );
};
