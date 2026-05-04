'use client';

import { useState, useEffect } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const STORAGE_KEY = 'menu_admin_products';

const categories = ['Pizzas', 'Postres', 'Adiciones', 'Bebidas'];

interface Product {
  name: string;
  price: string;
  image: string;
  category: string;
  active: boolean;
  description: string;
}

const initialProducts: Product[] = [
  { name: 'Pepperoni', price: '$45.000', image: 'https://images.unsplash.com/photo-1762922425310-cf31b9befba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YSUyMHdvb2RlbiUyMHRhYmxlfGVufDF8fHx8MTc3MzEwMTQzNHww&ixlib=rb-4.1.0&q=80&w=1080', category: 'Pizzas', active: true, description: '' },
  { name: 'Hawaiana', price: '$48.000', image: 'https://images.unsplash.com/photo-1671572579989-fa11cbd86eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXdhaWlhbiUyMHBpenphJTIwcGluZWFwcGxlJTIwaGFtfGVufDF8fHx8MTc3MzEwMTQzNXww&ixlib=rb-4.1.0&q=80&w=1080', category: 'Pizzas', active: true, description: '' },
  { name: 'Champiñana', price: '$42.000', image: 'https://images.unsplash.com/photo-1530632789071-8543f47edb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNocm9vbSUyMHBpenphJTIwZnJlc2glMjBoZXJic3xlbnwxfHx8fDE3NzMxMDE0MzV8MA&ixlib=rb-4.1.0&q=80&w=1080', category: 'Pizzas', active: true, description: '' },
  { name: 'Suprema', price: '$52.000', image: 'https://images.unsplash.com/photo-1681567604770-0dc826c870ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXByZW1lJTIwcGl6emElMjBsb2FkZWQlMjB0b3BwaW5nc3xlbnwxfHx8fDE3NzMwNTUzOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', category: 'Pizzas', active: false, description: '' },
  { name: 'Vegetariana', price: '$40.000', image: 'https://images.unsplash.com/photo-1624633431700-b0912297c13a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwcGl6emElMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3MzA4MTY5NHww&ixlib=rb-4.1.0&q=80&w=1080', category: 'Pizzas', active: true, description: '' },
  { name: 'Mitad y Mitad', price: '$50.000', image: 'https://images.unsplash.com/photo-1645530654927-a198eff22252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxmJTIwaGFsZiUyMHBpenphJTIwdHdvJTIwZmxhdm9yc3xlbnwxfHx8fDE3NzMxMDE0Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080', category: 'Pizzas', active: true, description: '' },
];

const emptyProduct: Product = { name: '', price: '', image: '', category: 'Pizzas', active: true, description: '' };

function loadFromStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch { /* ignore */ }
  return initialProducts;
}

export function MenuAdminPage() {
  const [selectedCategory, setSelectedCategory] = useState('Pizzas');
  const [products, setProducts] = useState<Product[]>(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);
  const [showModal, setShowModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Product>(emptyProduct);

  function openAdd() {
    setEditingIdx(null);
    setForm({ ...emptyProduct, category: selectedCategory });
    setShowModal(true);
  }

  function openEdit(i: number) {
    setEditingIdx(i);
    setForm({ ...products[i] });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.price.trim()) return;
    if (editingIdx !== null) {
      setProducts(prev => prev.map((p, i) => i === editingIdx ? form : p));
    } else {
      setProducts(prev => [...prev, form]);
    }
    setShowModal(false);
  }

  function handleDelete(i: number) {
    setProducts(prev => prev.filter((_, idx) => idx !== i));
  }

  function toggleActive(i: number) {
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, active: !p.active } : p));
  }

  const filtered = products.filter(p => p.category === selectedCategory);

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      <div className="flex-1">
        <EmployeeTopBar />
        <div className="p-4 lg:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Gestión de Menú
            </h2>
            <button onClick={openAdd} className="px-6 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center">
              <Plus size={20} className="mr-2" />
              Agregar Producto
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full transition ${selectedCategory === cat ? 'bg-[#D4A017] text-[#5C3D1E]' : 'bg-white text-[#5C3D1E] hover:bg-[#D4A017]/20'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => {
              const realIdx = products.indexOf(product);
              return (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {product.name}
                        </h3>
                        <p className="text-[#D4A017]">{product.price}</p>
                        {product.description && <p className="text-xs text-[#8B6F47] mt-1">{product.description}</p>}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={product.active} onChange={() => toggleActive(realIdx)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A017]"></div>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(realIdx)}
                        className="flex-1 px-4 py-2 bg-[#5C3D1E] text-white rounded-lg hover:bg-[#5C3D1E]/90 transition flex items-center justify-center">
                        <Edit size={16} className="mr-2" />
                        Editar
                      </button>
                      <button onClick={() => handleDelete(realIdx)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {editingIdx !== null ? 'Editar Producto' : 'Agregar Producto'}
              </h3>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-[#8B6F47]" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Nombre</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Categoría</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Descripción</label>
                <textarea rows={2} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Precio</label>
                <input type="text" value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">URL Imagen</label>
                <input type="text" value={form.image}
                  onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-[#5C3D1E]">Activo</label>
                <input type="checkbox" checked={form.active} onChange={e => setForm(p => ({ ...p, active: e.target.checked }))} />
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
