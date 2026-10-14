import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import type { Product } from '../../types';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Award, 
  CreditCard, 
  Sparkles, 
  RefreshCw, 
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/image';
import { toast } from 'sonner';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'ALL'>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; amount: number; count: number; x: number; y: number } | null>(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, productsData] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts()
      ]);
      setOrders(ordersData);
      setProducts(productsData.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'ALL') return orders;
    const now = new Date();
    const days = timeRange === '7D' ? 7 : 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  }, [orders, timeRange]);

  // Overall Financial KPIs
  const kpis = useMemo(() => {
    const validOrders = filteredOrders.filter(o => o.estado !== 'CANCELADO');
    const totalRevenue = validOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const orderCount = validOrders.length;
    const avgTicket = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;
    
    // Total units moved
    let totalUnits = 0;
    validOrders.forEach(o => {
      o.detalles?.forEach((d: any) => {
        totalUnits += Number(d.cantidad) || 0;
      });
    });

    const deliveredCount = validOrders.filter(o => o.estado === 'ENTREGADO').length;
    const deliveryRate = orderCount > 0 ? Math.round((deliveredCount / orderCount) * 100) : 100;

    return { totalRevenue, orderCount, avgTicket, totalUnits, deliveryRate };
  }, [filteredOrders]);

  // 1. Top Selling Products
  const topProducts = useMemo(() => {
    const productStats: Record<string, {
      id: string;
      nombre: string;
      categoria: string;
      imagenUrl: string;
      slug?: string;
      unitsSold: number;
      revenue: number;
    }> = {};

    // Initialize from catalog so we have images & info
    products.forEach(p => {
      productStats[p.id] = {
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        imagenUrl: p.imagenUrl,
        slug: p.slug,
        unitsSold: 0,
        revenue: 0,
      };
    });

    // Accumulate from orders
    orders.forEach(o => {
      if (o.estado === 'CANCELADO') return;
      o.detalles?.forEach((d: any) => {
        const pId = d.productoId || d.producto?.id;
        const qty = Number(d.cantidad) || 0;
        const price = Number(d.precio) || 0;

        if (pId && productStats[pId]) {
          productStats[pId].unitsSold += qty;
          productStats[pId].revenue += qty * price;
        } else if (pId) {
          productStats[pId] = {
            id: pId,
            nombre: d.producto?.nombre || d.nombre || 'Producto',
            categoria: d.producto?.categoria || 'Suplementos',
            imagenUrl: getImageUrl(d.producto?.imagenUrl || d.producto?.imagen),
            slug: d.producto?.slug,
            unitsSold: qty,
            revenue: qty * price,
          };
        }
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders, products]);

  // 2. Timeline chart data (Revenue over time)
  const timelineData = useMemo(() => {
    // Generate dates timeline
    const dateMap: Record<string, { amount: number; count: number; rawDate: Date }> = {};

    // Base timeline: last 7 days or date keys
    const daysToShow = timeRange === '7D' ? 7 : timeRange === '30D' ? 14 : 7;
    const now = new Date();
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      dateMap[key] = { amount: 0, count: 0, rawDate: d };
    }

    // Fill with orders
    filteredOrders.forEach(o => {
      if (o.estado === 'CANCELADO') return;
      const d = new Date(o.createdAt);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (dateMap[key]) {
        dateMap[key].amount += Number(o.total) || 0;
        dateMap[key].count += 1;
      } else {
        dateMap[key] = { amount: Number(o.total) || 0, count: 1, rawDate: d };
      }
    });

    return Object.entries(dateMap).map(([date, val]) => ({
      date,
      amount: val.amount,
      count: val.count,
    }));
  }, [filteredOrders, timeRange]);

  // SVG Area Chart Calculations
  const chartConfig = useMemo(() => {
    const width = 760;
    const height = 240;
    const paddingX = 40;
    const paddingY = 30;

    const amounts = timelineData.map(d => d.amount);
    const maxAmount = Math.max(...amounts, 100000);

    const points = timelineData.map((d, idx) => {
      const x = paddingX + (idx / Math.max(timelineData.length - 1, 1)) * (width - paddingX * 2);
      const y = height - paddingY - (d.amount / maxAmount) * (height - paddingY * 2);
      return { x, y, ...d };
    });

    if (points.length === 0) return { path: '', area: '', points: [], width, height, maxAmount };

    // Generate smooth bezier curve path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      path += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const area = `${path} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return { path, area, points, width, height, maxAmount };
  }, [timelineData]);

  // 3. Category Sales Distribution (Donut Chart)
  const categoryData = useMemo(() => {
    const categories: Record<string, { label: string; revenue: number; units: number; color: string }> = {
      'Geles Energéticos': { label: 'Geles Energéticos', revenue: 0, units: 0, color: '#ccff00' },
      'Hidratación y Electrolitos': { label: 'Hidratación & Sales', revenue: 0, units: 0, color: '#00f5d4' },
      'Bebidas Energéticas': { label: 'Bebidas Energéticas', revenue: 0, units: 0, color: '#f59e0b' },
      'Packs y Rendimiento': { label: 'Packs Rendimiento', revenue: 0, units: 0, color: '#a855f7' },
    };

    orders.forEach(o => {
      if (o.estado === 'CANCELADO') return;
      o.detalles?.forEach((d: any) => {
        const cat = d.producto?.categoria?.nombre || d.producto?.categoria || 'Geles Energéticos';
        const key = categories[cat] ? cat : 'Geles Energéticos';
        const qty = Number(d.cantidad) || 0;
        const pr = Number(d.precio) || 0;
        categories[key].revenue += qty * pr;
        categories[key].units += qty;
      });
    });

    const totalRev = Object.values(categories).reduce((acc, c) => acc + c.revenue, 0) || 1;
    return Object.values(categories).map(c => ({
      ...c,
      percent: Math.round((c.revenue / totalRev) * 100),
    }));
  }, [orders]);

  // 4. Payment Methods Distribution
  const paymentMethods = useMemo(() => {
    const counts: Record<string, number> = {
      NEQUI: 0,
      BANCOLOMBIA: 0,
      CONTRAENTREGA: 0,
      TARJETA: 0,
    };

    let total = 0;
    orders.forEach(o => {
      if (o.estado === 'CANCELADO') return;
      const method = (o.metodoPago || 'NEQUI').toUpperCase();
      if (counts[method] !== undefined) {
        counts[method] += 1;
      } else {
        counts[method] = (counts[method] || 0) + 1;
      }
      total += 1;
    });

    const safeTotal = total || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / safeTotal) * 100),
    }));
  }, [orders]);

  return (
    <div className="space-y-6">
      
      {/* ── HEADER BANNER ── */}
      <div className="bg-[#0B0E17] border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-volt/10 via-transparent to-transparent pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-volt px-2 py-0.5 rounded bg-volt/10 border border-volt/20">
              ANALÍTICA EJECUTIVA
            </span>
            <span className="text-[11px] font-mono text-gray-500">
              ● Monitoreo en Tiempo Real
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Dashboard de Rendimiento Victoria
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Métricas de conversión, facturación acumulada y tendencias de consumo deportivo.
          </p>
        </div>

        {/* Time filters & Reload */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="bg-[#121624] border border-white/10 rounded-xl p-1 flex items-center gap-1">
            {(['7D', '30D', 'ALL'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  timeRange === range
                    ? 'bg-volt text-black shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'ALL' ? 'Histórico' : range}
              </button>
            ))}
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            title="Actualizar datos"
            className="p-2.5 bg-[#121624] border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-volt' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── KPI HIGHLIGHT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Facturación Total */}
        <div className="bg-[#0B0E17] border border-white/5 hover:border-volt/30 rounded-2xl p-5 relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              Ventas Totales
            </span>
            <div className="p-2 rounded-xl bg-volt/10 text-volt border border-volt/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
            ${kpis.totalRevenue.toLocaleString('es-CO')}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>Ticket Promedio:</span>
            <span className="text-volt font-bold">${kpis.avgTicket.toLocaleString('es-CO')}</span>
          </div>
        </div>

        {/* Volumen de Pedidos */}
        <div className="bg-[#0B0E17] border border-white/5 hover:border-white/20 rounded-2xl p-5 relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              Pedidos Concretados
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-gray-300 border border-white/10">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
            {kpis.orderCount}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>Unidades Vendidas:</span>
            <span className="text-white font-bold">{kpis.totalUnits} items</span>
          </div>
        </div>

        {/* Producto Estrella */}
        <div className="bg-[#0B0E17] border border-volt/20 hover:border-volt/40 rounded-2xl p-5 relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-volt">
              Producto Top #1
            </span>
            <div className="p-2 rounded-xl bg-volt/10 text-volt border border-volt/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-white tracking-tight truncate" title={topProducts[0]?.nombre || 'Sin ventas aún'}>
            {topProducts[0]?.nombre || 'Catálogo Activo'}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>Volumen:</span>
            <span className="text-volt font-bold">{topProducts[0]?.unitsSold || 0} unidades</span>
          </div>
        </div>

        {/* Tasa de Entrega */}
        <div className="bg-[#0B0E17] border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Efectividad Logística
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
            {kpis.deliveryRate}%
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>Cumplimiento:</span>
            <span className="text-emerald-400 font-bold">Despachos verificados</span>
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW 1: REVENUE TIMELINE & CATEGORY DONUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICA 1: Curva de Ventas e Ingresos (Area Chart 2 cols) */}
        <div className="lg:col-span-2 bg-[#0B0E17] border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-volt shadow-[0_0_8px_#ccff00]" />
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                  Curva de Facturación Diaria (COP)
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Comportamiento de ingresos y flujo comercial
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-volt bg-volt/10 border border-volt/20 px-3 py-1 rounded-xl">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Flujo Activo</span>
            </div>
          </div>

          {/* SVG Area Chart Container */}
          <div className="relative w-full h-64 select-none">
            {/* Tooltip flotante */}
            {hoveredPoint && (
              <div 
                className="absolute z-20 -top-2 bg-[#121624]/95 border border-volt/50 rounded-xl p-2.5 shadow-2xl backdrop-blur-md pointer-events-none transition-all transform -translate-x-1/2"
                style={{ left: `${(hoveredPoint.x / chartConfig.width) * 100}%` }}
              >
                <p className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                  Fecha: {hoveredPoint.date}
                </p>
                <p className="text-sm font-black font-mono text-volt">
                  ${hoveredPoint.amount.toLocaleString('es-CO')}
                </p>
                <p className="text-[10px] text-gray-300">
                  {hoveredPoint.count} {hoveredPoint.count === 1 ? 'pedido' : 'pedidos'}
                </p>
              </div>
            )}

            <svg 
              viewBox={`0 0 ${chartConfig.width} ${chartConfig.height}`} 
              className="w-full h-full overflow-visible"
            >
              <defs>
                {/* Gradient for area fill */}
                <linearGradient id="voltAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ccff00" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#ccff00" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="voltLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00f5d4" />
                  <stop offset="100%" stopColor="#ccff00" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
                const y = 30 + val * (chartConfig.height - 60);
                return (
                  <g key={idx}>
                    <line 
                      x1="40" 
                      y1={y} 
                      x2={chartConfig.width - 40} 
                      y2={y} 
                      stroke="rgba(255,255,255,0.05)" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x="35" 
                      y={y + 3} 
                      fill="rgba(156,163,175,0.4)" 
                      fontSize="9" 
                      fontFamily="monospace" 
                      textAnchor="end"
                    >
                      ${Math.round(((1 - val) * chartConfig.maxAmount) / 1000)}k
                    </text>
                  </g>
                );
              })}

              {/* Area Path */}
              {chartConfig.area && (
                <path d={chartConfig.area} fill="url(#voltAreaGradient)" />
              )}

              {/* Line Path */}
              {chartConfig.path && (
                <path 
                  d={chartConfig.path} 
                  fill="none" 
                  stroke="url(#voltLineGradient)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="filter drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]"
                />
              )}

              {/* Interactive Points */}
              {chartConfig.points.map((pt, idx) => (
                <g 
                  key={idx}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="8" 
                    fill="transparent" 
                  />
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="4.5" 
                    fill="#0B0E17" 
                    stroke="#ccff00" 
                    strokeWidth="2.5" 
                    className="transition-transform hover:scale-150"
                  />
                  {/* Date labels at bottom */}
                  <text 
                    x={pt.x} 
                    y={chartConfig.height - 10} 
                    fill="rgba(156,163,175,0.6)" 
                    fontSize="10" 
                    fontFamily="monospace" 
                    textAnchor="middle"
                  >
                    {pt.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
            <span>Pasa el cursor sobre los nodos para inspeccionar montos exactos.</span>
            <span className="font-mono text-volt">● Indicador en Tiempo Real</span>
          </div>
        </div>

        {/* GRÁFICA 2: Donut Chart de Categorías (1 col) */}
        <div className="bg-[#0B0E17] border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00f5d4] shadow-[0_0_8px_#00f5d4]" />
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                  Ventas por Categoría
                </h3>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Participación de cada línea deportiva en los ingresos totales
            </p>

            {/* SVG Donut Visualizer */}
            <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  fill="transparent" 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="12" 
                />
                
                {/* Dynamically stacked donut arcs */}
                {(() => {
                  let accumulatedPercent = 0;
                  const circumference = 2 * Math.PI * 38; // ~238.76

                  return categoryData.map((cat, idx) => {
                    const strokeDasharray = `${(cat.percent / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                    accumulatedPercent += cat.percent;

                    const isHovered = activeCategoryIndex === idx;

                    return (
                      <circle
                        key={cat.label}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth={isHovered ? '15' : '12'}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setActiveCategoryIndex(idx)}
                        onMouseLeave={() => setActiveCategoryIndex(null)}
                        style={{
                          filter: isHovered ? `drop-shadow(0 0 6px ${cat.color})` : 'none',
                        }}
                      />
                    );
                  });
                })()}
              </svg>

              {/* Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                  Líder
                </span>
                <span className="text-xl font-black font-mono text-white">
                  {categoryData[0]?.percent || 0}%
                </span>
                <span className="text-[9px] font-mono text-volt uppercase">
                  {categoryData[0]?.label || 'Suplementos'}
                </span>
              </div>
            </div>
          </div>

          {/* Category Legends */}
          <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
            {categoryData.map((cat, idx) => (
              <div 
                key={cat.label}
                onMouseEnter={() => setActiveCategoryIndex(idx)}
                onMouseLeave={() => setActiveCategoryIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                  activeCategoryIndex === idx ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-bold text-gray-300">{cat.label}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-gray-400">{cat.percent}%</span>
                  <span className="font-bold text-white">${cat.revenue.toLocaleString('es-CO')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW 2: TOP SELLING PRODUCTS & PAYMENT METHODS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICA 3: Top 5 Productos Más Vendidos (2 cols) */}
        <div className="lg:col-span-2 bg-[#0B0E17] border border-white/5 rounded-2xl p-5 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-volt" />
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                  Top Productos Más Vendidos (Ranking)
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Volumen de unidades despachadas y facturación generada
              </p>
            </div>

            <Link
              to="/admin/productos"
              className="text-xs font-bold text-volt hover:underline flex items-center gap-1 font-mono uppercase"
            >
              Inventario <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Ranking List with Progress Bars */}
          <div className="space-y-3.5 mt-4">
            {topProducts.map((prod, idx) => {
              const maxUnits = Math.max(...topProducts.map(p => p.unitsSold), 1);
              const progressPercent = Math.max((prod.unitsSold / maxUnits) * 100, 8);

              return (
                <div 
                  key={prod.id} 
                  className="bg-[#121624]/60 border border-white/5 hover:border-volt/30 rounded-xl p-3.5 transition-all group"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    
                    {/* Rank & Item Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                        idx === 0 
                          ? 'bg-volt text-black shadow-[0_0_10px_rgba(204,255,0,0.4)]' 
                          : idx === 1 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white/5 text-gray-400'
                      }`}>
                        #{idx + 1}
                      </span>

                      <div className="w-10 h-10 rounded-lg bg-black/60 border border-white/10 p-1 flex items-center justify-center shrink-0">
                        <img 
                          src={prod.imagenUrl} 
                          alt={prod.nombre} 
                          className="w-full h-full object-contain" 
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-volt transition-colors">
                          {prod.nombre}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono uppercase">
                          {prod.categoria}
                        </p>
                      </div>
                    </div>

                    {/* Sales stats */}
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-black font-mono text-white">
                        {prod.unitsSold} <span className="text-[10px] text-gray-400 font-normal">unds</span>
                      </p>
                      <p className="text-[11px] font-mono text-volt font-bold">
                        ${prod.revenue.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar visual */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-volt rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {topProducts.length === 0 && (
              <div className="p-8 text-center text-gray-500 font-mono text-xs">
                No hay registros de ventas todavía.
              </div>
            )}
          </div>
        </div>

        {/* GRÁFICA 4: Métodos de Pago Preferidos (1 col) */}
        <div className="bg-[#0B0E17] border border-white/5 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-volt" />
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight">
                Canales de Pago
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Preferencia de medios de pago seleccionados por los clientes
            </p>

            <div className="space-y-4">
              {paymentMethods.map(pm => (
                <div key={pm.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-300 font-mono">{pm.name}</span>
                    <span className="font-mono text-volt font-bold">{pm.percent}% ({pm.count})</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-volt rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(204,255,0,0.3)]"
                      style={{ width: `${pm.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights Box */}
          <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-volt text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Insight Deportivo</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              La mayor concentración de compras deportivas en Colombia se canaliza a través de transferencias inmediatas (Nequi y Bancolombia), garantizando despacho en el mismo día.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
