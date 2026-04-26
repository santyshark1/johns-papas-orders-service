'use client';

import { useEffect, useState } from 'react';
import { Eye, X, AlertCircle } from 'lucide-react';
import { ClientSidebar } from '../../components/ClientSidebar';
import { ClientTopBar } from '../../components/ClientTopBar';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub?: string;
  nombre?: string;
  email?: string;
  [key: string]: unknown;
}

const PEDIDOS_API = 'https://pedidos-service-bwn3.onrender.com';

const STAGES = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'];

const STAGE_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const statusColors: Record<string, string> = {
  PENDIENTE: 'bg-blue-100 text-blue-800',
  EN_PREPARACION: 'bg-orange-100 text-orange-800',
  LISTO: 'bg-yellow-100 text-yellow-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const filters = ['Todos', 'Pendientes', 'En preparación', 'Listos', 'Entregados', 'Cancelados'];
const filterMap: Record<string, string> = {
  Pendientes: 'PENDIENTE',
  'En preparación': 'EN_PREPARACION',
  Listos: 'LISTO',
  Entregados: 'ENTREGADO',
  Cancelados: 'CANCELADO',
};

interface OpcionSeleccionada {
  etiqueta_opcion_snapshot: string;
}

interface OrderItem {
  nombre_producto_snapshot: string;
  cantidad: number;
  precio_unitario_snapshot: number;
  descuento_item?: number;
  notas?: string;
  opciones_seleccionadas?: OpcionSeleccionada[];
}

interface Order {
  id: string;
  cliente_id: string;
  fecha_creacion?: string;
  created_at?: string;
  total?: number;
  items: OrderItem[];
  estado: string;
  entrega?: string;
  direccion?: {
    calle: string;
    ciudad: string;
    numero1?: string;
    numero2?: string;
  };
}

function calcTotal(order: Order): number {
  if (order.total != null) return order.total;
  return order.items.reduce((sum, item) => {
    return sum + item.precio_unitario_snapshot * item.cantidad * (1 - (item.descuento_item ?? 0));
  }, 0);
}

function formatCOP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CO');
}

