'use client';

import { useState } from 'react';
import { ClientSidebar } from '../../components/ClientSidebar';
import { ClientTopBar } from '../../components/ClientTopBar';

const categories = ['Pizzas', 'Postres', 'Adiciones', 'Bebidas'];

const pizzas = [
  {
    name: 'Pepperoni',
    description: 'Salsa de tomate, mozzarella y pepperoni',
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
    name: 'Vegetariana',
    description: 'Vegetales frescos y mozzarella',
    price: '$40.000',
    image: 'https://images.unsplash.com/photo-1624633431700-b0912297c13a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFyaWFuJTIwcGl6emElMjB2ZWdldGFibGVzfGVufDF8fHx8MTc3MzA4MTY5NHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const postres = [
  {
    name: 'Tiramisu',
    description: 'Postre italiano con cafe y mascarpone',
    price: '$18.000',
    image: 'https://images.unsplash.com/photo-1768225385872-03945d45a0d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aXJhbWlzdSUyMGRlc3NlcnQlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNjI5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Brownie con Helado',
    description: 'Brownie caliente con helado de vainilla',
    price: '$16.000',
    image: 'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBicm93bmllJTIwZGVzc2VydHxlbnwxfHx8fDE3NzI5ODkwMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const adiciones = [
  {
    name: 'Pan de Ajo',
    description: 'Pan crocante con mantequilla de ajo',
    price: '$10.000',
    image: 'https://images.unsplash.com/photo-1633030318854-b076ff72770f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJsaWMlMjBicmVhZCUyMGJhc2tldHxlbnwxfHx8fDE3NzMwODUwMjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Alitas de Pollo',
    description: 'Alitas BBQ o picantes',
    price: '$22.000',
    image: 'https://images.unsplash.com/photo-1535902491948-06a40e45ed95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwd2luZ3MlMjBwbGF0ZXxlbnwxfHx8fDE3NzMwNTAwNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

const bebidas = [
  {
    name: 'Coca Cola',
    description: 'Refresco clasico 355ml',
    price: '$5.000',
    image: 'https://images.unsplash.com/photo-1734605641773-f2755bf7432d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2RhJTIwY29sYSUyMGJvdHRsZXxlbnwxfHx8fDE3NzMxMDI1MTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Limonada Natural',
    description: 'Limonada fresca de la casa',
    price: '$6.000',
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW1vbmFkZSUyMGdsYXNzJTIwZnJlc2h8ZW58MXx8fHwxNzMzMDE4NjQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

type Product = {
  name: string;
  description: string;
  price: string;
  image: string;
};

export function ClientMenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('Pizzas');

  const getProductsByCategory = (): Product[] => {
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
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <ClientSidebar />
      
      <div className="flex-1">
        <ClientTopBar />
        
        <div className="p-4 lg:p-8">
          <h2 className="text-2xl md:text-3xl mb-6 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Pedir
          </h2>
          <p className="text-sm text-[#8B6F47] mb-6">Selecciona productos y arma tu pedido rapidamente.</p>

          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition ${
                  selectedCategory === category
                    ? 'bg-[#D4A017] text-[#5C3D1E]'
                    : 'bg-white text-[#5C3D1E] hover:bg-[#D4A017]/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.name} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="flex justify-center p-6 pb-3">
                  <img src={product.image} alt={product.name} className="w-40 h-40 object-cover rounded-full" />
                </div>
                <div className="p-6 pt-0 text-center">
                  <h3 className="text-xl mb-2 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {product.name}
                  </h3>
                  <p className="text-[#8B6F47] mb-4 text-sm">{product.description}</p>
                  <p className="text-[#D4A017] text-xl mb-4">{product.price}</p>
                  <button className="w-full px-4 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition">
                    Pedir
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <button className="px-6 py-2 bg-[#5C3D1E] text-white rounded-lg hover:bg-[#5C3D1E]/90 transition">
              Confirmar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
