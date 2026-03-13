# 💻 Frontend - Portal Administrativo

Portal administrativo para gestión de órdenes construido con Next.js, TypeScript y Tailwind CSS.

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación Local

```bash
# 1. Navegar a la carpeta del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env.local
cp .env.example .env.local

# 4. Ejecutar servidor de desarrollo
npm run dev
```

El portal estará disponible en: **http://localhost:3000**

### Con Docker

```bash
# Desde la raíz del proyecto
docker-compose up frontend
```

---

## 📚 Páginas Principales

- `/` - Dashboard principal
- `/login` - Login de usuario
- `/orders` - Listado de órdenes
- `/orders/[id]` - Detalles de orden
- `/orders/new` - Crear nueva orden
- `/users` - Gestión de usuarios (admin)
- `/reports` - Reportes y analíticas

---

## 📁 Estructura de Carpetas

```
frontend/
├── src/
│   ├── app/                    # Rutas de Next.js (App Router)
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Home/Dashboard
│   │   ├── login/
│   │   ├── orders/
│   │   ├── users/
│   │   └── api/                # Route handlers (opcional)
│   │
│   ├── components/             # Componentes reutilizables
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── OrderForm.tsx
│   │   ├── OrderCard.tsx
│   │   ├── Loading.tsx
│   │   └── ...
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useOrders.ts
│   │   └── ...
│   │
│   ├── services/               # Servicios API
│   │   ├── api.ts              # Cliente HTTP (Axios)
│   │   ├── authService.ts
│   │   ├── ordersService.ts
│   │   └── ...
│   │
│   ├── store/                  # Estado global (Zustand)
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── ...
│   │
│   ├── types/                  # TypeScript types
│   │   ├── order.ts
│   │   ├── user.ts
│   │   └── ...
│   │
│   ├── styles/                 # Estilos globales
│   │   └── globals.css
│   │
│   └── lib/                    # Utilidades
│       ├── constants.ts
│       ├── utils.ts
│       └── ...
│
├── public/                     # Archivos estáticos
│   ├── images/
│   └── ...
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── .env.example
└── README.md
```

---

## 🎨 Tecnologías

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos
- **TanStack Query** - Gestión de estado remoto (datos del servidor)
- **Zustand** - Gestión de estado global (auth, UI)
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Axios** - Cliente HTTP
- **NextAuth.js** - Autenticación (opcional)

---

## 🔐 Autenticación

El frontend se conecta con el backend JWT:

```typescript
// services/authService.ts
export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login/', { username, password });
  return response.data;
};

// Guardar token en localStorage
// useAuth hook maneja el estado
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Con modo watch
npm run test -- --watch

# Con cobertura
npm run test:coverage
```

---

## 📊 Gestión de Estado

### Global State (Zustand)
```typescript
// store/authStore.ts
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
```

### Remote State (TanStack Query)
```typescript
// hooks/useOrders.ts
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: ordersService.getAll,
  });
};
```

---

## 🔌 Comunicación con Backend

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 📝 Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

---

## 🚀 Build para Producción

```bash
# Build
npm run build

# Ejecutar
npm run start
```

---

## 🐛 Troubleshooting

### Error CORS
Asegurate que `NEXT_PUBLIC_API_URL` en `.env.local` sea correcto y que el backend tenga CORS habilitado.

### Token no persiste
Verifica que el navegador permita localStorage.

---

## 📚 Documentación Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com)

---

**Última actualización**: 2026-03-13