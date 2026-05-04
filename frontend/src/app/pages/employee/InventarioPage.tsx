'use client';

import { useState } from 'react';
import { EmployeeSidebar } from '../../components/EmployeeSidebar';
import { EmployeeTopBar } from '../../components/EmployeeTopBar';
import { Plus, Edit, Package, X, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import {
  useIngredientes,
  useCreateIngrediente,
  useUpdateIngrediente,
} from '@/services/inventario/useInventario';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/api';
import { Ingrediente } from '@/shared/types/api';

interface FormData {
  nombre: string;
  stock_actual: number;
  costo_unitario: number;
}

function getStatus(stock: number, minimo: number = 30) {
  if (stock === 0) return 'Agotado';
  if (stock < minimo) return 'Stock bajo';
  return 'Disponible';
}

const statusColors: Record<string, string> = {
  'Disponible': 'bg-green-100 text-green-800',
  'Stock bajo': 'bg-yellow-100 text-yellow-800',
  'Agotado': 'bg-red-100 text-red-800',
};

const emptyForm: FormData = { nombre: '', stock_actual: 0, costo_unitario: 0 };

export function InventarioPage() {
  const queryClient = useQueryClient();
  const { data: ingredientes = [], isLoading, error } = useIngredientes();
  const createMutation = useCreateIngrediente();
  const updateMutation = useUpdateIngrediente();

  function handleRetry() {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ingredientes.lists() });
  }

  // Estado del formulario
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Ingrediente | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(ingrediente: Ingrediente) {
    setEditing(ingrediente);
    setForm({
      nombre: ingrediente.nombre,
      stock_actual: ingrediente.stock_actual,
      costo_unitario: ingrediente.costo_unitario,
    });
    setFormError(null);
    setShowModal(true);
  }

  async function handleSave() {
    setFormError(null);

    // Validación
    if (!form.nombre.trim()) {
      setFormError('El nombre es requerido');
      return;
    }

    if (form.stock_actual < 0) {
      setFormError('El stock no puede ser negativo');
      return;
    }

    try {
      if (editing) {
        // Actualizar
        await updateMutation.mutateAsync({
          ingredienteId: editing.id,
          data: {
            stock_actual: form.stock_actual,
            costo_unitario: form.costo_unitario,
          },
        });
      } else {
        // Crear
        await createMutation.mutateAsync({
          nombre: form.nombre,
          stock_actual: form.stock_actual,
          costo_unitario: form.costo_unitario,
        });
      }
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Error al guardar ingrediente'
      );
    }
  }

  const stockBajo = ingredientes.filter(
    (it) => getStatus(it.stock_actual) === 'Stock bajo'
  ).length;
  const agotado = ingredientes.filter(
    (it) => getStatus(it.stock_actual) === 'Agotado'
  ).length;

  return (
    <div className="flex min-h-screen bg-[#FDF6EC]">
      <EmployeeSidebar />
      <div className="flex-1">
        <EmployeeTopBar />
        <div className="p-4 lg:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Inventario
            </h2>
            <button
              onClick={openAdd}
              disabled={isLoading}
              className="px-6 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center disabled:opacity-50"
            >
              <Plus size={20} className="mr-2" />
              Agregar Item
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-medium text-red-900">Error al cargar inventario</p>
                <p className="text-sm text-red-700">{error instanceof Error ? error.message : 'Error desconocido'}</p>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex-shrink-0"
              >
                <RefreshCw size={14} />
                Reintentar
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader className="animate-spin text-[#D4A017]" size={24} />
                <p className="text-[#5C3D1E]">Cargando inventario...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="text-blue-500" size={32} />
                    <span className="text-3xl text-[#5C3D1E]">{ingredientes.length}</span>
                  </div>
                  <p className="text-sm text-[#8B6F47]">Total productos</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="text-yellow-500" size={32} />
                    <span className="text-3xl text-[#5C3D1E]">{stockBajo}</span>
                  </div>
                  <p className="text-sm text-[#8B6F47]">Stock bajo</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="text-red-500" size={32} />
                    <span className="text-3xl text-[#5C3D1E]">{agotado}</span>
                  </div>
                  <p className="text-sm text-[#8B6F47]">Agotados</p>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {ingredientes.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-[#8B6F47]">No hay ingredientes registrados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#FDF6EC]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Stock Actual</th>
                          <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Costo Unitario</th>
                          <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs text-[#5C3D1E] uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {ingredientes.map((ingrediente) => {
                          const st = getStatus(ingrediente.stock_actual);
                          return (
                            <tr key={ingrediente.id} className="hover:bg-[#FDF6EC]/50">
                              <td className="px-6 py-4 text-sm text-[#5C3D1E] font-medium">{ingrediente.nombre}</td>
                              <td className="px-6 py-4 text-sm text-[#5C3D1E]">{ingrediente.stock_actual}</td>
                              <td className="px-6 py-4 text-sm text-[#5C3D1E]">${ingrediente.costo_unitario.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs ${statusColors[st]}`}>{st}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => openEdit(ingrediente)}
                                    className="text-[#D4A017] hover:text-[#D4A017]/80 disabled:opacity-50"
                                    disabled={updateMutation.isPending}
                                  >
                                    <Edit size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {editing ? 'Editar Ingrediente' : 'Agregar Ingrediente'}
              </h3>
              <button onClick={() => setShowModal(false)} disabled={createMutation.isPending || updateMutation.isPending}>
                <X size={22} className="text-[#8B6F47]" />
              </button>
            </div>

            {/* Form Error */}
            {formError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-[#5C3D1E]">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC] disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1 text-[#5C3D1E]">Stock Actual</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.stock_actual}
                    onChange={(e) => setForm({ ...form, stock_actual: Number(e.target.value) })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC] disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[#5C3D1E]">Costo Unitario</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.costo_unitario}
                    onChange={(e) => setForm({ ...form, costo_unitario: Number(e.target.value) })}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC] disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader size={16} className="animate-spin" />
                )}
                {editing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
