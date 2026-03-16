'use client';

import { useState } from 'react';
import { EmployeeSidebar } from '../components/EmployeeSidebar';
import { EmployeeTopBar } from '../components/EmployeeTopBar';
import { Plus, Edit, Trash2, Search, User, X } from 'lucide-react';

const employees = [
  { name: 'Juan Pérez', role: 'Administrador', email: 'juan@johnspapas.com', phone: '+57 300 123 4567', active: true },
  { name: 'María García', role: 'Cajero', email: 'maria@johnspapas.com', phone: '+57 300 234 5678', active: true },
  { name: 'Carlos López', role: 'Domiciliario', email: 'carlos@johnspapas.com', phone: '+57 300 345 6789', active: true },
  { name: 'Ana Martínez', role: 'Cajero', email: 'ana@johnspapas.com', phone: '+57 300 456 7890', active: false },
  { name: 'Pedro Ramírez', role: 'Administrador', email: 'pedro@johnspapas.com', phone: '+57 300 567 8901', active: true },
  { name: 'Laura Sánchez', role: 'Domiciliario', email: 'laura@johnspapas.com', phone: '+57 300 678 9012', active: true },
];

const roleColors: Record<string, string> = {
  'Administrador': 'bg-purple-100 text-purple-800',
  'Cajero': 'bg-blue-100 text-blue-800',
  'Domiciliario': 'bg-green-100 text-green-800',
};

export function EmpleadosPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Todos');

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
            <button 
              onClick={() => setShowModal(true)}
              className="px-6 py-2 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Agregar Empleado
            </button>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47]" size={20} />
              <input
                type="text"
                placeholder="Buscar empleado..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-white"
              />
            </div>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-white"
            >
              <option value="Todos">Todos los roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Cajero">Cajero</option>
              <option value="Domiciliario">Domiciliario</option>
            </select>
          </div>

          {/* Employee Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#D4A017] flex items-center justify-center">
                    <User size={32} className="text-[#5C3D1E]" />
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={employee.active} readOnly />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A017]"></div>
                  </label>
                </div>
                
                <h3 className="text-lg mb-2 text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {employee.name}
                </h3>
                
                <span className={`inline-block px-3 py-1 rounded-full text-xs mb-3 ${roleColors[employee.role]}`}>
                  {employee.role}
                </span>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-[#8B6F47]">{employee.email}</p>
                  <p className="text-sm text-[#8B6F47]">{employee.phone}</p>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-[#5C3D1E] text-white rounded-lg hover:bg-[#5C3D1E]/90 transition flex items-center justify-center">
                    <Edit size={16} className="mr-2" />
                    Editar
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl text-[#5C3D1E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Agregar Empleado
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#8B6F47]">
                <X size={24} />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-[#5C3D1E]">Nombre Completo</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-[#5C3D1E]">Correo Electrónico</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-[#5C3D1E]">Rol</label>
                <select className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]">
                  <option value="">Seleccionar rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Domiciliario">Domiciliario</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-[#5C3D1E]">Teléfono</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-[#5C3D1E]">Contraseña</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-[#5C3D1E]">Confirmar Contraseña</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D4A017] focus:outline-none bg-[#FDF6EC]"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-[#D4A017] text-[#5C3D1E] rounded-lg hover:bg-[#D4A017]/90 transition"
              >
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
