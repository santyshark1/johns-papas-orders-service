'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  UtensilsCrossed,
  Package,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const PEDIDOS_API = 'https://pedidos-service-bwn3.onrender.com';

const menuItems = [
  { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employee/cajero', label: 'Cajero', icon: ShoppingCart },
  { path: '/employee/pedidos', label: 'Pedidos', icon: ClipboardList },
  { path: '/employee/menu-admin', label: 'Menú', icon: UtensilsCrossed },
  { path: '/employee/inventario', label: 'Inventario', icon: Package },
  { path: '/employee/reportes', label: 'Reportes', icon: BarChart3 },
  { path: '/employee/empleados', label: 'Gestionar Empleados', icon: Users },
];

export function EmployeeSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${PEDIDOS_API}/pedidos`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        const arr: { estado?: string }[] = Array.isArray(data) ? data : (data.items ?? data.data ?? []);
        setPendingCount(arr.filter(o => o.estado?.toUpperCase() === 'PENDIENTE').length);
      })
      .catch(() => {});
  }, []);

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          John's Papäs
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
              <span className="text-sm flex-1">{item.label}</span>
              {item.path === '/employee/pedidos' && pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 font-bold">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#5C3D1E] text-white rounded-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 bg-[#5C3D1E] min-h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
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
