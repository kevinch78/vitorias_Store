import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, LogOut, ExternalLink, Menu, X, Shield, Sparkles, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import logoImg from '../assets/img/logoSinFondo.png';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: TrendingUp,
      badge: 'KPIs',
      description: 'Analítica y métricas'
    },
    { 
      name: 'Pedidos', 
      path: '/admin/pedidos', 
      icon: LayoutDashboard,
      badge: 'Live',
      description: 'Gestión y despachos'
    },
    { 
      name: 'Productos', 
      path: '/admin/productos', 
      icon: Package,
      badge: null,
      description: 'Catálogo e inventario'
    },
  ];

  const currentSection = location.pathname.includes('/admin/productos')
    ? { title: 'Inventario de Productos', subtitle: 'Control de existencias, precios y catálogo' }
    : location.pathname.includes('/admin/pedidos')
    ? { title: 'Gestión de Pedidos', subtitle: 'Seguimiento de compras, despachos y clientes' }
    : { title: 'Dashboard de Analítica', subtitle: 'Rendimiento comercial y productos más vendidos' };

  return (
    <div className="min-h-screen bg-[#07090E] flex text-gray-200 font-sans selection:bg-volt selection:text-black">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0E17] border-r border-white/5 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Brand Header */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/5 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-volt/10 rounded-full blur-2xl pointer-events-none" />
          
          <Link to="/admin/pedidos" className="flex items-center gap-2 group">
            <img 
              src={logoImg} 
              alt="Victoria Logo" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_12px_rgba(204,255,0,0.4)]" 
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black italic text-lg tracking-tight text-white uppercase group-hover:text-volt transition-colors">
                  ICTORIA
                </span>
                <span className="text-[9px] font-black font-mono uppercase bg-volt text-black px-1.5 py-0.5 rounded tracking-widest shadow-[0_0_8px_rgba(204,255,0,0.5)]">
                  HQ
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" />
                Control Hub
              </span>
            </div>
          </Link>

          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-3">
                Administración
              </p>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`group flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 border ${
                        isActive 
                          ? 'bg-volt/10 text-volt border-volt/30 shadow-[0_0_20px_rgba(204,255,0,0.08)]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-volt text-black shadow-[0_0_10px_rgba(204,255,0,0.5)]' 
                            : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold tracking-wide truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500 truncate group-hover:text-gray-400">{item.description}</p>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          isActive 
                            ? 'bg-volt/20 text-volt border border-volt/30' 
                            : 'bg-white/5 text-gray-500'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Link to Store */}
            <div>
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-2">
                Acceso Rápido
              </p>
              <Link
                to="/"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-gray-400 hover:text-volt hover:bg-volt/[0.05] border border-white/5 hover:border-volt/20 transition-all text-xs font-semibold group"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-volt" />
                  Ver Tienda Pública
                </span>
                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* User & Logout section */}
          <div className="pt-6 border-t border-white/5 space-y-3">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-volt/30 to-volt/5 border border-volt/30 flex items-center justify-center text-volt font-black text-sm shrink-0 shadow-[0_0_12px_rgba(204,255,0,0.2)]">
                  {user?.nombre?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.nombre || 'Administrador'}</p>
                  <p className="text-[10px] text-volt font-mono uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    {user?.rol || 'Super Admin'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-3 py-2.5 w-full text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-[#0B0E17]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir Menú"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                {currentSection.title}
              </h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                {currentSection.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              to="/" 
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-volt/10 text-gray-300 hover:text-volt border border-white/10 hover:border-volt/30 px-3.5 py-2 rounded-lg transition-all"
            >
              <span>Tienda</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-gray-300 uppercase">
                {new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content with custom scrollbar */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-[1550px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
