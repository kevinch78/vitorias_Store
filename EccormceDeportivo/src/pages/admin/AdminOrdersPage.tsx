import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../../services/orderService';
import type { OrderStatus } from '../../types';
import { 
  Eye, 
  MessageCircle, 
  X, 
  Download, 
  Search, 
  RefreshCw, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Phone, 
  MapPin, 
  PackageCheck,
  Copy,
  Send,
  FileText,
  ExternalLink
} from 'lucide-react';
import { getImageUrl } from '../../utils/image';
import { 
  generateAdminStatusWhatsAppUrl, 
  generateOrderStatusMessage, 
  normalizePhoneNumber 
} from '../../utils/whatsapp';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<OrderStatus, { bg: string, border: string, text: string, label: string, dot: string }> = {
  PENDIENTE: { 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/30', 
    text: 'text-amber-400', 
    label: 'Pendiente', 
    dot: 'bg-amber-400' 
  },
  EN_PREPARACION: { 
    bg: 'bg-sky-500/10', 
    border: 'border-sky-500/30', 
    text: 'text-sky-400', 
    label: 'En Preparación', 
    dot: 'bg-sky-400' 
  },
  ENVIADO: { 
    bg: 'bg-indigo-500/10', 
    border: 'border-indigo-500/30', 
    text: 'text-indigo-400', 
    label: 'Enviado', 
    dot: 'bg-indigo-400' 
  },
  ENTREGADO: { 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/30', 
    text: 'text-emerald-400', 
    label: 'Entregado', 
    dot: 'bg-emerald-400' 
  },
  CANCELADO: { 
    bg: 'bg-rose-500/10', 
    border: 'border-rose-500/30', 
    text: 'text-rose-400', 
    label: 'Cancelado', 
    dot: 'bg-rose-400' 
  }
};

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'TODOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el modal de notificación de WhatsApp
  const [notifyModal, setNotifyModal] = useState<{
    isOpen: boolean;
    order: any | null;
    status: OrderStatus;
    extraNotes: string;
  }>({
    isOpen: false,
    order: null,
    status: 'EN_PREPARACION',
    extraNotes: '',
  });

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error('Error cargando pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id: string, nuevoEstado: string) => {
    try {
      const targetOrder = orders.find(o => o.id === id) || (selectedOrder?.id === id ? selectedOrder : null);
      await orderService.updateOrderStatus(id, nuevoEstado);
      
      const statusLabel = STATUS_CONFIG[nuevoEstado as OrderStatus]?.label || nuevoEstado;
      
      toast.success(`Pedido #${targetOrder?.codigo || ''} actualizado a ${statusLabel}`, {
        action: targetOrder ? {
          label: 'Notificar WhatsApp 📲',
          onClick: () => {
            const url = generateAdminStatusWhatsAppUrl(targetOrder, nuevoEstado);
            window.open(url, '_blank');
          }
        } : undefined,
      });

      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, estado: nuevoEstado });
      }

      // Desplegar modal interactivo para que el administrador pueda notificar al cliente vía WhatsApp
      if (targetOrder) {
        setNotifyModal({
          isOpen: true,
          order: { ...targetOrder, estado: nuevoEstado },
          status: nuevoEstado as OrderStatus,
          extraNotes: '',
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar estado');
    }
  };

  // Filtered & Searched Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = filter === 'TODOS' || order.estado === filter;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesStatus;

      const matchesSearch = 
        (order.codigo && order.codigo.toLowerCase().includes(term)) ||
        (order.nombreCliente && order.nombreCliente.toLowerCase().includes(term)) ||
        (order.telefono && order.telefono.includes(term)) ||
        (order.ciudad && order.ciudad.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [orders, filter, searchTerm]);

  // Metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => o.estado !== 'CANCELADO')
      .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }, [orders]);

  const totalOrders = orders.length;
  const pendientes = orders.filter(o => o.estado === 'PENDIENTE').length;
  const enPreparacion = orders.filter(o => o.estado === 'EN_PREPARACION').length;
  const entregados = orders.filter(o => o.estado === 'ENTREGADO').length;

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error('No hay pedidos para exportar');
      return;
    }
    
    const headers = ['Código', 'Fecha', 'Cliente', 'Teléfono', 'Ciudad', 'Dirección', 'Total (COP)', 'Método de Pago', 'Estado'];
    const rows = orders.map(o => [
      o.codigo,
      `"${new Date(o.createdAt).toLocaleString('es-CO')}"`,
      `"${o.nombreCliente}"`,
      `"${o.telefono}"`,
      `"${o.ciudad}"`,
      `"${o.direccion}"`,
      o.total,
      o.metodoPago,
      o.estado
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedidos_victoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Archivo CSV descargado con éxito');
  };

  return (
    <div className="space-y-6">
      
      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Total Facturado */}
        <div className="bg-[#0B0E17] border border-white/5 hover:border-volt/30 rounded-2xl p-4 sm:p-5 transition-all group relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-volt/5 rounded-full blur-xl pointer-events-none group-hover:bg-volt/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              Facturación
            </span>
            <div className="p-2 rounded-xl bg-volt/10 text-volt border border-volt/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
            ${totalRevenue.toLocaleString('es-CO')}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-volt" />
            Ventas no canceladas
          </div>
        </div>

        {/* Total Pedidos */}
        <div className="bg-[#0B0E17] border border-white/5 hover:border-white/20 rounded-2xl p-4 sm:p-5 transition-all group relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">
              Total Pedidos
            </span>
            <div className="p-2 rounded-xl bg-white/5 text-gray-300 border border-white/10">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
            {totalOrders}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
            Histórico completo
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-[#0B0E17] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 transition-all group relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Pendientes
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-amber-400 tracking-tight">
            {pendientes}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-400/80 font-mono">
            {pendientes > 0 ? '● Requieren atención' : 'Al día'}
          </div>
        </div>

        {/* En Preparación */}
        <div className="bg-[#0B0E17] border border-sky-500/20 hover:border-sky-500/40 rounded-2xl p-4 sm:p-5 transition-all group relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
              En Preparación
            </span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-sky-400 tracking-tight">
            {enPreparacion}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-sky-400/80 font-mono">
            En alistamiento
          </div>
        </div>

        {/* Entregados */}
        <div className="bg-[#0B0E17] border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition-all group relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Entregados
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
            {entregados}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400/80 font-mono">
            Finalizados con éxito
          </div>
        </div>
      </div>

      {/* ── SEARCH, FILTER & ACTIONS BAR ── */}
      <div className="bg-[#0B0E17] border border-white/5 rounded-2xl p-4 space-y-4">
        
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, cliente, teléfono o ciudad..."
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
              onClick={fetchOrders}
              disabled={isLoading}
              title="Recargar pedidos"
              className="p-2.5 bg-[#121624] border border-white/10 hover:border-white/20 text-gray-400 hover:text-white rounded-xl transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-volt' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-[#121624] hover:bg-volt/10 text-gray-300 hover:text-volt border border-white/10 hover:border-volt/30 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button 
            onClick={() => setFilter('TODOS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              filter === 'TODOS' 
                ? 'bg-volt text-black shadow-[0_0_12px_rgba(204,255,0,0.3)]' 
                : 'bg-white/[0.03] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <span>TODOS</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
              filter === 'TODOS' ? 'bg-black/20 text-black' : 'bg-white/5 text-gray-400'
            }`}>
              {orders.length}
            </span>
          </button>

          {Object.entries(STATUS_CONFIG).map(([statusKey, config]) => {
            const count = orders.filter(o => o.estado === statusKey).length;
            const isSelected = filter === statusKey;
            
            return (
              <button 
                key={statusKey}
                onClick={() => setFilter(statusKey as OrderStatus)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                  isSelected 
                    ? `${config.bg} ${config.border} ${config.text} shadow-sm` 
                    : 'bg-white/[0.02] text-gray-400 hover:text-gray-200 border-white/5'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                <span>{config.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-black/30' : 'bg-white/5 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ORDERS TABLE ── */}
      <div className="bg-[#0B0E17] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#121624]/60 border-b border-white/5 text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Pedido</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Ubicación</th>
                <th className="p-4">Total</th>
                <th className="p-4">Pago</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredOrders.map(order => {
                const statusStyle = STATUS_CONFIG[order.estado as OrderStatus] || STATUS_CONFIG.PENDIENTE;
                
                return (
                  <tr key={order.codigo} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Codigo */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white group-hover:text-volt transition-colors">
                          {order.codigo}
                        </span>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="p-4 text-gray-400 font-mono text-[11px]">
                      <div>{new Date(order.createdAt).toLocaleDateString('es-CO')}</div>
                      <div className="text-[10px] text-gray-600">
                        {new Date(order.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Cliente */}
                    <td className="p-4">
                      <p className="font-bold text-white truncate max-w-[160px]">{order.nombreCliente}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-gray-400 text-[11px]">{order.telefono}</span>
                        {order.telefono && (
                          <a 
                            href={`https://wa.me/57${order.telefono}?text=Hola%20${encodeURIComponent(order.nombreCliente)},%20te%20escribimos%20de%20Victoria%20sobre%20tu%20pedido%20${order.codigo}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Chatear por WhatsApp"
                            className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded hover:bg-emerald-500/10 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Ubicación */}
                    <td className="p-4">
                      <p className="font-semibold text-gray-300 truncate max-w-[140px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                        {order.ciudad || 'Colombia'}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate max-w-[140px] mt-0.5">
                        {order.direccion || 'Dirección no especificada'}
                      </p>
                    </td>

                    {/* Total */}
                    <td className="p-4">
                      <span className="font-mono font-black text-sm text-volt">
                        ${(Number(order.total) || 0).toLocaleString('es-CO')}
                      </span>
                    </td>

                    {/* Pago */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-md text-gray-300 uppercase">
                          {order.metodoPago || 'N/A'}
                        </span>
                        {order.comprobantePago && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-volt bg-volt/10 border border-volt/20 px-1.5 py-0.5 rounded">
                            <FileText className="w-2.5 h-2.5" /> Comprobante
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Estado con selector rápido y botón WhatsApp */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <select 
                          value={order.estado}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key} className="bg-[#0B0E17] text-white">
                              {config.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setNotifyModal({ isOpen: true, order, status: order.estado as OrderStatus, extraNotes: '' })}
                          title={`Notificar estado (${statusStyle.label}) al cliente por WhatsApp`}
                          className="p-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 transition-all active:scale-95 shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="p-4 pr-6 text-center">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-white/5 hover:bg-volt/10 hover:text-volt border border-white/10 hover:border-volt/30 rounded-xl text-gray-400 transition-all inline-flex items-center gap-1.5 group/btn"
                        title="Ver detalle del pedido"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-[11px] font-bold hidden xl:inline">Detalle</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShoppingBag className="w-10 h-10 opacity-30 text-gray-400" />
                      <p className="font-bold text-sm text-gray-400 uppercase tracking-wider">
                        No se encontraron pedidos
                      </p>
                      <p className="text-xs text-gray-600 max-w-sm">
                        Intenta cambiando los filtros o el término de búsqueda.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ORDER DETAIL MODAL ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B0E17] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#121624]/70">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    Pedido <span className="text-volt">{selectedOrder.codigo}</span>
                  </h3>
                  <span className="text-[11px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('es-CO')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  ID: <span className="font-mono text-gray-500">{selectedOrder.id}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={selectedOrder.estado}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                    STATUS_CONFIG[selectedOrder.estado as OrderStatus]?.bg
                  } ${
                    STATUS_CONFIG[selectedOrder.estado as OrderStatus]?.border
                  } ${
                    STATUS_CONFIG[selectedOrder.estado as OrderStatus]?.text
                  }`}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key} className="bg-[#0B0E17] text-white">
                      {config.label}
                    </option>
                  ))}
                </select>

                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Cliente y Despacho */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Cliente */}
                <div className="bg-[#121624]/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-volt">
                      Información del Cliente
                    </span>
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Nombre:</strong> {selectedOrder.nombreCliente}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Celular:</strong> {selectedOrder.telefono}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Método Pago:</strong>{' '}
                    <span className="font-mono text-volt uppercase">{selectedOrder.metodoPago}</span>
                  </p>
                </div>

                {/* Despacho */}
                <div className="bg-[#121624]/60 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-volt">
                      Destino de Envío
                    </span>
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Ciudad:</strong> {selectedOrder.ciudad}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Dirección:</strong> {selectedOrder.direccion}
                  </p>
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">Tipo de Envío:</strong> {selectedOrder.metodoEnvio || 'Estándar'}
                  </p>
                  {selectedOrder.notas && (
                    <p className="text-xs text-amber-400/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-1">
                      <strong>Nota:</strong> {selectedOrder.notas}
                    </p>
                  )}
                </div>
              </div>

              {/* Soporte de Pago / Comprobante */}
              <div className="bg-[#121624]/60 border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-volt" />
                    Comprobante de Transferencia ({selectedOrder.metodoPago || 'N/A'})
                  </h4>
                  {selectedOrder.comprobantePago ? (
                    <span className="text-[10px] font-bold text-volt bg-volt/10 border border-volt/20 px-2 py-0.5 rounded-full">
                      Cargado por el Cliente
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                      Sin comprobante adjunto
                    </span>
                  )}
                </div>

                {selectedOrder.comprobantePago ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-black/40 p-3.5 rounded-xl border border-white/10">
                    {selectedOrder.comprobantePago.endsWith('.pdf') ? (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center gap-2">
                        <FileText className="w-6 h-6" />
                        <span className="text-xs font-mono font-bold">Documento PDF</span>
                      </div>
                    ) : (
                      <img 
                        src={getImageUrl(selectedOrder.comprobantePago)} 
                        alt="Comprobante de pago" 
                        className="w-24 h-24 object-contain rounded-lg border border-white/10 bg-black/60 shrink-0"
                      />
                    )}

                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-bold text-white">Soporte Digital Adjuntado</p>
                      <p className="text-[11px] text-gray-400 font-mono break-all">{selectedOrder.comprobantePago}</p>
                      <a
                        href={getImageUrl(selectedOrder.comprobantePago)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-volt hover:underline font-bold mt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver en Pantalla Completa / Descargar</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    El cliente aún no ha adjuntado el comprobante digital a la plataforma (puede haberlo enviado directamente por WhatsApp).
                  </p>
                )}
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-volt" />
                  Productos Incluidos ({selectedOrder.detalles?.length || 0})
                </h4>

                <div className="bg-[#121624]/60 border border-white/5 rounded-2xl divide-y divide-white/5 overflow-hidden">
                  {selectedOrder.detalles?.map((item: any) => (
                    <div key={item.id} className="p-3.5 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={getImageUrl(item.producto?.imagenUrl || item.producto?.imagen)} 
                          alt={item.producto?.nombre || 'Producto'} 
                          className="w-12 h-12 rounded-xl border border-white/10 bg-black/40 object-contain p-1 shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {item.producto?.nombre || item.nombre || 'Producto'}
                          </p>
                          <p className="text-xs text-gray-400 font-mono">
                            {item.cantidad} x ${item.precio.toLocaleString('es-CO')}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-black text-white shrink-0 ml-4">
                        ${(item.precio * item.cantidad).toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}

                  {/* Resumen Total */}
                  <div className="p-4 bg-black/40 flex justify-between items-center border-t border-white/10">
                    <span className="font-bold text-white uppercase tracking-wider text-xs">
                      Total Liquidado
                    </span>
                    <span className="font-black font-mono text-xl text-volt">
                      ${Number(selectedOrder.total).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer / WhatsApp CTA */}
            <div className="p-4 sm:p-6 border-t border-white/5 bg-[#121624]/70 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => setNotifyModal({ isOpen: true, order: selectedOrder, status: selectedOrder.estado, extraNotes: '' })}
                className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black uppercase text-xs tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.25)] transition-all active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>Notificar Estado ({STATUS_CONFIG[selectedOrder.estado as OrderStatus]?.label || selectedOrder.estado}) por WhatsApp</span>
              </button>

              <a 
                href={`https://wa.me/${normalizePhoneNumber(selectedOrder.telefono)}?text=Hola%20${encodeURIComponent(selectedOrder.nombreCliente)},%20te%20escribimos%20del%20equipo%20de%20Victoria%20respecto%20a%20tu%20pedido%20${selectedOrder.codigo}.`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 font-bold uppercase text-xs tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                title="Abrir chat directo con el cliente"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Directo</span>
              </a>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold uppercase text-xs tracking-wider rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE NOTIFICACIÓN WHATSAPP AL CLIENTE ── */}
      {notifyModal.isOpen && notifyModal.order && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#0B0E17] border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 bg-[#121624]/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Notificar por WhatsApp
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Pedido <strong className="text-volt">#{notifyModal.order.codigo}</strong> • {notifyModal.order.nombreCliente} (+57 {notifyModal.order.telefono})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifyModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Selector de Estado a Notificar */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Fase / Estado del Mensaje:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO'] as OrderStatus[]).map((st) => {
                    const cfg = STATUS_CONFIG[st];
                    const isSelected = notifyModal.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNotifyModal((prev) => ({ ...prev, status: st }))}
                        className={`text-[11px] font-bold py-2 px-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? `${cfg.bg} ${cfg.border} ${cfg.text} ring-1 ring-current`
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campo para Guía de Envío o Nota Personalizada */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  {notifyModal.status === 'ENVIADO'
                    ? 'Número de Guía o Transportadora (Opcional):'
                    : notifyModal.status === 'CANCELADO'
                    ? 'Motivo de Cancelación (Opcional):'
                    : 'Nota Adicional o Instrucciones (Opcional):'}
                </label>
                <input
                  type="text"
                  value={notifyModal.extraNotes}
                  onChange={(e) => setNotifyModal((prev) => ({ ...prev, extraNotes: e.target.value }))}
                  placeholder={
                    notifyModal.status === 'ENVIADO'
                      ? 'Ej: Interrapidísimo guía #1234567890'
                      : notifyModal.status === 'CANCELADO'
                      ? 'Ej: Solicitado por el cliente'
                      : 'Ej: Tu pedido se entregará hoy entre 2 y 5 PM'
                  }
                  className="w-full bg-[#121624] border border-white/10 focus:border-[#25D366] rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all placeholder:text-gray-600"
                />
              </div>

              {/* Vista Previa de WhatsApp */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                  <span>Vista Previa del Mensaje:</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Chat de WhatsApp con el cliente</span>
                </label>
                <div className="bg-[#05110d] border border-[#25D366]/20 rounded-2xl p-4 text-xs text-gray-200 font-sans leading-relaxed whitespace-pre-wrap relative shadow-inner">
                  <div className="text-[10px] font-mono text-[#25D366] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                    Destinatario: +57 {notifyModal.order.telefono}
                  </div>
                  {generateOrderStatusMessage(notifyModal.order, notifyModal.status, notifyModal.extraNotes)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-white/5 bg-[#121624]/70 flex flex-col sm:flex-row gap-2.5">
              <a
                href={generateAdminStatusWhatsAppUrl(notifyModal.order, notifyModal.status, notifyModal.extraNotes)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setNotifyModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black uppercase text-xs tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.3)] transition-all active:scale-[0.99] text-center"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Abrir WhatsApp y Enviar Notificación</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generateOrderStatusMessage(notifyModal.order, notifyModal.status, notifyModal.extraNotes));
                  toast.success('Mensaje copiado al portapapeles');
                }}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                title="Copiar texto del mensaje"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </button>

              <button
                type="button"
                onClick={() => setNotifyModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
