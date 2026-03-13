'use client';

import { useState } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { Pizza, Cake, Plus, Coffee, ShoppingCart } from 'lucide-react';

const categories = [
  { name: 'Pizzas', icon: Pizza },
  { name: 'Postres', icon: Cake },
  { name: 'Adiciones', icon: Plus },
  { name: 'Bebidas', icon: Coffee },
];

const sizes = ['8"', '10"', '12"', '14"', '16"'];

const pizzas = [
  {
    name: 'Pepperoni',
    image: 'https://images.unsplash.com/photo-1762922425310-cf31b9befba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YSUyMHdvb2RlbiUyMHRhYmxlfGVufDF8fHx8MTc3MzEwMTQzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 45000,
  },
  {
    name: 'Hawaiana',
    image: 'https://images.unsplash.com/photo-1671572579989-fa11cbd86eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXdhaWlhbiUyMHBpenphJTIwcGluZWFwcGxlJTIwaGFtfGVufDF8fHx8MTc3MzEwMTQzNXww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 48000,
  },
  {
    name: 'Champiñana',
    image: 'https://images.unsplash.com/photo-1530632789071-8543f47edb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNocm9vbSUyMHBpenphJTIwZnJlc2glMjBoZXJic3xlbnwxfHx8fDE3NzMxMDE0MzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 42000,
  },
  {
    name: 'Suprema',
    image: 'https://images.unsplash.com/photo-1681567604770-0dc826c870ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXByZW1lJTIwcGl6emElMjBsb2FkZWQlMjB0b3BwaW5nc3xlbnwxfHx8fDE3NzMwNTUzOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 52000,
  },
  {
    name: 'Vegetariana',
    image: 'https://images.unsplash.com/photo-1624633431700-b0912297c13a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwcGl6emElMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3MzA4MTY5NHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: 40000,
  },
  {
    name: 'Mitad y Mitad',
    image: 'https://images.unsplash.com/photo-1645530654927-a198eff22252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxmJTIwaGFsZiUyMHBpenphJTIwdHdvJTIwZmxhdm9yc3xlbnwxfHx8fDE3NzMxMDE0Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: 50000,
  },
];

export function CajeroPage() {
  const [orderType, setOrderType] = useState<'llevar' | 'comer'>('llevar');
  const [selectedSize, setSelectedSize] = useState('12"');
  const [selectedCategory, setSelectedCategory] = useState('Pizzas');
  const [cart, setCart] = useState<Array<{ name: string; quantity: number; price: number }>>([]);

  const addToCart = (pizza: { name: string; price: number }) => {
    const existingItem = cart.find((item) => item.name === pizza.name);
    if (existingItem) {
      setCart(cart.map((item) =>
        item.name === pizza.name ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...pizza, quantity: 1 }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      
      <div className="flex-1 flex flex-col">
        <EmployeeTopBar />
        
        <div className="flex-1 p-4 lg:p-8">
          <h2 className="text-2xl md:text-3xl mb-6 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Cajero / Kiosko POS
          </h2>

          {/* Order Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-1 flex">
              <button
                onClick={() => setOrderType('llevar')}
                className={`px-6 py-2 rounded-full transition ${
                  orderType === 'llevar' ? 'bg-[#D4A017] text-[#5C3D1E]' : 'text-[#5C3D1E]'
                }`}
              >
                PARA LLEVAR
              </button>
              <button
                onClick={() => setOrderType('comer')}
                className={`px-6 py-2 rounded-full transition ${
                  orderType === 'comer' ? 'bg-[#D4A017] text-[#5C3D1E]' : 'text-[#5C3D1E]'
                }`}
              >
                COMER ACÁ
              </button>
            </div>
          </div>

          {/* Size Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-5 py-2 rounded-full transition ${
                  selectedSize === size
                    ? 'bg-[#5C3D1E] text-white'
                    : 'bg-white text-[#5C3D1E] hover:bg-[#5C3D1E]/10'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#5C3D1E] rounded-xl p-4 space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex flex-col items-center py-4 rounded-lg transition ${
                        selectedCategory === category.name
                          ? 'bg-[#D4A017] text-[#5C3D1E]'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={24} className="mb-2" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {pizzas.map((pizza) => (
                  <button
                    key={pizza.name}
                    onClick={() => addToCart(pizza)}
                    className="bg-white rounded-xl p-4 hover:shadow-lg transition"
                  >
                    <img
                      src={pizza.image}
                      alt={pizza.name}
                      className="w-full aspect-square object-cover rounded-full mb-3"
                    />
                    <p className="text-center text-[#5C3D1E]">{pizza.name}</p>
                  </button>
                ))}
              </div>

              {/* Bottom Bar */}
              <div className="bg-white rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
                <button className="px-6 py-3 bg-[#5C3D1E] text-white rounded-lg hover:bg-[#5C3D1E]/90 transition">
                  Continuar
                </button>
                <button className="px-6 py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center">
                  <ShoppingCart size={20} className="mr-2" />
                  Pagar ({cart.length})
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary (shown when cart has items) */}
          {cart.length > 0 && (
            <div className="mt-6 bg-white rounded-xl p-6">
              <h3 className="text-xl mb-4 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Resumen del Pedido
              </h3>
              <div className="space-y-2 mb-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-[#5C3D1E]">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl text-[#5C3D1E]">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
