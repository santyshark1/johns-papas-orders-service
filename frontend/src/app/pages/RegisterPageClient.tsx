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

export function RegisterPageClient() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setSession } = useAuthStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://usuario-service-7rbo.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ nombre, email, password, confirm_password: confirmPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.detail ?? 'Error al registrar, intenta de nuevo');
        return;
      }
      const registerResponse = (await res.json().catch(() => ({}))) as UsuarioApiResponse;

      // El endpoint de registro solo devuelve el usuario, así que hacemos login automático.
      const loginRes = await fetch('https://usuario-service-7rbo.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        setError('Registro creado, pero no fue posible iniciar sesión automáticamente');
        return;
      }

      const loginData = await loginRes.json();
      const payload = loginData.access_token ? jwtDecode<JwtPayload>(loginData.access_token) : null;

      let userData = {
        id: registerResponse.id ?? payload?.sub ?? '',
        nombre: registerResponse.nombre ?? payload?.nombre ?? nombre,
        email: registerResponse.email ?? payload?.email ?? email,
        roles: registerResponse.roles ?? payload?.roles ?? [],
      };

      if (userData.id && loginData.access_token) {
        const profileRes = await fetch(
          `https://usuario-service-7rbo.onrender.com/usuarios/${userData.id}`,
          {
            headers: {
              Authorization: `Bearer ${loginData.access_token}`,
              accept: 'application/json',
            },
          }
        );

        if (profileRes.ok) {
          const profile = (await profileRes.json()) as UsuarioApiResponse;
          userData = {
            id: profile.id ?? userData.id,
            nombre: profile.nombre ?? userData.nombre ?? nombre,
            email: profile.email ?? userData.email ?? email,
            roles: profile.roles ?? userData.roles ?? [],
          };
        }
      }

      setSession(
        {
          id: String(userData.id || ''),
          nombre: userData.nombre || null,
          email: userData.email || null,
          roles: userData.roles || [],
        },
        loginData.access_token,
        loginData.refresh_token
      );

      localStorage.setItem('userData', JSON.stringify(userData));
      sessionStorage.setItem('userData', JSON.stringify(userData));
      router.push('/clients/dashboard');
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
            href="/clients"
            className="inline-flex items-center gap-2 text-[#8B6F47] hover:text-[#D4A017] transition"
          >
            <ArrowLeft size={20} />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            John's Papäs
          </h1>
          <h2 className="text-xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Crear cuenta
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nombre" className="block text-sm mb-2 text-[#5C3D1E]">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              placeholder="Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
            />
          </div>

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
              required
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
                required
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

          <div>
            <label htmlFor="confirm_password" className="block text-sm mb-2 text-[#5C3D1E]">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47]"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition disabled:opacity-60"
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
