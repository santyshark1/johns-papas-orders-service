'use client';

import { useState } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { Pizza, Cake, Plus, Coffee, ShoppingCart, X, Trash2, CheckCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const PEDIDOS_API = 'https://pedidos-service-bwn3.onrender.com';
const TIENDA_ID = '00000000-0000-0000-0000-000000000001';
const TIENDA_NOMBRE = "John's Papas";

const categories = [
  { name: 'Pizzas', icon: Pizza },
  { name: 'Postres', icon: Cake },
  { name: 'Adiciones', icon: Plus },
  { name: 'Bebidas', icon: Coffee },
];

type Product = { id: string; name: string; sku: string; image: string; price: number };

const pizzas: Product[] = [
  { id: 'p1', name: 'Pepperoni', sku: 'PIZZA-PEPP', image: 'https://images.unsplash.com/photo-1762922425310-cf31b9befba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YSUyMHdvb2RlbiUyMHRhYmxlfGVufDF8fHx8MTc3MzEwMTQzNHww&ixlib=rb-4.1.0&q=80&w=1080', price: 45000 },
  { id: 'p2', name: 'Hawaiana', sku: 'PIZZA-HAW', image: 'https://images.unsplash.com/photo-1671572579989-fa11cbd86eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXdhaWlhbiUyMHBpenphJTIwcGluZWFwcGxlJTIwaGFtfGVufDF8fHx8MTc3MzEwMTQzNXww&ixlib=rb-4.1.0&q=80&w=1080', price: 48000 },
  { id: 'p3', name: 'Champiñana', sku: 'PIZZA-CHAMP', image: 'https://images.unsplash.com/photo-1530632789071-8543f47edb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNocm9vbSUyMHBpenphJTIwZnJlc2glMjBoZXJic3xlbnwxfHx8fDE3NzMxMDE0MzV8MA&ixlib=rb-4.1.0&q=80&w=1080', price: 42000 },
  { id: 'p4', name: 'Suprema', sku: 'PIZZA-SUP', image: 'https://images.unsplash.com/photo-1681567604770-0dc826c870ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXByZW1lJTIwcGl6emElMjBsb2FkZWQlMjB0b3BwaW5nc3xlbnwxfHx8fDE3NzMwNTUzOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', price: 52000 },
  { id: 'p5', name: 'Vegetariana', sku: 'PIZZA-VEG', image: 'https://images.unsplash.com/photo-1624633431700-b0912297c13a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwcGl6emElMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3MzA4MTY5NHww&ixlib=rb-4.1.0&q=80&w=1080', price: 40000 },
  { id: 'p6', name: 'Mitad y Mitad', sku: 'PIZZA-MYM', image: 'https://images.unsplash.com/photo-1645530654927-a198eff22252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxmJTIwaGFsZiUyMHBpenphJTIwdHdvJTIwZmxhdm9yc3xlbnwxfHx8fDE3NzMxMDE0Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080', price: 50000 },
];

const postres: Product[] = [
  { id: 'PS-001', sku: 'PSTIRAM', name: 'Tiramisu', price: 18000, image: 'https://images.unsplash.com/photo-1768225385872-03945d45a0d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aXJhbWlzdSUyMGRlc3NlcnQlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNjI5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'PS-002', sku: 'PSBROWN', name: 'Brownie con Helado', price: 16000, image: 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBicm93bmllJTIwZGVzc2VydHxlbnwxfHx8fDE3NzI5ODkwMzV8MA&ixlib=rb-4.1.0&q=80&w=1080' },
];

const adiciones: Product[] = [
  { id: 'AD-001', sku: 'ADPANAJ', name: 'Pan de Ajo', price: 10000, image: 'https://images.unsplash.com/photo-1633030318854-b076ff72770f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJsaWMlMjBicmVhZCUyMGJhc2tldHxlbnwxfHx8fDE3NzMwODUwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'AD-002', sku: 'ADALITAS', name: 'Alitas de Pollo', price: 22000, image: 'https://images.unsplash.com/photo-1535902491948-06a40e45ed95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwd2luZ3MlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNTAwNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080' },
];

const bebidas: Product[] = [
  { id: 'BE-001', sku: 'BECOCA', name: 'Coca Cola', price: 5000, image: 'https://images.unsplash.com/photo-1734605641773-f2755bf7432d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2RhJTIwY29sYSUyMGJvdHRsZXxlbnwxfHx8fDE3NzMxMDI1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: 'BE-002', sku: 'BELIMON', name: 'Limonada Natural', price: 6000, image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW1vbmFkZSUyMGdsYXNzJTIwZnJlc2h8ZW58MXx8fHwxNzMzMDE4NjQzfDA&ixlib=rb-4.1.0&q=80&w=1080' },
];

const productsByCategory: Record<string, Product[]> = {
  Pizzas: pizzas,
  Postres: postres,
  Adiciones: adiciones,
  Bebidas: bebidas,
};

interface CartItem { id: string; name: string; sku: string; quantity: number; price: number }

export function CajeroPage() {
  const [orderType, setOrderType] = useState<'RECOGIDA' | 'RETIRO_TIENDA'>('RECOGIDA');
  const [selectedCategory, setSelectedCategory] = useState('Pizzas');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [customerForm, setCustomerForm] = useState({
    nombre: '', email: '', telefono: '',
    calle: '', ciudad: '', numero1: '', numero2: '',
  });

  function addToCart(p: Product) {
    setCart(prev => {
      const ex = prev.find(it => it.id === p.id);
      if (ex) return prev.map(it => it.id === p.id ? { ...it, quantity: it.quantity + 1 } : it);
      return [...prev, { id: p.id, name: p.name, sku: p.sku, quantity: 1, price: p.price }];
    });
  }

  function removeFromCart(id: string) {
    setCart(prev => prev.filter(it => it.id !== id));
  }

  function changeQty(id: string, delta: number) {
    setCart(prev => prev.map(it => {
      if (it.id !== id) return it;
      const q = it.quantity + delta;
      return q <= 0 ? null as unknown as CartItem : { ...it, quantity: q };
    }).filter(Boolean));
  }

  const total = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

  async function handlePagar() {
    if (!customerForm.nombre.trim() || !customerForm.telefono.trim()) {
      setCheckoutError('Nombre y teléfono son obligatorios');
      return;
    }
    if (cart.length === 0) { setCheckoutError('El carrito está vacío'); return; }
    setSubmitting(true);
    setCheckoutError('');
    const token = localStorage.getItem('token');
    if (!token) { setCheckoutError('Sesión expirada'); setSubmitting(false); return; }

    let cajeroId = '';
    let cajeroEmail = '';
    try {
      const raw = sessionStorage.getItem('userData');
      if (raw) { const u = JSON.parse(raw); cajeroId = u.id ?? ''; cajeroEmail = u.email ?? ''; }
    } catch { /* fallback */ }
    if (!cajeroId) {
      try { const d = jwtDecode<{ sub?: string; email?: string }>(token); cajeroId = d.sub ?? ''; cajeroEmail = d.email ?? ''; } catch { /* ignore */ }
    }
    if (!cajeroId) { setCheckoutError('No se pudo identificar el usuario'); setSubmitting(false); return; }

    const payload = {
      cliente_email: customerForm.email || cajeroEmail || 'caja@tienda.com',
      cliente_id: cajeroId,
      cliente_nombre: customerForm.nombre,
      cliente_telefono: customerForm.telefono,
      direccion: {
        calle: customerForm.calle || 'Recogida en tienda',
        ciudad: customerForm.ciudad || TIENDA_NOMBRE,
        numero1: customerForm.numero1 || '0',
        numero2: customerForm.numero2 || undefined,
        tipo: 'ENVIO',
      },
      entrega: orderType,
      items: cart.map(it => ({
        cantidad: it.quantity,
        descuento_item: 0,
        impuesto_item: 0,
        nombre_producto_snapshot: it.name,
        notas: '',
        opciones_seleccionadas: [],
        precio_unitario_snapshot: it.price,
        producto_id: it.id,
        sku_producto_snapshot: it.sku,
        variantes_json: {},
      })),
      plataforma: 'TIENDA_FISICA',
      tienda_id: TIENDA_ID,
      tienda_nombre: TIENDA_NOMBRE,
    };
    const res = await fetch(`${PEDIDOS_API}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }).catch(() => null);
    if (res?.ok) {
      setCart([]);
      setCustomerForm({ nombre: '', email: '', telefono: '', calle: '', ciudad: '', numero1: '', numero2: '' });
      setShowCheckout(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } else {
      const data = await res?.json().catch(() => null);
      setCheckoutError(data?.detail ?? data?.message ?? 'Error al procesar el pedido');
    }
    setSubmitting(false);
  }

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col">
        <EmployeeTopBar />
        <div className="flex-1 p-4 lg:p-8">
          <h2 className="text-2xl md:text-3xl mb-6 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Cajero / Kiosko POS
          </h2>

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 flex items-center gap-2">
              <CheckCircle size={18} />
              Pedido registrado exitosamente
            </div>
          )}

          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-1 flex">
              {(['RECOGIDA', 'RETIRO_TIENDA'] as const).map(t => (
                <button key={t} onClick={() => setOrderType(t)}
                  className={`px-6 py-2 rounded-full transition ${orderType === t ? 'bg-[#D4A017] text-[#5C3D1E]' : 'text-[#5C3D1E]'}`}>
                  {t === 'RECOGIDA' ? 'PARA LLEVAR' : 'COMER ACÁ'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-[#5C3D1E] rounded-xl p-4 space-y-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.name} onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex flex-col items-center py-4 rounded-lg transition ${selectedCategory === cat.name ? 'bg-[#D4A017] text-[#5C3D1E]' : 'text-white hover:bg-white/10'}`}>
                      <Icon size={24} className="mb-2" />
                      <span className="text-sm">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {(productsByCategory[selectedCategory] ?? []).map((product) => (
                  <button key={product.id} onClick={() => addToCart(product)}
                    className="bg-white rounded-xl p-4 hover:shadow-lg transition">
                    <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-full mb-3" />
                    <p className="text-center text-[#5C3D1E] text-sm">{product.name}</p>
                    <p className="text-center text-[#D4A017] text-xs">${product.price.toLocaleString('es-CO')}</p>
                  </button>
                ))}
              </div>

              {cart.length > 0 && (
                <div className="bg-white rounded-xl p-4">
                  <h3 className="text-lg text-[#5C3D1E] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Carrito
                  </h3>
                  <div className="space-y-2 mb-4">
                    {cart.map(it => (
                      <div key={it.id} className="flex items-center justify-between text-sm text-[#5C3D1E]">
                        <span className="flex-1">{it.name}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeQty(it.id, -1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs">−</button>
                          <span className="w-6 text-center">{it.quantity}</span>
                          <button onClick={() => changeQty(it.id, 1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs">+</button>
                          <span className="w-24 text-right">${(it.price * it.quantity).toLocaleString('es-CO')}</span>
                          <button onClick={() => removeFromCart(it.id)} className="text-red-400 hover:text-red-600 ml-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 flex justify-between text-[#5C3D1E] font-medium mb-4">
                    <span>Total</span>
                    <span>${total.toLocaleString('es-CO')}</span>
                  </div>
                  <button onClick={() => setShowCheckout(true)}
                    className="w-full py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center justify-center gap-2">
                    <ShoppingCart size={18} />
                    Pagar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Datos del pedido
              </h3>
              <button onClick={() => setShowCheckout(false)}><X size={22} className="text-[#8B6F47]" /></button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Nombre cliente *</label>
                <input type="text" value={customerForm.nombre}
                  onChange={e => setCustomerForm(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Teléfono *</label>
                <input type="tel" value={customerForm.telefono}
                  onChange={e => setCustomerForm(p => ({ ...p, telefono: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Correo (opcional)</label>
                <input type="email" value={customerForm.email}
                  onChange={e => setCustomerForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              {orderType === 'RECOGIDA' && (
                <>
                  <div>
                    <label className="block text-sm mb-1 text-[#5C3D1E]">Calle</label>
                    <input type="text" value={customerForm.calle}
                      onChange={e => setCustomerForm(p => ({ ...p, calle: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-[#5C3D1E]">Ciudad</label>
                    <input type="text" value={customerForm.ciudad}
                      onChange={e => setCustomerForm(p => ({ ...p, ciudad: e.target.value }))}
                      className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="border-t pt-3 mb-4 space-y-1">
              {cart.map(it => (
                <div key={it.id} className="flex justify-between text-sm text-[#5C3D1E]">
                  <span>{it.name} x{it.quantity}</span>
                  <span>${(it.price * it.quantity).toLocaleString('es-CO')}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium text-[#5C3D1E] pt-2 border-t">
                <span>Total</span>
                <span>${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            {checkoutError && <p className="text-red-600 text-sm mb-3">{checkoutError}</p>}

            <button onClick={handlePagar} disabled={submitting}
              className="w-full py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition disabled:opacity-60 flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              {submitting ? 'Procesando...' : `Confirmar Pedido · $${total.toLocaleString('es-CO')}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
