'use client';

import { useState } from 'react';
import { Plus, Minus, X, ShoppingCart, CheckCircle } from 'lucide-react';
import { ClientSidebar } from '../../components/ClientSidebar';
import { ClientTopBar } from '../../components/ClientTopBar';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub?: string;
  nombre?: string;
  email?: string;
  [key: string]: unknown;
}

const PEDIDOS_API = 'https://pedidos-service-bwn3.onrender.com';
const TIENDA_ID = 'e1b4d9f5-4d98-4b4e-8f77-9e71f6b4b0d2';
const TIENDA_NOMBRE = 'Johns Papas';

const categories = ['Pizzas', 'Postres', 'Adiciones', 'Bebidas'];

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

const pizzas: Product[] = [
  {
    id: 'PZ-001', sku: 'PZPEPP', name: 'Pepperoni', price: 45000,
    description: 'Salsa de tomate, mozzarella y pepperoni',
    image: 'https://images.unsplash.com/photo-1762922425310-cf31b9befba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YSUyMHdvb2RlbiUyMHRhYmxlfGVufDF8fHx8MTc3MzEwMTQzNHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'PZ-002', sku: 'PZHAW', name: 'Hawaiana', price: 48000,
    description: 'Jamón, piña, mozzarella y salsa especial',
    image: 'https://images.unsplash.com/photo-1671572579989-fa11cbd86eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXdhaWlhbiUyMHBpenphJTIwcGluZWFwcGxlJTIwaGFtfGVufDF8fHx8MTc3MzEwMTQzNXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'PZ-003', sku: 'PZVEG', name: 'Vegetariana', price: 40000,
    description: 'Vegetales frescos y mozzarella',
    image: 'https://images.unsplash.com/photo-1624633431700-b0912297c13a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwcGl6emElMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3MzA4MTY5NHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const postres: Product[] = [
  {
    id: 'PS-001', sku: 'PSTIRAM', name: 'Tiramisu', price: 18000,
    description: 'Postre italiano con cafe y mascarpone',
    image: 'https://images.unsplash.com/photo-1768225385872-03945d45a0d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aXJhbWlzdSUyMGRlc3NlcnQlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNjI5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'PS-002', sku: 'PSBROWN', name: 'Brownie con Helado', price: 16000,
    description: 'Brownie caliente con helado de vainilla',
    image: 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBicm93bmllJTIwZGVzc2VydHxlbnwxfHx8fDE3NzI5ODkwMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const adiciones: Product[] = [
  {
    id: 'AD-001', sku: 'ADPANAJ', name: 'Pan de Ajo', price: 10000,
    description: 'Pan crocante con mantequilla de ajo',
    image: 'https://images.unsplash.com/photo-1633030318854-b076ff72770f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJsaWMlMjBicmVhZCUyMGJhc2tldHxlbnwxfHx8fDE3NzMwODUwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'AD-002', sku: 'ADALITAS', name: 'Alitas de Pollo', price: 22000,
    description: 'Alitas BBQ o picantes',
    image: 'https://images.unsplash.com/photo-1535902491948-06a40e45ed95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwd2luZ3MlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNTAwNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const bebidas: Product[] = [
  {
    id: 'BE-001', sku: 'BECOCA', name: 'Coca Cola', price: 5000,
    description: 'Refresco clasico 355ml',
    image: 'https://images.unsplash.com/photo-1734605641773-f2755bf7432d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2RhJTIwY29sYSUyMGJvdHRsZXxlbnwxfHx8fDE3NzMxMDI1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: 'BE-002', sku: 'BELIMON', name: 'Limonada Natural', price: 6000,
    description: 'Limonada fresca de la casa',
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW1vbmFkZSUyMGdsYXNzJTIwZnJlc2h8ZW58MXx8fHwxNzMzMDE4NjQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const allProducts = [...pizzas, ...postres, ...adiciones, ...bebidas];

function getByCategory(cat: string): Product[] {
  switch (cat) {
    case 'Pizzas': return pizzas;
    case 'Postres': return postres;
    case 'Adiciones': return adiciones;
    case 'Bebidas': return bebidas;
    default: return pizzas;
  }
}

function formatCOP(v: number) {
  return '$' + Math.round(v).toLocaleString('es-CO');
}

type EntregaType = 'DOMICILIO' | 'RECOGIDA';

interface ConfirmForm {
  telefono: string;
  entrega: EntregaType;
  calle: string;
  ciudad: string;
  numero1: string;
  numero2: string;
}

function ConfirmModal({ cart, onClose, onSuccess }: {
  cart: Record<string, number>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<ConfirmForm>({
    telefono: '', entrega: 'DOMICILIO', calle: '', ciudad: '', numero1: '', numero2: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const items = allProducts.filter(p => (cart[p.id] ?? 0) > 0);
  const total = items.reduce((s, p) => s + p.price * cart[p.id], 0);

  function set(key: keyof ConfirmForm, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    if (!form.telefono.trim()) { setError('Ingresa tu teléfono'); return; }
    if (form.entrega === 'DOMICILIO' && (!form.calle.trim() || !form.ciudad.trim())) {
      setError('Completa la dirección de entrega');
      return;
    }
    setSubmitting(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) { setError('Sesión expirada'); setSubmitting(false); return; }

    let decoded: JwtPayload;
    try { decoded = jwtDecode<JwtPayload>(token); } catch { setError('Sesión expirada'); setSubmitting(false); return; }

    const payload = {
      cliente_email: decoded.email ?? '',
      cliente_id: decoded.sub ?? '',
      cliente_nombre: decoded.nombre ?? '',
      cliente_telefono: form.telefono,
      direccion: {
        calle: form.calle || 'Recogida en tienda',
        ciudad: form.ciudad || 'Johns Papas',
        numero1: form.numero1,
        numero2: form.numero2,
        tipo: 'ENVIO',
      },
      entrega: form.entrega,
      items: items.map(p => ({
        cantidad: cart[p.id],
        descuento_item: 0,
        impuesto_item: 0,
        nombre_producto_snapshot: p.name,
        notas: '',
        opciones_seleccionadas: [],
        precio_unitario_snapshot: p.price,
        producto_id: p.id,
        sku_producto_snapshot: p.sku,
        variantes_json: {},
      })),
      plataforma: 'WEB',
      tienda_id: TIENDA_ID,
      tienda_nombre: TIENDA_NOMBRE,
    };

    const res = await fetch(`${PEDIDOS_API}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (res?.ok) {
      onSuccess();
    } else {
      const err = await res?.json().catch(() => null);
      setError(err?.detail ?? `Error ${res?.status ?? ''} al crear el pedido`);
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Confirmar Pedido
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Resumen */}
          <div className="bg-[#FDF6EC] rounded-lg p-4 space-y-1">
            {items.map(p => (
              <div key={p.id} className="flex justify-between text-sm text-[#5C3D1E]">
                <span>{p.name} ×{cart[p.id]}</span>
                <span>{formatCOP(p.price * cart[p.id])}</span>
              </div>
            ))}
            <div className="border-t border-[#D4A017]/30 pt-2 flex justify-between font-medium text-[#5C3D1E]">
              <span>Total</span>
              <span>{formatCOP(total)}</span>
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs text-[#8B6F47] mb-1">Teléfono de contacto *</label>
            <input
              type="tel"
              value={form.telefono}
              onChange={e => set('telefono', e.target.value)}
              placeholder="+57 300 000 0000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#5C3D1E] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
            />
          </div>

          {/* Tipo de entrega */}
          <div>
            <label className="block text-xs text-[#8B6F47] mb-2">Tipo de entrega *</label>
            <div className="flex gap-3">
              {(['DOMICILIO', 'RECOGIDA'] as EntregaType[]).map(t => (
                <button
                  key={t}
                  onClick={() => set('entrega', t)}
                  className={`flex-1 py-2 rounded-lg text-sm border transition ${
                    form.entrega === t
                      ? 'bg-[#D4A017] border-[#D4A017] text-[#5C3D1E] font-medium'
                      : 'bg-white border-gray-200 text-[#8B6F47] hover:border-[#D4A017]'
                  }`}
                >
                  {t === 'DOMICILIO' ? '🛵 Domicilio' : '🏪 Recoger'}
                </button>
              ))}
            </div>
          </div>

          {/* Dirección (solo DOMICILIO) */}
          {form.entrega === 'DOMICILIO' && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-[#8B6F47] mb-1">Calle *</label>
                <input
                  value={form.calle}
                  onChange={e => set('calle', e.target.value)}
                  placeholder="Calle 123"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#5C3D1E] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-[#8B6F47] mb-1">Ciudad *</label>
                <input
                  value={form.ciudad}
                  onChange={e => set('ciudad', e.target.value)}
                  placeholder="Bogotá"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#5C3D1E] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-[#8B6F47] mb-1">Número</label>
                  <input
                    value={form.numero1}
                    onChange={e => set('numero1', e.target.value)}
                    placeholder="10"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#5C3D1E] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-[#8B6F47] mb-1">Complemento</label>
                  <input
                    value={form.numero2}
                    onChange={e => set('numero2', e.target.value)}
                    placeholder="Apto 5B"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#5C3D1E] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50"
                  />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 bg-[#5C3D1E] text-white rounded-lg hover:bg-[#5C3D1E]/90 transition disabled:opacity-50 font-medium"
          >
            {submitting ? 'Enviando pedido...' : 'Pedir ahora'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
        <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl text-[#5C3D1E] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          ¡Pedido realizado!
        </h3>
        <p className="text-sm text-[#8B6F47] mb-6">Tu pedido fue registrado. Puedes seguirlo en Mis Pedidos.</p>
        <button
          onClick={onClose}
          className="w-full py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition font-medium"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}

export function ClientMenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('Pizzas');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const products = getByCategory(selectedCategory);
  const cartItems = allProducts.filter(p => (cart[p.id] ?? 0) > 0);
  const cartTotal = cartItems.reduce((s, p) => s + p.price * cart[p.id], 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  function add(id: string) {
    setCart(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }

  function remove(id: string) {
    setCart(prev => {
      const qty = (prev[id] ?? 0) - 1;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  }

  function handleSuccess() {
    setCart({});
    setShowConfirm(false);
    setShowSuccess(true);
  }

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <ClientSidebar />

      <div className="flex-1">
        <ClientTopBar />

        <div className="p-4 lg:p-8 pb-32">
          <h2 className="text-2xl md:text-3xl mb-2 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Pedir
          </h2>
          <p className="text-sm text-[#8B6F47] mb-6">Selecciona productos y arma tu pedido rapidamente.</p>

          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full transition ${
                  selectedCategory === cat
                    ? 'bg-[#D4A017] text-[#5C3D1E]'
                    : 'bg-white text-[#5C3D1E] hover:bg-[#D4A017]/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => {
              const qty = cart[product.id] ?? 0;
              return (
                <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                  <div className="flex justify-center p-6 pb-3">
                    <img src={product.image} alt={product.name} className="w-40 h-40 object-cover rounded-full" />
                  </div>
                  <div className="p-6 pt-0 text-center">
                    <h3 className="text-xl mb-2 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {product.name}
                    </h3>
                    <p className="text-[#8B6F47] mb-4 text-sm">{product.description}</p>
                    <p className="text-[#D4A017] text-xl mb-4">{formatCOP(product.price)}</p>

                    {qty === 0 ? (
                      <button
                        onClick={() => add(product.id)}
                        className="w-full px-4 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition font-medium"
                      >
                        Agregar
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => remove(product.id)}
                          className="w-9 h-9 rounded-full bg-[#FDF6EC] border border-[#D4A017] text-[#5C3D1E] flex items-center justify-center hover:bg-[#D4A017]/20 transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-xl font-medium text-[#5C3D1E] w-6 text-center">{qty}</span>
                        <button
                          onClick={() => add(product.id)}
                          className="w-9 h-9 rounded-full bg-[#D4A017] text-[#5C3D1E] flex items-center justify-center hover:bg-[#D4A017]/90 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart bar */}
        {cartCount > 0 && (
          <div className="fixed bottom-0 left-0 right-0 lg:left-60 bg-white border-t border-gray-200 shadow-lg px-6 py-4 z-40">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart size={22} className="text-[#5C3D1E]" />
                  <span className="absolute -top-2 -right-2 bg-[#D4A017] text-[#5C3D1E] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#8B6F47]">{cartCount} {cartCount === 1 ? 'producto' : 'productos'}</p>
                  <p className="font-medium text-[#5C3D1E]">{formatCOP(cartTotal)}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                className="px-6 py-2 bg-[#5C3D1E] text-white rounded-lg hover:bg-[#5C3D1E]/90 transition font-medium"
              >
                Confirmar pedido
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmModal cart={cart} onClose={() => setShowConfirm(false)} onSuccess={handleSuccess} />
      )}

      {showSuccess && (
        <SuccessModal onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
