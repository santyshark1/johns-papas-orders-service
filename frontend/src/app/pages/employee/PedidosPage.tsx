'use client';

import { useEffect, useState } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { RefreshCw, Eye, X } from 'lucide-react';

const PEDIDOS_API = 'https://pedidos-service-bwn3.onrender.com';

const filters = ['Todos', 'Pendientes', 'En Preparación', 'Listos', 'Entregados', 'Domicilios'];

const filterMap: Record<string, (o: Order) => boolean> = {
  'Todos': () => true,
  'Pendientes': (o) => o.estado?.toLowerCase() === 'pendiente',
  'En Preparación': (o) => o.estado?.toLowerCase() === 'en_preparacion',
  'Listos': (o) => o.estado?.toLowerCase() === 'listo',
  'Entregados': (o) => o.estado?.toLowerCase() === 'entregado',
  'Domicilios': (o) => o.entrega?.toUpperCase() === 'DOMICILIO',
};

const statusColors: Record<string, string> = {
  entregado: 'bg-green-100 text-green-800',
  en_preparacion: 'bg-orange-100 text-orange-800',
  listo: 'bg-yellow-100 text-yellow-800',
  pendiente: 'bg-blue-100 text-blue-800',
};

interface OrderItem {
  nombre_producto_snapshot: string;
  cantidad: number;
  precio_unitario_snapshot: number;
  total_item?: number;
}

interface Order {
  id?: string;
  numero_orden?: string;
  cliente_nombre?: string;
  cliente_email?: string;
  entrega?: string;
  estado?: string;
  total?: number;
  subtotal?: number;
  creado_en?: string;
  items: OrderItem[];
}

function formatCOP(v: number) {
  return '$' + Math.round(v).toLocaleString('es-CO');
}

function formatFecha(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function PedidosPage() {
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<Order | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const res = await fetch(`${PEDIDOS_API}/pedidos`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => null);
    if (res?.ok) {
      try {
        const json = await res.json();
        setOrders(Array.isArray(json) ? json : (json.items ?? json.data ?? []));
      } catch {
        setError('Error al procesar la respuesta del servidor');
      }
    } else {
      setError('No se pudieron cargar los pedidos');
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = orders.filter(filterMap[selectedFilter] ?? (() => true));

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      <div className="flex-1">
        <EmployeeTopBar />
        <div className="p-4 lg:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Gestión de Pedidos
            </h2>
            <button onClick={load} className="px-4 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center gap-2">
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className={`px-4 py-2 rounded-full transition ${selectedFilter === f ? 'bg-[#D4A017] text-[#5C3D1E]' : 'bg-white text-[#5C3D1E] hover:bg-[#D4A017]/20'}`}
              >
                {f}
                {f !== 'Todos' && (
                  <span className="ml-2 text-xs opacity-70">
                    ({orders.filter(filterMap[f] ?? (() => true)).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex justify-between">
              {error}
              <button onClick={load} className="underline">Reintentar</button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FDF6EC]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Pedido</th>
                    <th className="px-4 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Productos</th>
                    <th className="px-4 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Ver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading && (
                    <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-[#8B6F47]">Cargando...</td></tr>
                  )}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-[#8B6F47]">Sin pedidos</td></tr>
                  )}
                  {filtered.map((order, i) => (
                    <tr key={order.id ?? i} className="hover:bg-[#FDF6EC]/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5C3D1E]">
                        #{(order.numero_orden ?? order.id ?? '—').slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#5C3D1E]">{order.cliente_nombre ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-[#5C3D1E] max-w-[180px] truncate">
                        {order.items?.map(it => `${it.nombre_producto_snapshot} x${it.cantidad}`).join(', ') ?? '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5C3D1E]">
                        {order.total != null ? formatCOP(order.total) : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-[#5C3D1E] capitalize">
                        {order.entrega?.toLowerCase() ?? '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-[#8B6F47]">
                        {formatFecha(order.creado_en)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.estado?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-800'}`}>
                          {order.estado ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDetail(order)} className="text-[#D4A017] hover:text-[#D4A017]/80">
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

      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Pedido #{(detail.numero_orden ?? detail.id ?? '').slice(0, 8).toUpperCase()}
              </h3>
              <button onClick={() => setDetail(null)}><X size={22} className="text-[#8B6F47]" /></button>
            </div>
            <div className="space-y-2 text-sm text-[#5C3D1E] mb-4">
              <p><span className="text-[#8B6F47]">Cliente:</span> {detail.cliente_nombre}</p>
              <p><span className="text-[#8B6F47]">Email:</span> {detail.cliente_email}</p>
              <p><span className="text-[#8B6F47]">Entrega:</span> {detail.entrega}</p>
              <p><span className="text-[#8B6F47]">Estado:</span> {detail.estado}</p>
              <p><span className="text-[#8B6F47]">Fecha:</span> {formatFecha(detail.creado_en)}</p>
            </div>
            <table className="w-full text-sm mb-4">
              <thead><tr className="bg-[#FDF6EC]">
                <th className="px-3 py-2 text-left text-[#5C3D1E]">Producto</th>
                <th className="px-3 py-2 text-right text-[#5C3D1E]">Cant.</th>
                <th className="px-3 py-2 text-right text-[#5C3D1E]">Total</th>
              </tr></thead>
              <tbody>{detail.items?.map((it, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2 text-[#5C3D1E]">{it.nombre_producto_snapshot}</td>
                  <td className="px-3 py-2 text-right text-[#5C3D1E]">{it.cantidad}</td>
                  <td className="px-3 py-2 text-right text-[#5C3D1E]">{formatCOP((it.total_item ?? it.precio_unitario_snapshot * it.cantidad))}</td>
                </tr>
              ))}</tbody>
            </table>
            <div className="border-t pt-3 flex justify-between text-[#5C3D1E] font-medium">
              <span>Total</span>
              <span>{detail.total != null ? formatCOP(detail.total) : '—'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
