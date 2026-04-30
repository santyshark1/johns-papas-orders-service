'use client';

import { useEffect, useState } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { Plus, Edit, Trash2, Search, User, X, RefreshCw } from 'lucide-react';

const USUARIO_API = 'https://usuario-service-7rbo.onrender.com';

interface Empleado {
  id?: string;
  nombre?: string;
  name?: string;
  email: string;
  roles?: string[];
  telefono?: string;
  activo?: boolean;
  active?: boolean;
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  empleado: 'bg-blue-100 text-blue-800',
  cajero: 'bg-green-100 text-green-800',
};

const emptyForm = { nombre: '', email: '', roles: 'empleado', telefono: '', password: '', confirmPassword: '' };

export function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function token() { return localStorage.getItem('token') ?? ''; }

  async function load() {
    setLoading(true);
    setError('');
    const res = await fetch(`${USUARIO_API}/usuarios`, {
      headers: { Authorization: `Bearer ${token()}` },
    }).catch(() => null);
    if (res?.ok) {
      try {
        const data = await res.json();
        setEmpleados(Array.isArray(data) ? data : (data.items ?? data.data ?? data.users ?? []));
      } catch {
        setError('Error al procesar la respuesta del servidor');
      }
    } else {
      setError('No se pudieron cargar los empleados');
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(e: Empleado) {
    setEditingId(e.id ?? e.email);
    setForm({
      nombre: e.nombre ?? e.name ?? '',
      email: e.email,
      roles: e.roles?.[0] ?? 'empleado',
      telefono: e.telefono ?? '',
      password: '',
      confirmPassword: '',
    });
    setFormError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.nombre.trim() || !form.email.trim()) { setFormError('Nombre y correo son obligatorios'); return; }
    if (!editingId && !form.password) { setFormError('La contraseña es obligatoria'); return; }
    if (form.password && form.password !== form.confirmPassword) { setFormError('Las contraseñas no coinciden'); return; }
    setSaving(true);
    setFormError('');

    const body: Record<string, unknown> = {
      nombre: form.nombre,
      email: form.email,
      roles: [form.roles],
      telefono: form.telefono,
    };
    if (form.password) body.password = form.password;

    let res: Response | null = null;
    if (editingId) {
      res = await fetch(`${USUARIO_API}/usuarios/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      }).catch(() => null);
    } else {
      res = await fetch(`${USUARIO_API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      }).catch(() => null);
    }

    if (res?.ok) {
      setShowModal(false);
      load();
    } else {
      const data = await res?.json().catch(() => null);
      setFormError(data?.detail ?? data?.message ?? 'Error al guardar');
    }
    setSaving(false);
  }

  async function handleDelete(e: Empleado) {
    if (!confirm(`¿Eliminar a ${e.nombre ?? e.name ?? e.email}?`)) return;
    const res = await fetch(`${USUARIO_API}/usuarios/${e.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    }).catch(() => null);
    if (res?.ok) {
      setEmpleados(prev => prev.filter(x => x.id !== e.id));
    }
  }

  const filtered = empleados.filter(e => {
    const name = (e.nombre ?? e.name ?? '').toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'Todos' || e.roles?.some(r => r.toLowerCase() === filterRole.toLowerCase());
    return matchSearch && matchRole;
  });

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      <div className="flex-1">
        <EmployeeTopBar />
        <div className="p-4 lg:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Gestionar Empleados
            </h2>
            <div className="flex gap-2">
              <button onClick={load} className="px-4 py-2 bg-white border border-gray-200 text-[#5C3D1E] rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <RefreshCw size={16} />
              </button>
              <button onClick={openAdd} className="px-6 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center">
                <Plus size={20} className="mr-2" />
                Agregar Empleado
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47]" size={20} />
              <input type="text" placeholder="Buscar empleado..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-white"
              />
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
              className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-white">
              <option value="Todos">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="empleado">Empleado</option>
              <option value="cajero">Cajero</option>
            </select>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex justify-between">
              {error}
              <button onClick={load} className="underline">Reintentar</button>
            </div>
          )}

          {loading ? (
            <p className="text-center text-[#8B6F47] py-12">Cargando...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((e, i) => (
                <div key={e.id ?? i} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-full bg-[#D4A017] flex items-center justify-center">
                      <User size={32} className="text-[#5C3D1E]" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${e.activo === false || e.active === false ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {e.activo === false || e.active === false ? 'Inactivo' : 'Activo'}
                    </span>
                  </div>
                  <h3 className="text-lg mb-1 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {e.nombre ?? e.name ?? '—'}
                  </h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(e.roles ?? []).map(r => (
                      <span key={r} className={`px-2 py-0.5 rounded-full text-xs ${roleColors[r.toLowerCase()] ?? 'bg-gray-100 text-gray-700'}`}>
                        {r}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-[#8B6F47]">{e.email}</p>
                    {e.telefono && <p className="text-sm text-[#8B6F47]">{e.telefono}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(e)}
                      className="flex-1 px-4 py-2 bg-[#5C3D1E] text-white rounded-lg hover:bg-[#5C3D1E]/90 transition flex items-center justify-center">
                      <Edit size={16} className="mr-2" />
                      Editar
                    </button>
                    {e.id && (
                      <button onClick={() => handleDelete(e)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-3 text-center text-[#8B6F47] py-8">Sin empleados</p>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {editingId ? 'Editar Empleado' : 'Agregar Empleado'}
              </h3>
              <button onClick={() => setShowModal(false)}><X size={22} className="text-[#8B6F47]" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Nombre Completo</label>
                <input type="text" value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Correo Electrónico</label>
                <input type="email" value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Rol</label>
                <select value={form.roles} onChange={e => setForm(p => ({ ...p, roles: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]">
                  <option value="admin">Admin</option>
                  <option value="empleado">Empleado</option>
                  <option value="cajero">Cajero</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Teléfono</label>
                <input type="tel" value={form.telefono}
                  onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">
                  Contraseña {editingId && <span className="text-[#8B6F47] font-normal">(dejar vacío para no cambiar)</span>}
                </label>
                <input type="password" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Confirmar Contraseña</label>
                <input type="password" value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              {formError && <p className="text-red-600 text-sm">{formError}</p>}
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
