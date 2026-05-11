'use client';

import { useState } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { Download } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

const ingresosAnuales = [
  { mes: 'Ene', ingresos: 8500000 },
  { mes: 'Feb', ingresos: 9200000 },
  { mes: 'Mar', ingresos: 8800000 },
  { mes: 'Abr', ingresos: 10500000 },
  { mes: 'May', ingresos: 11200000 },
  { mes: 'Jun', ingresos: 10800000 },
  { mes: 'Jul', ingresos: 12000000 },
  { mes: 'Ago', ingresos: 11500000 },
  { mes: 'Sep', ingresos: 13000000 },
  { mes: 'Oct', ingresos: 12500000 },
  { mes: 'Nov', ingresos: 14000000 },
  { mes: 'Dic', ingresos: 15000000 },
];

const productosTop = [
  { nombre: 'Champiñana Especial', unidades: 250 },
  { nombre: 'Pizza Hawaiana', unidades: 190 },
  { nombre: 'Pizza Suprema', unidades: 145 },
  { nombre: 'Gaseosa', unidades: 80 },
];

const ventasDetalle = [
  { producto: 'Champiñana Especial', pedidos: 250, ingresos: '$1.960.000', promedio: '$7.840' },
  { producto: 'Pizza Hawaiana', pedidos: 190, ingresos: '$1.500.000', promedio: '$7.895' },
  { producto: 'Pizza Suprema', pedidos: 145, ingresos: '$1.102.000', promedio: '$7.600' },
  { producto: 'Gaseosa', pedidos: 80, ingresos: '$160.000', promedio: '$2.000' },
];

const categorias = [
  { name: 'Bebidas', value: 20 },
  { name: 'Pizzas', value: 80 },
];

const COLORES = ['#D4A017', '#5C3D1E'];

const periodos = ['Diario', 'Semanal', 'Mensual'];

function formatCOP(v: number) {
  return '$' + Math.round(v).toLocaleString('es-CO');
}

export function ReportesPage() {
  const [periodo, setPeriodo] = useState('Mensual');

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      <div className="flex-1">
        <EmployeeTopBar />
        <div className="p-4 lg:p-8">
          <h2 className="text-2xl md:text-3xl mb-6 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Reportes y Estadísticas
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Panel de Ventas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl text-[#D4A017]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Reporte de Ventas
                </h3>
                <button className="flex items-center gap-1 text-xs text-[#8B6F47] hover:text-[#5C3D1E] transition">
                  <Download size={14} />
                  Exportar
                </button>
              </div>

              <div className="flex gap-2 mb-5">
                {periodos.map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriodo(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition ${
                      periodo === p ? 'bg-[#D4A017] text-[#5C3D1E] font-medium' : 'bg-[#FDF6EC] text-[#5C3D1E] hover:bg-[#D4A017]/20'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="bg-[#FDF6EC] rounded-lg p-4 mb-5">
                <p className="text-sm text-[#8B6F47] mb-1">Total anual</p>
                <p className="text-3xl text-[#5C3D1E] font-medium">$136.300.000</p>
              </div>

              <div className="mb-5">
                <h4 className="text-sm mb-3 text-[#5C3D1E] font-medium">Ingresos por mes</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={ingresosAnuales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#8B6F47' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#8B6F47' }} tickFormatter={v => '$' + (v / 1000000) + 'M'} />
                    <Tooltip formatter={(v: number) => [formatCOP(v), 'Ingresos']} />
                    <Line type="monotone" dataKey="ingresos" stroke="#D4A017" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FDF6EC]">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs text-[#5C3D1E]">Producto</th>
                      <th className="px-3 py-2 text-right text-xs text-[#5C3D1E]">Pedidos</th>
                      <th className="px-3 py-2 text-right text-xs text-[#5C3D1E]">Ingresos</th>
                      <th className="px-3 py-2 text-right text-xs text-[#5C3D1E]">Promedio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ventasDetalle.map((row, i) => (
                      <tr key={i} className="hover:bg-[#FDF6EC]/50">
                        <td className="px-3 py-2 text-xs text-[#5C3D1E]">{row.producto}</td>
                        <td className="px-3 py-2 text-xs text-[#5C3D1E] text-right">{row.pedidos}</td>
                        <td className="px-3 py-2 text-xs text-[#5C3D1E] text-right">{row.ingresos}</td>
                        <td className="px-3 py-2 text-xs text-[#5C3D1E] text-right">{row.promedio}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Panel de Productos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl text-[#D4A017]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Estadísticas de Productos
                </h3>
              </div>

              <div className="mb-6">
                <h4 className="text-sm mb-3 text-[#5C3D1E] font-medium">Productos más vendidos</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={productosTop} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d8" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#8B6F47' }} />
                    <YAxis dataKey="nombre" type="category" tick={{ fontSize: 10, fill: '#5C3D1E' }} width={130} />
                    <Tooltip formatter={(v: number) => [v + ' uds.', 'Vendidos']} />
                    <Bar dataKey="unidades" fill="#D4A017" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-6">
                <h4 className="text-sm mb-3 text-[#5C3D1E] font-medium">Distribución por categoría</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categorias}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={false}
                    >
                      {categorias.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v}%`, 'Participación']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#FDF6EC] rounded-lg p-4">
                <h4 className="text-sm mb-2 text-[#5C3D1E] font-medium">Análisis de tendencias</h4>
                <p className="text-xs text-[#8B6F47] leading-relaxed">
                  Se observa un incremento sostenido en los ingresos durante el segundo semestre.
                  La Pizza Champiñana Especial lidera las ventas con 250 unidades,
                  seguida de la Hawaiana con 190 unidades.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
