/**
 * GUÍA RÁPIDA: Refactoring de páginas para usar React Query
 * 
 * Este archivo documenta patrones y cambios necesarios para actualizar
 * las páginas restantes con hooks de React Query
 */

// ============================================================================
// PATRÓN 1: Componente simple que lista datos
// ============================================================================

// ❌ ANTES (Mock data + useState)
// const [items, setItems] = useState<Item[]>(initialItems);

// ✅ DESPUÉS (React Query hook)
// import { useIngredientes } from '@/services/inventario/useInventario';
// const { data: items = [], isLoading, error } = useIngredientes();

// ============================================================================
// PATRÓN 2: Componente que crea/edita datos
// ============================================================================

// ❌ ANTES (Manual fetch)
// const response = await fetch('/api/ingredientes', {
//   method: 'POST',
//   body: JSON.stringify(data)
// });

// ✅ DESPUÉS (Mutation hook)
// const { mutateAsync: createIngrediente } = useCreateIngrediente();
// await createIngrediente({ nombre: '...', stock_actual: 0 });

// ============================================================================
// PATRÓN 3: Manejo de estados loading/error
// ============================================================================

// ✅ SIEMPRE incluir en componentes:
// if (isLoading) return <LoadingSpinner />;
// if (error) return <ErrorAlert error={error} />;
// if (!data?.length) return <EmptyState />;

// ============================================================================
// PÁGINAS PENDIENTES DE REFACTORING
// ============================================================================

export const PAGES_TO_REFACTOR = {
  ReportesPage: {
    path: 'src/app/pages/employee/ReportesPage.tsx',
    changes: [
      'Reemplazar hardcoded chartData por useVentasResumen()',
      'Reemplazar totalVentas por datos de useVentas()',
      'Agregar filtros de fecha que fluyan a useVentas()',
      'Agregar loading y error states',
    ],
    hooks: ['useVentasResumen', 'useVentas', 'useResumenInventario'],
  },

  ReportesClientPage: {
    path: 'src/app/pages/client/ReportesClientPage.tsx',
    changes: [
      'Similar a ReportesPage pero filtrado por usuario actual',
      'Usar useAuditoria(filters) para historial personal',
      'Mostrar solo órdenes del usuario autenticado',
    ],
    hooks: ['useVentas', 'useAuditoria', 'useAuthUser'],
  },

  EmpleadosPage: {
    path: 'src/app/pages/employee/EmpleadosPage.tsx',
    changes: [
      'Reemplazar fetch() directo por useUsuarios()',
      'Usar useCreateUser para crear nuevos empleados',
      'Usar useUpdateUserRoles para asignar roles',
      'Usar useDeleteUser para eliminar empleados',
      'Agregar loading y error states en tabla y modal',
    ],
    hooks: ['useUsuarios', 'useCreateUser', 'useUpdateUserRoles', 'useDeleteUser'],
  },

  PedidosPages: {
    path: [
      'src/app/pages/client/PedidosClientPage.tsx',
      'src/app/pages/employee/PedidosCajeroPage.tsx',
    ],
    changes: [
      'Usar usePedidos(filters) para listar órdenes',
      'Usar usePedidoById para detalles',
      'Usar useUpdatePedidoEstado para cambiar estado',
      'Usar useCreatePedido para crear nueva orden',
      'Integrar con useDescontarStock cuando se crea orden',
    ],
    hooks: ['usePedidos', 'usePedidoById', 'useCreatePedido', 'useUpdatePedidoEstado'],
  },

  LoginPage: {
    path: 'src/app/pages/LoginPageClient.tsx',
    changes: [
      'Reemplazar fetch() directo por useLogin() hook',
      'El hook maneja automáticamente setSession y redirección',
      'Agregar error handling y loading states',
    ],
    hooks: ['useLogin', 'useIsAuthenticated'],
  },

  RegisterPage: {
    path: 'src/app/pages/RegisterPageClient.tsx',
    changes: [
      'Reemplazar fetch() directo por useRegister() hook',
      'El hook maneja automáticamente setSession y redirección',
      'Validar que passwords coincidan antes de llamar hook',
    ],
    hooks: ['useRegister'],
  },
};

