import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-[#5C3D1E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              John's Papäs
            </h3>
            <p className="text-white/80 mb-4">
              La mejor pizza de la ciudad desde 1995
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Contacto
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-white/80">
                <Phone size={18} className="mr-2" />
                <span>+57 300 123 4567</span>
              </div>
              <div className="flex items-center text-white/80">
                <Mail size={18} className="mr-2" />
                <span>info@johnspapas.com</span>
              </div>
              <div className="flex items-center text-white/80">
                <MapPin size={18} className="mr-2" />
                <span>Bogotá, Colombia</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Síguenos
            </h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center hover:bg-[#D4A017]/80 transition"
              >
                <Facebook size={20} className="text-[#5C3D1E]" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center hover:bg-[#D4A017]/80 transition"
              >
                <Instagram size={20} className="text-[#5C3D1E]" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center hover:bg-[#D4A017]/80 transition"
              >
                <Twitter size={20} className="text-[#5C3D1E]" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/60">
          <p>&copy; 2026 John's Papäs. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
