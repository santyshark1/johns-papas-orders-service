'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { ClientSidebar } from '../../components/ClientSidebar';
import { ClientTopBar } from '../../components/ClientTopBar';

const filters = ['Todos', 'Pendientes', 'En preparación', 'Listos', 'Entregados'];

const orders = [
  { id: '#CL-122', fecha: '20/04/2026', productos: 'Pizza Pepperoni x1, Bebida x1', total: '$58.000', estado: 'Entregado' },
  { id: '#CL-118', fecha: '18/04/2026', productos: 'Pizza Vegetariana x1', total: '$42.000', estado: 'En preparación' },
  { id: '#CL-110', fecha: '15/04/2026', productos: 'Pizza Hawaiana x2', total: '$74.000', estado: 'Listo' }
];

const statusColors: Record<string, string> = {
  Entregado: 'bg-green-100 text-green-800',
  'En preparación': 'bg-orange-100 text-orange-800',
  Listo: 'bg-yellow-100 text-yellow-800',
  Pendiente: 'bg-gray-100 text-gray-800'
};

export function PedidosClientPage() {
  const [selectedFilter, setSelectedFilter] = useState('Todos');

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
            {filters.map((filter) => (
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
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FDF6EC]/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.fecha}</td>
                      <td className="px-6 py-4 text-sm text-[#5C3D1E]">{order.productos}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.estado]}`}>
                          {order.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-[#D4A017] hover:text-[#D4A017]/80">
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
    </div>
  );
}
