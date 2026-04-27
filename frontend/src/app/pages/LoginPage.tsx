'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/shared/store/authStore';

interface JwtPayload {
  sub?: string;
  nombre?: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
}

type UsuarioApiResponse = {
  id?: string;
  nombre?: string | null;
  email?: string | null;
  roles?: string[];
};

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setSession } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://usuario-service-7rbo.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError('Correo o contraseña incorrectos');
        return;
      }
      const data = await res.json();
      if (!data.access_token) {
        setError('Respuesta inválida del servidor');
        return;
      }

      let employeeData = {
        id: data.id ?? data.usuario?.id ?? '',
        nombre: data.nombre ?? data.usuario?.nombre ?? '',
        email: data.email ?? data.usuario?.email ?? email,
        roles: (data.roles ?? data.usuario?.roles ?? []) as string[],
      };
      try {
        const payload = jwtDecode<JwtPayload>(data.access_token);
        if (!employeeData.id) employeeData.id = payload.sub ?? '';
        if (!employeeData.nombre) employeeData.nombre = payload.nombre ?? '';
        if (!employeeData.email) employeeData.email = payload.email ?? email;
        if (!employeeData.roles.length) employeeData.roles = (payload.roles as string[]) ?? [];
        if (employeeData.id) {
          const profileRes = await fetch(
            `https://usuario-service-7rbo.onrender.com/usuarios/${employeeData.id}`,
            {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
                accept: 'application/json',
              },
            }
          );

          if (profileRes.ok) {
            const profile = (await profileRes.json()) as UsuarioApiResponse;
            employeeData = {
              id: profile.id ?? employeeData.id,
              nombre: profile.nombre ?? employeeData.nombre ?? '',
              email: profile.email ?? employeeData.email ?? email,
              roles: profile.roles ?? employeeData.roles ?? [],
            };
          }
        }
      } catch { /* ignore */ }
      if (!employeeData.email) employeeData.email = email;

      const allowedRoles = ['admin', 'empleado', 'cajero'];
      const hasAccess = employeeData.roles.some(r => allowedRoles.includes(r.toLowerCase()));
      if (!hasAccess) {
        setError('No tienes permisos para acceder a esta sección');
        return;
      }

      setSession(
        {
          id: String(employeeData.id || ''),
          nombre: employeeData.nombre || null,
          email: employeeData.email || null,
          roles: employeeData.roles || [],
        },
        data.access_token,
        data.refresh_token
      );

      localStorage.setItem('token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      localStorage.setItem('userData', JSON.stringify(employeeData));
      sessionStorage.setItem('employeeData', JSON.stringify(employeeData));
      router.push('/employee/dashboard');
    } catch {
      setError('Error de conexión, intenta de nuevo');
    } finally {
      setLoading(false);
    }
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
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
