'use client';

import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { FileText, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const revenueData = [
  { month: 'Ene', revenue: 8500 },
  { month: 'Feb', revenue: 9200 },
  { month: 'Mar', revenue: 8800 },
  { month: 'Abr', revenue: 10500 },
  { month: 'May', revenue: 11200 },
  { month: 'Jun', revenue: 10800 },
  { month: 'Jul', revenue: 12000 },
  { month: 'Ago', revenue: 11500 },
  { month: 'Sep', revenue: 13000 },
  { month: 'Oct', revenue: 12500 },
  { month: 'Nov', revenue: 14000 },
  { month: 'Dic', revenue: 15000 },
];

const salesTableData = [
  { date: 'Champiñana Especial', orders: '$1,960', revenue: '(250 units)', avgValue: '' },
  { date: 'Hawaiana Pizza', orders: '$1,500', revenue: '(190%)', avgValue: '' },
  { date: 'Hawaiana Pizza', orders: '$1,500', revenue: '(190%)', avgValue: '' },
  { date: 'Coke', orders: '$750', revenue: '', avgValue: '' },
];

const topSellingData = [
  { name: 'Champiñana Especial', value: 250 },
  { name: 'Hawaiana Pizza', value: 190 },
  { name: 'Hawaiana Pizza', value: 190 },
  { name: 'Coke', value: 80 },
];

const categoryData = [
  { name: 'Drinks', value: 20 },
  { name: 'Pizzas', value: 80 },
];

const COLORS = ['#D4A017', '#5C3D1E', '#8B6F47', '#C19A6B'];

export function ReportesPage() {
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
            {/* Sales Report Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-[#D4A017]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Reporte de Ventas
                </h3>
                <span className="text-sm text-[#8B6F47]">Status</span>
              </div>

              {/* Period Selector */}
              <div className="flex gap-2 mb-4">
                <button className="px-4 py-2 bg-[#FDF6EC] text-[#5C3D1E] rounded-lg text-sm">Daily</button>
                <button className="px-4 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg text-sm">Weekly</button>
                <button className="px-4 py-2 bg-[#FDF6EC] text-[#5C3D1E] rounded-lg text-sm">Monthly</button>
                <button className="px-4 py-2 bg-[#FDF6EC] text-[#5C3D1E] rounded-lg text-sm flex items-center gap-1">
                  <Download size={16} />
                  Export to PDF/Excel
                </button>
              </div>

              {/* Revenue KPI */}
              <div className="bg-[#FDF6EC] rounded-lg p-4 mb-4">
                <p className="text-sm text-[#8B6F47] mb-1">Total Reporte</p>
                <p className="text-3xl text-[#5C3D1E]">$19,000</p>
              </div>

              {/* Line Chart */}
              <div className="mb-4">
                <h4 className="text-sm mb-2 text-[#5C3D1E]">Total Revenue</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#D4A017" strokeWidth={2} fill="rgba(212, 160, 23, 0.1)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Sales Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FDF6EC]">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs text-[#5C3D1E]">Date</th>
                      <th className="px-3 py-2 text-left text-xs text-[#5C3D1E]">Orders</th>
                      <th className="px-3 py-2 text-left text-xs text-[#5C3D1E]">Revenue</th>
                      <th className="px-3 py-2 text-left text-xs text-[#5C3D1E]">Avg Order Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {salesTableData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-xs text-[#5C3D1E]">{row.date}</td>
                        <td className="px-3 py-2 text-xs text-[#5C3D1E]">{row.orders}</td>
                        <td className="px-3 py-2 text-xs text-[#5C3D1E]">{row.revenue}</td>
                        <td className="px-3 py-2 text-xs text-[#5C3D1E]">{row.avgValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Product Statistics Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl text-[#D4A017]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Estadísticas de Productos
                </h3>
                <span className="text-sm text-[#8B6F47]">Status</span>
              </div>

              {/* Top Selling Items */}
              <div className="mb-6">
                <h4 className="text-sm mb-3 text-[#5C3D1E]">Top-Selling Items</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topSellingData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#D4A017" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Share */}
              <div className="mb-6">
                <h4 className="text-sm mb-3 text-[#5C3D1E]">Category Share</h4>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                      <span className="text-xs text-[#5C3D1E]">{cat.name} {cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="bg-[#FDF6EC] rounded-lg p-4">
                <h4 className="text-sm mb-2 text-[#5C3D1E]">Trend Analysis</h4>
                <p className="text-xs text-[#8B6F47]">
                  Seasonal increase in Hawaiian pizza orders during summer months.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