function formatFecha(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function OrderModal({ order, token, onClose, onCancelled }: {
  order: Order;
  token: string;
  onClose: () => void;
  onCancelled: (id: string) => void;
}) {
  const [detail, setDetail] = useState<Order | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [razon, setRazon] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const currentOrder = detail ?? order;
  const estado = currentOrder.estado?.toUpperCase();
  const stageIndex = STAGES.indexOf(estado);
  const canCancel = estado === 'PENDIENTE' || estado === 'EN_PREPARACION';

  useEffect(() => {
    fetch(`${PEDIDOS_API}/pedidos/${order.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data) setDetail(data); })
      .finally(() => setLoadingDetail(false));
  }, [order.id, token]);

  async function handleCancel() {
    if (!razon.trim()) { setCancelError('Ingresa una razón'); return; }
    setCancelling(true);
    setCancelError('');
    const res = await fetch(`${PEDIDOS_API}/pedidos/${order.id}/cancelar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: order.id, razon }),
    }).catch(() => null);
    if (res?.ok) {
      onCancelled(order.id);
      onClose();
    } else {
      const err = await res?.json().catch(() => null);
      setCancelError(err?.detail ?? 'Error al cancelar');
    }
    setCancelling(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Progress tracker */}
          {estado !== 'CANCELADO' && (
            <div className="relative flex items-start mb-8">
              <div className="absolute h-1 bg-gray-200" style={{ top: '1rem', left: '12.5%', right: '12.5%' }} />
              <div
                className="absolute h-1 bg-[#D4A017] transition-all duration-500"
                style={{
                  top: '1rem',
                  left: '12.5%',
                  width: stageIndex >= 0 ? `${(stageIndex / (STAGES.length - 1)) * 75}%` : '0%',
                }}
              />
              {STAGES.map((stage, i) => (
                <div key={stage} className="relative z-10 flex flex-col items-center" style={{ width: '25%' }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base border-2 transition-all ${
                    i <= stageIndex ? 'bg-[#D4A017] border-[#D4A017]' : 'bg-white border-gray-300'
                  }`}>
                    🍕
                  </div>
                  <span className={`mt-2 text-xs text-center leading-tight px-1 ${
                    i <= stageIndex ? 'text-[#5C3D1E] font-medium' : 'text-gray-400'
                  }`}>
                    {STAGE_LABELS[stage]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {estado === 'CANCELADO' && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={16} />
              Pedido cancelado
            </div>
          )}

          {/* Items */}
          {loadingDetail ? (
            <p className="text-sm text-[#8B6F47] text-center py-4">Cargando detalle...</p>
          ) : (
            <div className="space-y-3 mb-4">
              {currentOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="text-[#5C3D1E] font-medium">{item.nombre_producto_snapshot} ×{item.cantidad}</p>
                    {item.notas && <p className="text-gray-400 text-xs">Nota: {item.notas}</p>}
                    {item.opciones_seleccionadas?.map((o, j) => (
                      <p key={j} className="text-gray-400 text-xs">+ {o.etiqueta_opcion_snapshot}</p>
                    ))}
                  </div>
                  <span className="text-[#5C3D1E] whitespace-nowrap ml-4">
                    {formatCOP(item.precio_unitario_snapshot * item.cantidad)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-medium text-[#5C3D1E] text-sm">
                <span>Total</span>
                <span>{formatCOP(calcTotal(currentOrder))}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-[#8B6F47] mb-4">
            Fecha: {formatFecha(currentOrder.fecha_creacion ?? currentOrder.created_at)}
          </p>

          {canCancel && !showCancel && (
            <button
              onClick={() => setShowCancel(true)}
              className="w-full py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition"
            >
              Cancelar pedido
            </button>
          )}

          {canCancel && showCancel && (
            <div className="space-y-2">
              <textarea
                value={razon}
                onChange={e => setRazon(e.target.value)}
                placeholder="Razón de cancelación"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#5C3D1E] focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
              />
              {cancelError && <p className="text-xs text-red-500">{cancelError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowCancel(false); setCancelError(''); setRazon(''); }}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition"
                >
                  Volver
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition disabled:opacity-50"
                >
                  {cancelling ? 'Cancelando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PedidosClientPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    async function load() {
      const t = localStorage.getItem('token');
      if (!t) { setLoading(false); return; }
      setToken(t);

      let clienteId: string | undefined;
      try { clienteId = jwtDecode<JwtPayload>(t).sub; } catch { setLoading(false); return; }
      if (!clienteId) { setLoading(false); return; }

      const res = await fetch(
        `${PEDIDOS_API}/pedidos?cliente_id=${clienteId}`,
        { headers: { Authorization: `Bearer ${t}` } }
      ).catch(() => null);

      if (res?.ok) {
        const json = await res.json();
        setOrders(Array.isArray(json) ? json : (json.items ?? json.data ?? []));
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered =
    selectedFilter === 'Todos'
      ? orders
      : orders.filter(o => o.estado?.toUpperCase() === filterMap[selectedFilter]);

  const sorted = filtered
    .slice()
    .sort(
      (a, b) =>
        new Date(b.fecha_creacion ?? b.created_at ?? 0).getTime() -
        new Date(a.fecha_creacion ?? a.created_at ?? 0).getTime()
    );

  function handleCancelled(id: string) {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, estado: 'CANCELADO' } : o)));
  }

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <ClientSidebar />

      <div className="flex-1">
        <ClientTopBar />

        <div className="p-4 lg:p-8">
          <h2 className="text-2xl md:text-3xl mb-6 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Mis Pedidos
          </h2>

          <div className="flex flex-wrap gap-3 mb-6">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full transition ${
                  selectedFilter === filter
                    ? 'bg-[#D4A017] text-[#5C3D1E]'
                    : 'bg-white text-[#5C3D1E] hover:bg-[#D4A017]/20'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FDF6EC]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Pedido</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Productos</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-sm text-center text-[#8B6F47]">
                        Cargando...
                      </td>
                    </tr>
                  )}
                  {!loading && sorted.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-sm text-center text-[#8B6F47]">
                        Sin pedidos
                      </td>
                    </tr>
                  )}
                  {sorted.map((order, i) => (
                    <tr key={order.id ?? i} className="hover:bg-[#FDF6EC]/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">
                        #{(order.id ?? '—').slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">
                        {formatFecha(order.fecha_creacion ?? order.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#5C3D1E]">
                        {order.items.slice(0, 2).map((it, j) => (
                          <span key={j}>
                            {it.nombre_producto_snapshot} ×{it.cantidad}
                            {j < Math.min(order.items.length, 2) - 1 ? ', ' : ''}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span className="text-gray-400"> +{order.items.length - 2} más</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">
                        {formatCOP(calcTotal(order))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            statusColors[order.estado?.toUpperCase() ?? ''] ?? 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {STAGE_LABELS[order.estado?.toUpperCase()] ?? order.estado ?? '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-[#D4A017] hover:text-[#D4A017]/80"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          token={token}
          onClose={() => setSelectedOrder(null)}
          onCancelled={handleCancelled}
        />
      )}
    </div>
  );
}
