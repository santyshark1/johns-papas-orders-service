import { User } from 'lucide-react';

export function ClientTopBar() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl text-[#5C3D1E] lg:block hidden" style={{ fontFamily: 'Playfair Display, serif' }}>
          Bienvenido, Cliente
        </h1>
        <div className="lg:ml-auto flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#D4A017] flex items-center justify-center">
            <User size={20} className="text-[#5C3D1E]" />
          </div>
        </div>
      </div>
    </div>
  );
}
