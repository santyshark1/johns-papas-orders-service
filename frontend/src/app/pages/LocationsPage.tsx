import { MapPin, Phone, Clock } from 'lucide-react';
import { PublicNavbar } from '../components/PublicNavbar';
import { PublicFooter } from '../components/PublicFooter';

const locations = [
  {
    name: 'John\'s Papäs - Chapinero',
    address: 'Cra. 13 #62-31, Bogotá',
    phone: '+57 300 123 4567',
    schedule: 'Lun-Dom: 11:00 AM - 10:00 PM',
  },
  {
    name: 'John\'s Papäs - Unicentro',
    address: 'Av. 15 #123-30, Bogotá',
    phone: '+57 300 234 5678',
    schedule: 'Lun-Dom: 12:00 PM - 11:00 PM',
  },
  {
    name: 'John\'s Papäs - Zona T',
    address: 'Calle 82 #12-54, Bogotá',
    phone: '+57 300 345 6789',
    schedule: 'Lun-Dom: 11:30 AM - 10:30 PM',
  },
];

export function LocationsPage() {
  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl text-center mb-8 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
          Nuestros Puntos
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Locations List */}
          <div className="lg:col-span-1 space-y-4">
            {locations.map((location, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl mb-4 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {location.name}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <MapPin size={18} className="mr-2 mt-1 text-[#D4A017] flex-shrink-0" />
                    <span className="text-[#5C3D1E]">{location.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone size={18} className="mr-2 text-[#D4A017] flex-shrink-0" />
                    <span className="text-[#5C3D1E]">{location.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-[#D4A017] flex-shrink-0" />
                    <span className="text-[#5C3D1E]">{location.schedule}</span>
                  </div>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition">
                  Cómo llegar
                </button>
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[600px]">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin size={64} className="mx-auto mb-4" />
                  <p className="text-lg">Mapa de ubicaciones</p>
                  <p className="text-sm">Google Maps Integration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
