'use client';

import { EmployeeSidebar } from '../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const kpiData = [
  { label: 'Ventas del día', value: '$2,450.000', icon: DollarSign, color: 'bg-green-500' },
  { label: 'Pedidos activos', value: '18', icon: ShoppingCart, color: 'bg-blue-500' },
  { label: 'Productos en inventario', value: '245', icon: Package, color: 'bg-purple-500' },
  { label: 'Empleados activos', value: '12', icon: Users, color: 'bg-orange-500' },
];

const salesData = [
  { day: 'Lun', ventas: 1200 },
  { day: 'Mar', ventas: 1800 },
  { day: 'Mié', ventas: 1500 },
  { day: 'Jue', ventas: 2200 },
  { day: 'Vie', ventas: 2800 },
  { day: 'Sáb', ventas: 3200 },
  { day: 'Dom', ventas: 2400 },
];

const recentOrders = [
  { id: '#1234', date: '10/03/2026', items: 'Pizza Pepperoni x2', total: '$90.000', status: 'Listo' },
  { id: '#1233', date: '10/03/2026', items: 'Pizza Hawaiana x1', total: '$48.000', status: 'En preparación' },
  { id: '#1232', date: '10/03/2026', items: 'Pizza Suprema x1', total: '$52.000', status: 'Pendiente' },
  { id: '#1231', date: '10/03/2026', items: 'Pizza Vegetariana x3', total: '$120.000', status: 'Entregado' },
];

const statusColors: Record<string, string> = {
  'Listo': 'bg-green-100 text-green-800',
  'En preparación': 'bg-orange-100 text-orange-800',
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'Entregado': 'bg-gray-100 text-gray-800',
};

export function Dashboard() {
  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      
      <div className="flex-1">
        <EmployeeTopBar />
        
        <div className="p-4 lg:p-8">
          <h2 className="text-2xl md:text-3xl mb-6 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Dashboard
          </h2>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpiData.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${kpi.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                  <p className="text-2xl text-[#5C3D1E] mb-1">{kpi.value}</p>
                  <p className="text-sm text-[#8B6F47]">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          {/* Sales Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl mb-4 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ventas de la Semana
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="ventas" stroke="#D4A017" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Orders Table */}
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
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">ID Pedido</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.date}</td>
                      <td className="px-6 py-4 text-sm text-[#5C3D1E]">{order.items}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                          {order.status}
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
