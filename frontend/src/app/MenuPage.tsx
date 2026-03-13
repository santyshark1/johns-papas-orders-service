'use client';

import { useState } from 'react';
import { PublicNavbar } from './components/PublicNavbar';
import { PublicFooter } from './components/PublicFooter';

const categories = ['Pizzas', 'Postres', 'Adiciones', 'Bebidas'];

const pizzas = [
  {
    name: 'Pepperoni',
    description: 'Salsa de tomate, mozzarella y abundante pepperoni',
    price: '$45.000',
    image: 'https://images.unsplash.com/photo-1762922425310-cf31b9befba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YSUyMHdvb2RlbiUyMHRhYmxlfGVufDF8fHx8MTc3MzEwMTQzNHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Hawaiana',
    description: 'Jamón, piña, mozzarella y salsa especial',
    price: '$48.000',
    image: 'https://images.unsplash.com/photo-1671572579989-fa11cbd86eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXdhaWlhbiUyMHBpenphJTIwcGluZWFwcGxlJTIwaGFtfGVufDF8fHx8MTc3MzEwMTQzNXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Champiñana',
    description: 'Champiñones frescos, cebolla y mozzarella',
    price: '$42.000',
    image: 'https://images.unsplash.com/photo-1530632789071-8543f47edb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNocm9vbSUyMHBpenphJTIwZnJlc2glMjBoZXJic3xlbnwxfHx8fDE3NzMxMDE0MzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Suprema',
    description: 'Carne, pepperoni, pimentón, cebolla y aceitunas',
    price: '$52.000',
    image: 'https://images.unsplash.com/photo-1681567604770-0dc826c870ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXByZW1lJTIwcGl6emElMjBsb2FkZWQlMjB0b3BwaW5nc3xlbnwxfHx8fDE3NzMwNTUzOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Vegetariana',
    description: 'Tomate, pimentón, cebolla, champiñones y aceitunas',
    price: '$40.000',
    image: 'https://images.unsplash.com/photo-1624633431700-b0912297c13a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwcGl6emElMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3MzA4MTY5NHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Mitad y Mitad',
    description: 'Elige dos sabores en una sola pizza',
    price: '$50.000',
    image: 'https://images.unsplash.com/photo-1645530654927-a198eff22252?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxmJTIwaGFsZiUyMHBpenphJTIwdHdvJTIwZmxhdm9yc3xlbnwxfHx8fDE3NzMxMDE0Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const postres = [
  {
    name: 'Tiramisú',
    description: 'Delicioso postre italiano con capas de café y mascarpone',
    price: '$18.000',
    image: 'https://images.unsplash.com/photo-1768225385872-03945d45a0d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aXJhbWlzdSUyMGRlc3NlcnQlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNjI5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Brownie con Helado',
    description: 'Brownie de chocolate caliente con helado de vainilla',
    price: '$16.000',
    image: 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBicm93bmllJTIwZGVzc2VydHxlbnwxfHx8fDE3NzI5ODkwMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Cheesecake',
    description: 'Suave y cremoso cheesecake con frutos rojos',
    price: '$17.000',
    image: 'https://images.unsplash.com/photo-1707528903686-91cbbe2f2985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVlc2VjYWtlJTIwc2xpY2UlMjBkZXNzZXJ0fGVufDF8fHx8MTc3MzAzMjY0MXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Helado Artesanal',
    description: 'Tres bolas de helado artesanal en sabores variados',
    price: '$14.000',
    image: 'https://images.unsplash.com/photo-1614014077943-840960ce6694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2UlMjBjcmVhbSUyMHNjb29wJTIwY29uZXxlbnwxfHx8fDE3NzMxMDI1MTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Panna Cotta',
    description: 'Postre italiano sedoso con salsa de frutos del bosque',
    price: '$15.000',
    image: 'https://images.unsplash.com/photo-1603236268617-d023914d9416?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYW5uYSUyMGNvdHRhJTIwZGVzc2VydHxlbnwxfHx8fDE3NzMwNjIzMzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const adiciones = [
  {
    name: 'Pan de Ajo',
    description: 'Crujientes tiras de pan con mantequilla de ajo y hierbas',
    price: '$10.000',
    image: 'https://images.unsplash.com/photo-1633030318854-b076ff72770f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJsaWMlMjBicmVhZCUyMGJhc2tldHxlbnwxfHx8fDE3NzMwODUwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Alitas de Pollo',
    description: 'Alitas BBQ o picantes con salsa ranch',
    price: '$22.000',
    image: 'https://images.unsplash.com/photo-1535902491948-06a40e45ed95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwd2luZ3MlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNTAwNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Ensalada César',
    description: 'Lechuga romana, crutones, parmesano y aderezo césar',
    price: '$18.000',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXNhciUyMHNhbGFkJTIwcGxhdGV8ZW58MXx8fHwxNzMzMDE4NjQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const bebidas = [
  {
    name: 'Coca Cola',
    description: 'Refresco clásico (355ml)',
    price: '$5.000',
    image: 'https://images.unsplash.com/photo-1734605641773-f2755bf7432d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2RhJTIwY29sYSUyMGJvdHRsZXxlbnwxfHx8fDE3NzMxMDI1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Limonada Natural',
    description: 'Refrescante limonada casera',
    price: '$6.000',
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW1vbmFkZSUyMGdsYXNzJTIwZnJlc2h8ZW58MXx8fHwxNzMzMDE4NjQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Cerveza Corona',
    description: 'Cerveza mexicana (330ml)',
    price: '$8.000',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWVyJTIwYm90dGxlJTIwaWNlfGVufDF8fHx8MTczMzAxODY0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Agua Mineral',
    description: 'Agua mineral (500ml)',
    price: '$4.000',
    image: 'https://images.unsplash.com/photo-1559839914-17aae19c8a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGJvdHRsZSUyMGdsYXNzfGVufDF8fHx8MTczMzAxODY0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('Pizzas');

  const getProductsByCategory = () => {
    switch (selectedCategory) {
      case 'Pizzas':
        return pizzas;
      case 'Postres':
        return postres;
      case 'Adiciones':
        return adiciones;
      case 'Bebidas':
        return bebidas;
      default:
        return pizzas;
    }
  };

  const products = getProductsByCategory();

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl text-center mb-8 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Nuestro Menú
        </h1>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition ${
                selectedCategory === category
                  ? 'bg-[#D4A017] text-[#5C3D1E]'
                  : 'bg-white text-[#5C3D1E] hover:bg-[#D4A017]/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.name} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="flex justify-center p-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-48 h-48 object-cover rounded-full"
                />
              </div>
              <div className="p-6 pt-0 text-center">
                <h3 className="text-2xl mb-2 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {product.name}
                </h3>
                <p className="text-[#8B6F47] mb-4 text-sm">
                  {product.description}
                </p>
                <p className="text-[#D4A017] text-xl">
                  {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}