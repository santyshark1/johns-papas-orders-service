'use client';

import { useEffect, useRef, useState } from 'react';
import { User, LogOut, X } from 'lucide-react';

interface EmployeeData {
  id: string;
  nombre: string;
  email: string;
  roles: string[];
}

export function EmployeeTopBar() {
  const [nombre, setNombre] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('employeeData');
    if (raw) {
      try {
        const u = JSON.parse(raw) as EmployeeData;
        setEmployeeData(u);
        setNombre(u.nombre ?? u.email ?? null);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('employeeData');
    window.location.href = '/login';
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl text-[#5C3D1E] lg:block hidden" style={{ fontFamily: 'Playfair Display, serif' }}>
          Bienvenido, {nombre ?? '....'}
        </h1>
        <div className="lg:ml-auto flex items-center space-x-3 relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(prev => !prev)}
            className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center hover:bg-[#D4A017]/80 transition"
          >
            <User size={20} className="text-[#5C3D1E]" />
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-[#5C3D1E]">Mi cuenta</span>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
              <div className="px-4 py-3 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#D4A017] flex items-center justify-center shrink-0">
                    <User size={18} className="text-[#5C3D1E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#5C3D1E] truncate">
                      {employeeData?.nombre ?? nombre ?? '—'}
                    </p>
                    <p className="text-xs text-[#8B6F47] truncate">
                      {employeeData?.email ?? '—'}
                    </p>
                    {employeeData?.roles?.length ? (
                      <p className="text-xs text-[#D4A017] truncate capitalize">
                        {employeeData.roles.join(', ')}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition text-sm"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
