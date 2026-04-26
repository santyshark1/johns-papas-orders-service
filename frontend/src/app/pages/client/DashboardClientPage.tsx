'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ClipboardList, Clock } from 'lucide-react';
import { ClientSidebar } from '../../components/ClientSidebar';
import { ClientTopBar } from '../../components/ClientTopBar';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub?: string;
  nombre?: string;
  email?: string;
  [key: string]: unknown;
}

interface OrderItem {
  precio_unitario_snapshot: number;
  cantidad: number;
  descuento_item?: number;
}

interface Order {
  id?: string;
  cliente_id: string;
  fecha_creacion?: string;
  created_at?: string;
  total?: number;
  items: OrderItem[];
  estado?: string;
}

const statusColors: Record<string, string> = {
  entregado: 'bg-green-100 text-green-800',
  en_preparacion: 'bg-orange-100 text-orange-800',
  listo: 'bg-yellow-100 text-yellow-800',
  pendiente: 'bg-blue-100 text-blue-800',
};

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

function tiempoDesde(dateStr?: string): string {
  if (!dateStr) return '—';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Hace 1 día';
  return `Hace ${days} días`;
}

export function DashboardClientPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }

      let clienteId: string | undefined;
      try {
        clienteId = jwtDecode<JwtPayload>(token).sub;
      } catch { setLoading(false); return; }
      if (!clienteId) { setLoading(false); return; }

      const res = await fetch(
        `/api-proxy/pedidos-svc/pedidos?cliente_id=${clienteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => null);

      if (res?.ok) {
        const json = await res.json();
        setOrders(Array.isArray(json) ? json : (json.items ?? json.data ?? []));
      }
      setLoading(false);
    }
    load();
  }, []);

  const sorted = orders
    .slice()
    .sort((a, b) => new Date(b.fecha_creacion ?? b.created_at ?? 0).getTime() - new Date(a.fecha_creacion ?? a.created_at ?? 0).getTime());

  const totalInvertido = orders.reduce((sum, o) => sum + calcTotal(o), 0);
  const lastOrder = sorted[0];

  const kpis = [
    { label: 'Total invertido', value: loading ? '...' : formatCOP(totalInvertido), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Pedidos realizados', value: loading ? '...' : String(orders.length), icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'Último pedido', value: loading ? '...' : tiempoDesde(lastOrder?.fecha_creacion ?? lastOrder?.created_at), icon: Clock, color: 'bg-orange-500' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <ClientSidebar />

      <div className="flex-1">
        <ClientTopBar />

        <div className="p-4 lg:p-8">
          <h2 className="text-2xl md:text-3xl mb-6 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Dashboard Cliente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${kpi.color} p-3 rounded-lg`}>
                      <Icon size={22} className="text-white" />
                    </div>
                  </div>
                  <p className="text-2xl text-[#5C3D1E] mb-1">{kpi.value}</p>
                  <p className="text-sm text-[#8B6F47]">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl mb-4 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Pedidos Recientes
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FDF6EC]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Pedido</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading && (
                    <tr><td colSpan={4} className="px-6 py-4 text-sm text-center text-[#8B6F47]">Cargando...</td></tr>
                  )}
                  {!loading && sorted.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-4 text-sm text-center text-[#8B6F47]">Sin pedidos</td></tr>
                  )}
                  {sorted.slice(0, 10).map((order, i) => (
                    <tr key={order.id ?? i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">#{(order.id ?? '—').slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{formatFecha(order.fecha_creacion ?? order.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{formatCOP(calcTotal(order))}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.estado?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-800'}`}>
                          {order.estado ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
