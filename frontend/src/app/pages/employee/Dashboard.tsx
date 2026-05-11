'use client';

import { useEffect, useState } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { dia: 'Lun', ventas: 1200000 },
  { dia: 'Mar', ventas: 1800000 },
  { dia: 'Mié', ventas: 1500000 },
  { dia: 'Jue', ventas: 2200000 },
  { dia: 'Vie', ventas: 2800000 },
  { dia: 'Sáb', ventas: 3200000 },
  { dia: 'Dom', ventas: 2400000 },
];

const statusColors: Record<string, string> = {
  ENTREGADO: 'bg-green-100 text-green-800',
  EN_PROCESO: 'bg-orange-100 text-orange-800',
  BORRADOR: 'bg-yellow-100 text-yellow-800',
  ENVIADO: 'bg-purple-100 text-purple-800',
  COMPLETADO: 'bg-teal-100 text-teal-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

const estadoLabel: Record<string, string> = {
  ENTREGADO: 'Entregado',
  EN_PROCESO: 'En proceso',
  BORRADOR: 'Pendiente',
  ENVIADO: 'Enviado',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
};

function formatCOP(v: number) {
  return '$' + Math.round(v).toLocaleString('es-CO');
}

function formatFecha(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface Order {
  id?: string;
  numero_orden?: string;
  cliente_nombre?: string;
  total?: number;
  estado?: string;
  creado_en?: string;
  items?: { nombre_producto_snapshot: string; cantidad: number }[];
}

function token() { return localStorage.getItem('token') ?? ''; }

export function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [empleados, setEmpleados] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordRes, empRes] = await Promise.all([
        fetch('/api-proxy/pedidos-svc/pedidos/todos', { headers: { Authorization: `Bearer ${token()}` } }).catch(() => null),
        fetch('/api-proxy/usuario-svc/usuarios', { headers: { Authorization: `Bearer ${token()}` } }).catch(() => null),
      ]);
      if (ordRes?.ok) {
        const data = await ordRes.json().catch(() => []);
        setOrders(Array.isArray(data) ? data : (data.items ?? []));
      }
      if (empRes?.ok) {
        const data = await empRes.json().catch(() => []);
        setEmpleados(Array.isArray(data) ? data.length : 0);
      }
      setLoading(false);
    }
    load();
  }, []);

  const hoy = new Date().toDateString();
  const pedidosHoy = orders.filter(o => o.creado_en && new Date(o.creado_en).toDateString() === hoy);
  const ventasHoy = pedidosHoy.reduce((s, o) => s + (o.total ?? 0), 0);
  const pedidosActivos = orders.filter(o => o.estado && !['ENTREGADO', 'COMPLETADO', 'CANCELADO'].includes(o.estado.toUpperCase())).length;
  const recientes = [...orders].slice(0, 5);

  const kpis = [
    { label: 'Ventas del día', value: loading ? '...' : formatCOP(ventasHoy), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Pedidos activos', value: loading ? '...' : String(pedidosActivos), icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Total pedidos', value: loading ? '...' : String(orders.length), icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Empleados', value: loading ? '...' : String(empleados), icon: Users, color: 'bg-orange-500' },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      <div className="flex-1">
        <EmployeeTopBar />
        <div className="p-4 lg:p-8">
          <h2 className="text-2xl md:text-3xl mb-6 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Panel de Control
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`${kpi.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                  <p className="text-2xl text-[#5C3D1E] mb-1 font-medium">{kpi.value}</p>
                  <p className="text-sm text-[#8B6F47]">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl mb-4 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ventas de la Semana
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
                <XAxis dataKey="dia" tick={{ fill: '#8B6F47', fontSize: 12 }} />
                <YAxis tick={{ fill: '#8B6F47', fontSize: 11 }} tickFormatter={v => '$' + (v / 1000) + 'K'} />
                <Tooltip formatter={(v: number) => [formatCOP(v), 'Ventas']} />
                <Line type="monotone" dataKey="ventas" stroke="#D4A017" strokeWidth={2.5} dot={{ fill: '#D4A017' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Pedidos Recientes
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FDF6EC]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Pedido</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-[#8B6F47]">Cargando...</td></tr>
                  )}
                  {!loading && recientes.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-[#8B6F47]">Sin pedidos</td></tr>
                  )}
                  {recientes.map((o, i) => {
                    const est = (o.estado ?? '').toUpperCase();
                    return (
                      <tr key={o.id ?? i} className="hover:bg-[#FDF6EC]/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">
                          {o.numero_orden ?? o.id ?? '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8B6F47]">{formatFecha(o.creado_en)}</td>
                        <td className="px-6 py-4 text-sm text-[#5C3D1E]">{o.cliente_nombre ?? '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">
                          {o.total != null ? formatCOP(o.total) : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs ${statusColors[est] ?? 'bg-gray-100 text-gray-700'}`}>
                            {estadoLabel[est] ?? o.estado ?? '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