// ============================================================================
// TEMPLATE: Componente actualizado con React Query
// ============================================================================

export const COMPONENT_TEMPLATE = `
'use client';

import { useVentas, useVentasResumen } from '@/services/reportes/useReportes';
import { AlertCircle, Loader } from 'lucide-react';

export function ReportesPage() {
  // Queries
  const { data: ventas = [], isLoading, error } = useVentas();
  const { data: resumen } = useVentasResumen();

  // Error boundary
  if (error) {
    return (
      <div className="p-6 bg-red-100 rounded-lg flex gap-3">
        <AlertCircle className="text-red-600" />
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin mr-3" />
        <span>Cargando reportes...</span>
      </div>
    );
  }

  // Empty state
  if (!ventas.length) {
    return <div className="p-6 text-center text-gray-500">No hay datos disponibles</div>;
  }

  // Render component with real data
  return (
    <div>
      {/* Use ventas data here */}
      <p>Total: {resumen?.total_ventas}</p>
    </div>
  );
}
`;

// ============================================================================
// CHECKLIST PARA REFACTORING
// ============================================================================

export const REFACTOR_CHECKLIST = {
  imports: [
    '[ ] Importar hooks de React Query necesarios',
    '[ ] Importar tipos de @/shared/types/api',
    '[ ] Importar componentes de UI (AlertCircle, Loader, X, etc.)',
  ],

  queries: [
    '[ ] Reemplazar useState con useQuery hooks',
    '[ ] Pasar parámetros/filters correctos a hooks',
    '[ ] Manejo de enabled flag si es condicional',
  ],

  mutations: [
    '[ ] Reemplazar handleCreate/handleUpdate con useMutation',
    '[ ] Agregar try/catch en handleSave',
    '[ ] Desabilitar botón durante mutation (mutation.isPending)',
  ],

  states: [
    '[ ] Agregar isLoading ? <LoadingSpinner /> : <Content />',
    '[ ] Agregar error ? <ErrorAlert /> : null',
    '[ ] Agregar empty state si data.length === 0',
    '[ ] Agregar isPending check en buttons/inputs',
  ],

  cleanup: [
    '[ ] Remover initialData mock arrays',
    '[ ] Remover manual setItems/setData calls',
    '[ ] Remover fetch() directo',
    '[ ] Remover useState para datos que vienen de API',
  ],

  testing: [
    '[ ] Probar loading state (componente muestra spinner)',
    '[ ] Probar error state (componente muestra error message)',
    '[ ] Probar datos reales (tabla se llena con datos)',
    '[ ] Probar crear/editar (mutation se ejecuta sin errores)',
    '[ ] Probar caché (segunda llamada no hace request)',
  ],
};

// ============================================================================
// COMANDOS PARA EJECUTAR CAMBIOS
// ============================================================================

export const COMMANDS_TO_RUN = `
# 1. Verificar tipos
npm run type-check

# 2. Ver errores de lint
npm run lint -- --fix

# 3. Correr en desarrollo para testear
npm run dev

# 4. Limpiar caché de React Query (si es necesario)
# En el navegador: F12 → Application → Clear All
`;

// ============================================================================
// ESTADO ESPERADO DESPUÉS DE REFACTORING COMPLETO
// ============================================================================

export const EXPECTED_FINAL_STATE = {
  noMoreFetchCalls: 'No hay fetch() directo en componentes (excepto API-only routes)',
  allServicesUsed: 'Todos los servicios (usuario, pedidos, inventario, reportes) son usados',
  consistentErrorHandling: 'Error handling es consistente en toda la app',
  loadingStates: 'Todos los componentes tienen loading states visuales',
  tokenRefresh: 'Token refresh automático funciona sin loops infinitos',
  typesSafety: 'Todas las respuestas de API están tipiadas correctamente',
  cachingWorks: 'React Query caché reduce requests innecesarios',
};
