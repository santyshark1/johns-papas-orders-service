'use client';

import { useState } from 'react';
import { EmployeeSidebar } from '../components/EmployeeSidebar';
import { EmployeeTopBar } from '../components/EmployeeTopBar';
import { Plus, Eye, Trash2 } from 'lucide-react';

const filters = ['Todos', 'Pendientes', 'En Preparación', 'Listos', 'Domicilios'];

const orders = [
  { id: '#1234', cliente: 'Juan Pérez', productos: 'Pizza Pepperoni x2', total: '$90.000', tipo: 'Mesa', status: 'Listo' },
  { id: '#1233', cliente: 'María García', productos: 'Pizza Hawaiana x1, Bebida x2', total: '$56.000', tipo: 'Llevar', status: 'En preparación' },
  { id: '#1232', cliente: 'Carlos López', productos: 'Pizza Suprema x1', total: '$52.000', tipo: 'Domicilio', status: 'Pendiente' },
  { id: '#1231', cliente: 'Ana Martínez', productos: 'Pizza Vegetariana x3', total: '$120.000', tipo: 'Mesa', status: 'Entregado' },
  { id: '#1230', cliente: 'Pedro Ramírez', productos: 'Pizza Mitad y Mitad x2', total: '$100.000', tipo: 'Llevar', status: 'Listo' },
  { id: '#1229', cliente: 'Laura Sánchez', productos: 'Pizza Pepperoni x1, Postre x1', total: '$58.000', tipo: 'Domicilio', status: 'En preparación' },
];

const statusColors: Record<string, string> = {
  'Listo': 'bg-green-100 text-green-800',
  'En preparación': 'bg-orange-100 text-orange-800',
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'Entregado': 'bg-gray-100 text-gray-800',
};

export function PedidosPage() {
  const [selectedFilter, setSelectedFilter] = useState('Todos');

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
            <button className="px-6 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center">
              <Plus size={20} className="mr-2" />
              Nuevo Pedido
            </button>
          </div>

          {/* Filter Tabs */}
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

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FDF6EC]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">ID Pedido</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Productos</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FDF6EC]/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.cliente}</td>
                      <td className="px-6 py-4 text-sm text-[#5C3D1E]">{order.productos}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{order.tipo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button className="text-[#D4A017] hover:text-[#D4A017]/80">
                            <Eye size={18} />
                          </button>
                          <button className="text-red-500 hover:text-red-600">
                            <Trash2 size={18} />
                          </button>
                        </div>
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
