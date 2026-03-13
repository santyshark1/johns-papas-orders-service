'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              John's Papäs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/menu" className="text-[#5C3D1E] hover:text-[#D4A017] transition">
              Menú
            </Link>
            <Link href="/puntos" className="text-[#5C3D1E] hover:text-[#D4A017] transition">
              Nuestros Puntos
            </Link>
            <Link
              href="/login"
              className="px-6 py-2 border-2 border-[#D4A017] text-[#D4A017] rounded-lg hover:bg-[#D4A017] hover:text-[#5C3D1E] transition"
            >
              Acceso Empleados
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#5C3D1E]"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              href="/menu"
              className="block text-[#5C3D1E] hover:text-[#D4A017] transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Menú
            </Link>
            <Link
              href="/puntos"
              className="block text-[#5C3D1E] hover:text-[#D4A017] transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Nuestros Puntos
            </Link>
            <Link
              href="/login"
              className="block px-6 py-2 border-2 border-[#D4A017] text-[#D4A017] rounded-lg text-center hover:bg-[#D4A017] hover:text-[#5C3D1E] transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Acceso Empleados
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
