'use client';

import { useState } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { Plus, Edit, Trash2, Package, X } from 'lucide-react';

interface Item {
  producto: string;
  categoria: string;
  stock: number;
  unidad: string;
  minimo: number;
}

function getStatus(item: Item) {
  if (item.stock === 0) return 'Agotado';
  if (item.stock < item.minimo) return 'Stock bajo';
  return 'Disponible';
}

const statusColors: Record<string, string> = {
  'Disponible': 'bg-green-100 text-green-800',
  'Stock bajo': 'bg-yellow-100 text-yellow-800',
  'Agotado': 'bg-red-100 text-red-800',
};

const initialItems: Item[] = [
  { producto: 'Harina', categoria: 'Insumos', stock: 150, unidad: 'kg', minimo: 50 },
  { producto: 'Queso Mozzarella', categoria: 'Lácteos', stock: 45, unidad: 'kg', minimo: 40 },
  { producto: 'Pepperoni', categoria: 'Carnes', stock: 80, unidad: 'kg', minimo: 30 },
  { producto: 'Salsa de Tomate', categoria: 'Salsas', stock: 120, unidad: 'litros', minimo: 50 },
  { producto: 'Piña', categoria: 'Frutas', stock: 15, unidad: 'kg', minimo: 20 },
  { producto: 'Champiñones', categoria: 'Vegetales', stock: 0, unidad: 'kg', minimo: 25 },
];

const empty: Item = { producto: '', categoria: '', stock: 0, unidad: 'kg', minimo: 0 };

export function InventarioPage() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<Item>(empty);

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setShowModal(true);
  }

  function openEdit(i: number) {
    setEditing(i);
    setForm({ ...items[i] });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.producto.trim()) return;
    if (editing !== null) {
      setItems(prev => prev.map((it, i) => i === editing ? form : it));
    } else {
      setItems(prev => [...prev, form]);
    }
    setShowModal(false);
  }

  function handleDelete(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  const stockBajo = items.filter(it => getStatus(it) === 'Stock bajo').length;
  const agotado = items.filter(it => getStatus(it) === 'Agotado').length;

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
            <button onClick={openAdd} className="px-6 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center">
              <Plus size={20} className="mr-2" />
              Agregar Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="text-blue-500" size={32} />
                <span className="text-3xl text-[#5C3D1E]">{items.length}</span>
              </div>
              <p className="text-sm text-[#8B6F47]">Total productos</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="text-yellow-500" size={32} />
                <span className="text-3xl text-[#5C3D1E]">{stockBajo}</span>
              </div>
              <p className="text-sm text-[#8B6F47]">Stock bajo</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="text-red-500" size={32} />
                <span className="text-3xl text-[#5C3D1E]">{agotado}</span>
              </div>
              <p className="text-sm text-[#8B6F47]">Agotados</p>
            </div>
          </div>

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
                  {items.map((item, i) => {
                    const st = getStatus(item);
                    return (
                      <tr key={i} className="hover:bg-[#FDF6EC]/50">
                        <td className="px-6 py-4 text-sm text-[#5C3D1E]">{item.producto}</td>
                        <td className="px-6 py-4 text-sm text-[#5C3D1E]">{item.categoria}</td>
                        <td className="px-6 py-4 text-sm text-[#5C3D1E]">{item.stock}</td>
                        <td className="px-6 py-4 text-sm text-[#5C3D1E]">{item.unidad}</td>
                        <td className="px-6 py-4 text-sm text-[#5C3D1E]">{item.minimo}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${statusColors[st]}`}>{st}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(i)} className="text-[#D4A017] hover:text-[#D4A017]/80">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(i)} className="text-red-500 hover:text-red-600">
                              <Trash2 size={18} />
                            </button>
                          </div>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {editing !== null ? 'Editar Item' : 'Agregar Item'}
              </h3>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-[#8B6F47]" /></button>
            </div>
            <div className="space-y-4">
              {(['producto', 'categoria'] as const).map(field => (
                <div key={field}>
                  <label className="block text-sm mb-1 text-[#5C3D1E] capitalize">{field}</label>
                  <input
                    type="text"
                    value={form[field]}
                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                  />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1 text-[#5C3D1E]">Stock</label>
                  <input type="number" min={0} value={form.stock}
                    onChange={e => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[#5C3D1E]">Unidad</label>
                  <input type="text" value={form.unidad}
                    onChange={e => setForm(prev => ({ ...prev, unidad: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[#5C3D1E]">Mínimo</label>
                  <input type="number" min={0} value={form.minimo}
                    onChange={e => setForm(prev => ({ ...prev, minimo: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                  />
                </div>
              </div>
              <button onClick={handleSave}
                className="w-full py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
