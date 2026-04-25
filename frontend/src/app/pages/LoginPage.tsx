'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push('/employee/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#8B6F47] hover:text-[#D4A017] transition"
          >
            <ArrowLeft size={20} />
            <span>Volver al inicio</span>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            John's Papäs
          </h1>
          <h2 className="text-xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Acceso Empleados
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm mb-2 text-[#5C3D1E]">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-2 text-[#5C3D1E]">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition"
          >
            Ingresar
          </button>
          <div className="text-center">
            <a href="#" className="text-sm text-[#8B6F47] hover:text-[#D4A017] transition">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}