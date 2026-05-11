'use client';

import { useState, useEffect } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export const STORAGE_KEY = 'menu_admin_products';

const categories = ['Pizzas', 'Postres', 'Adiciones', 'Bebidas'];

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  image: string;
  category: string;
  active: boolean;
  description: string;
}

const initialProducts: Product[] = [
  { id: 'PZ-001', sku: 'PZPEPP',  name: 'Pepperoni',       price: 45000, category: 'Pizzas',   active: true,  description: 'Salsa de tomate, mozzarella y pepperoni', image: 'https://images.unsplash.com/photo-1762922425310-cf31b9befba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YSUyMHdvb2RlbiUyMHRhYmxlfGVufDF8fHx8MTc3MzEwMTQzNHww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'PZ-002', sku: 'PZHAW',   name: 'Hawaiana',         price: 48000, category: 'Pizzas',   active: true,  description: 'Jamón, piña, mozzarella y salsa especial', image: 'https://images.unsplash.com/photo-1671572579989-fa11cbd86eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXdhaWlhbiUyMHBpenphJTIwcGluZWFwcGxlJTIwaGFtfGVufDF8fHx8MTc3MzEwMTQzNXww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'PZ-003', sku: 'PZCHAM',  name: 'Champiñana',       price: 42000, category: 'Pizzas',   active: true,  description: 'Champiñones frescos, mozzarella y hierbas', image: 'https://images.unsplash.com/photo-1530632789071-8543f47edb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNocm9vbSUyMHBpenphJTIwZnJlc2glMjBoZXJic3xlbnwxfHx8fDE3NzMxMDE0MzV8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'PZ-004', sku: 'PZSUP',   name: 'Suprema',          price: 52000, category: 'Pizzas',   active: false, description: 'Cargada de ingredientes premium', image: 'https://images.unsplash.com/photo-1681567604770-0dc826c870ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXByZW1lJTIwcGl6emElMjBsb2FkZWQlMjB0b3BwaW5nc3xlbnwxfHx8fDE3NzMwNTUzOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'PZ-005', sku: 'PZVEG',   name: 'Vegetariana',      price: 40000, category: 'Pizzas',   active: true,  description: 'Vegetales frescos y mozzarella', image: 'https://images.unsplash.com/photo-1624633431700-b0912297c13a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwcGl6emElMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3MzA4MTY5NHww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'PZ-006', sku: 'PZMIT',   name: 'Mitad y Mitad',    price: 50000, category: 'Pizzas',   active: true,  description: 'Elige dos sabores en una pizza', image: 'https://images.unsplash.com/photo-1645530654927-a198eff22252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxmJTIwaGFsZiUyMHBpenphJTIwdHdvJTIwZmxhdm9yc3xlbnwxfHx8fDE3NzMxMDE0Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'PS-001', sku: 'PSTIRAM', name: 'Tiramisu',          price: 18000, category: 'Postres',  active: true,  description: 'Postre italiano con café y mascarpone', image: 'https://images.unsplash.com/photo-1768225385872-03945d45a0d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aXJhbWlzdSUyMGRlc3NlcnQlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNjI5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'PS-002', sku: 'PSBROWN', name: 'Brownie con Helado',price: 16000, category: 'Postres',  active: true,  description: 'Brownie caliente con helado de vainilla', image: 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBicm93bmllJTIwZGVzc2VydHxlbnwxfHx8fDE3NzI5ODkwMzV8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'AD-001', sku: 'ADPANAJ', name: 'Pan de Ajo',        price: 10000, category: 'Adiciones',active: true,  description: 'Pan crocante con mantequilla de ajo', image: 'https://images.unsplash.com/photo-1633030318854-b076ff72770f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJsaWMlMjBicmVhZCUyMGJhc2tldHxlbnwxfHx8fDE3NzMwODUwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'AD-002', sku: 'ADALITAS',name: 'Alitas de Pollo',   price: 22000, category: 'Adiciones',active: true,  description: 'Alitas BBQ o picantes', image: 'https://images.unsplash.com/photo-1535902491948-06a40e45ed95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwd2luZ3MlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNTAwNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'BE-001', sku: 'BECOCA',  name: 'Coca Cola',         price:  5000, category: 'Bebidas',  active: true,  description: 'Refresco clásico 355ml', image: 'https://images.unsplash.com/photo-1734605641773-f2755bf7432d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2RhJTIwY29sYSUyMGJvdHRsZXxlbnwxfHx8fDE3NzMxMDI1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'BE-002', sku: 'BELIMON', name: 'Limonada Natural',  price:  6000, category: 'Bebidas',  active: true,  description: 'Limonada fresca de la casa', image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW1vbmFkZSUyMGdsYXNzJTIwZnJlc2h8ZW58MXx8fHwxNzMzMDE4NjQzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
];

const emptyProduct: Product = { id: '', sku: '', name: '', price: 0, image: '', category: 'Pizzas', active: true, description: '' };

function formatCOP(v: number) {
  return '$' + Math.round(v).toLocaleString('es-CO');
}

function loadFromStorage(): Product[] {
  if (typeof window === 'undefined') return initialProducts;
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
    if (!form.name.trim()) return;
    if (editingIdx !== null) {
      setProducts(prev => prev.map((p, i) => i === editingIdx ? form : p));
    } else {
      const ts = Date.now();
      const prefix = form.category.slice(0, 2).toUpperCase();
      const newProduct: Product = {
        ...form,
        id: `${prefix}-${ts}`,
        sku: form.name.toUpperCase().replace(/\s+/g, '').slice(0, 8),
      };
      setProducts(prev => [...prev, newProduct]);
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
                <div key={product.id || i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {product.name}
                        </h3>
                        <p className="text-[#D4A017]">{formatCOP(product.price)}</p>
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
            {filtered.length === 0 && (
              <p className="col-span-3 text-center text-[#8B6F47] py-8">Sin productos en esta categoría</p>
            )}
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
                <label className="block text-sm mb-1 text-[#5C3D1E]">Precio (COP)</label>
                <input type="number" min={0} value={form.price}
                  onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
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
