import Link from 'next/link';
import { PublicNavbar } from '../components/PublicNavbar';
import { PublicFooter } from '../components/PublicFooter';

const featuredPizzas = [
  {
    name: 'Pepperoni',
    price: '$45.000',
    image: 'https://images.unsplash.com/photo-1762922425310-cf31b9befba0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXBwZXJvbmklMjBwaXp6YSUyMHdvb2RlbiUyMHRhYmxlfGVufDF8fHx8MTc3MzEwMTQzNHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Hawaiana',
    price: '$48.000',
    image: 'https://images.unsplash.com/photo-1671572579989-fa11cbd86eef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXdhaWlhbiUyMHBpenphJTIwcGluZWFwcGxlJTIwaGFtfGVufDF8fHx8MTc3MzEwMTQzNXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    name: 'Champiñana',
    price: '$42.000',
    image: 'https://images.unsplash.com/photo-1530632789071-8543f47edb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNocm9vbSUyMHBpenphJTIwZnJlc2glMjBoZXJic3xlbnwxfHx8fDE3NzMxMDE0MzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1651978595438-980213ca6d3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMG92ZW4lMjBmaXJlJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NzMxMDE0NDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Pizza hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              La mejor pizza de la ciudad
            </h1>
            <Link
              href="/menu"
              className="inline-block px-8 py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition"
            >
              Ver Menú
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Pizzas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl text-center mb-12 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Nuestras Pizzas Destacadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredPizzas.map((pizza) => (
            <div key={pizza.name} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <img
                src={pizza.image}
                alt={pizza.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-2xl mb-2 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {pizza.name}
                </h3>
                <p className="text-[#D4A017] text-xl">
                  {pizza.price}
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
