'use client';

import { DollarSign, ClipboardList, Clock } from 'lucide-react';
import { ClientSidebar } from '../../components/ClientSidebar';
import { ClientTopBar } from '../../components/ClientTopBar';

const kpis = [
  { label: 'Total invertido', value: '$320.000', icon: DollarSign, color: 'bg-green-500' },
  { label: 'Pedidos realizados', value: '12', icon: ClipboardList, color: 'bg-blue-500' },
  { label: 'Último pedido', value: 'Hace 2 días', icon: Clock, color: 'bg-orange-500' }
];

const recentOrders = [
  { id: '#CL-122', fecha: '20/04/2026', total: '$58.000', estado: 'Entregado' },
  { id: '#CL-118', fecha: '18/04/2026', total: '$42.000', estado: 'En preparación' },
  { id: '#CL-110', fecha: '15/04/2026', total: '$74.000', estado: 'Listo' }
];

const statusColors: Record<string, string> = {
  Entregado: 'bg-green-100 text-green-800',
  'En preparación': 'bg-orange-100 text-orange-800',
  Listo: 'bg-yellow-100 text-yellow-800'
};

export function DashboardClientPage() {
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
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.fecha}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.estado]}`}>
                          {order.estado}
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
