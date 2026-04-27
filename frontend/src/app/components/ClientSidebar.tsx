'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { path: '/clients/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clients/pedidos', label: 'Mis Pedidos', icon: ClipboardList },
  { path: '/clients/reportes', label: 'Pedir', icon: ShoppingCart }
];

export function ClientSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          John's Papas
        </h2>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#D4A017]/20 border-l-4 border-[#D4A017] text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon size={20} className="mr-3" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Link
          href="/"
          className="flex items-center px-3 py-3 text-white/80 hover:bg-white/10 rounded-lg transition"
        >
          <LogOut size={20} className="mr-3" />
          <span className="text-sm">Salir</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#5C3D1E] text-white rounded-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="hidden lg:flex lg:flex-col lg:w-60 bg-[#5C3D1E] min-h-screen">
        <SidebarContent />
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 bg-[#5C3D1E] flex flex-col">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
