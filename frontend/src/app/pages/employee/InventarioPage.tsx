import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const inventoryItems = [
  { producto: 'Harina', categoria: 'Insumos', stock: 150, unidad: 'kg', minimo: 50, status: 'Disponible' },
  { producto: 'Queso Mozzarella', categoria: 'Lácteos', stock: 45, unidad: 'kg', minimo: 40, status: 'Stock bajo' },
  { producto: 'Pepperoni', categoria: 'Carnes', stock: 80, unidad: 'kg', minimo: 30, status: 'Disponible' },
  { producto: 'Salsa de Tomate', categoria: 'Salsas', stock: 120, unidad: 'litros', minimo: 50, status: 'Disponible' },
  { producto: 'Piña', categoria: 'Frutas', stock: 15, unidad: 'kg', minimo: 20, status: 'Stock bajo' },
  { producto: 'Champiñones', categoria: 'Vegetales', stock: 0, unidad: 'kg', minimo: 25, status: 'Agotado' },
];

const statusColors: Record<string, string> = {
  'Disponible': 'bg-green-100 text-green-800',
  'Stock bajo': 'bg-yellow-100 text-yellow-800',
  'Agotado': 'bg-red-100 text-red-800',
};

export function InventarioPage() {
  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      
      <div className="flex-1">
        <EmployeeTopBar />
        
        <div className="p-4 lg:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Inventario
            </h2>
            <button className="px-6 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center">
              <Plus size={20} className="mr-2" />
              Agregar Item
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="text-blue-500" size={32} />
                <span className="text-3xl text-[#5C3D1E]">245</span>
              </div>
              <p className="text-sm text-[#8B6F47]">Total productos</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="text-yellow-500" size={32} />
                <span className="text-3xl text-[#5C3D1E]">8</span>
              </div>
              <p className="text-sm text-[#8B6F47]">Stock bajo</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="text-red-500" size={32} />
                <span className="text-3xl text-[#5C3D1E]">3</span>
              </div>
              <p className="text-sm text-[#8B6F47]">Por vencer</p>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#FDF6EC]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Stock Actual</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Unidad</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Stock Mínimo</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventoryItems.map((item, index) => (
                    <tr key={index} className="hover:bg-[#FDF6EC]/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{item.producto}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{item.categoria}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{item.stock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{item.unidad}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#5C3D1E]">{item.minimo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button className="text-[#D4A017] hover:text-[#D4A017]/80">
                            <Edit size={18} />
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
