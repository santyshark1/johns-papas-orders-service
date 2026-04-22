# 🛠️ Backend - Microservicio de Órdenes

Backend del microservicio genérico de gestión de órdenes construido con Django y Django REST Framework.

## 🚀 Quick Start

### Requisitos
- Python 3.11+
- PostgreSQL 13+
- pip

### Instalación Local

```bash
# 1. Navegar a la carpeta del backend
cd backend

# 2. Crear ambiente virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Crear archivo .env
cp .env.example .env

# 5. Aplicar migraciones
python manage.py migrate

# 6. Crear superusuario (admin)
python manage.py createsuperuser

# 7. Ejecutar servidor
python manage.py runserver
```

El servidor estará disponible en: **http://localhost:8000**

### Con Docker

```bash
# Desde la raíz del proyecto
docker-compose up backend
```

---

## 📚 Endpoints Principales

### Autenticación
- `POST /api/auth/login/` - Login de usuario
- `POST /api/auth/refresh/` - Refrescar token JWT
- `POST /api/auth/logout/` - Logout

### Órdenes
- `GET /api/orders/` - Listar todas las órdenes
- `POST /api/orders/` - Crear nueva orden
- `GET /api/orders/{id}/` - Obtener detalles de orden
- `PUT /api/orders/{id}/` - Actualizar orden
- `DELETE /api/orders/{id}/` - Cancelar orden
- `PATCH /api/orders/{id}/status/` - Cambiar estado de orden

### Documentación
- `GET /api/docs/` - Swagger UI (documentación interactiva)
- `GET /api/schema/` - OpenAPI Schema

---

## 📁 Estructura de Carpetas

```
backend/
├── core/                    # Configuración principal
│   ├── settings.py         # Configuración de Django
│   ├── urls.py             # URLs principales
│   ├── wsgi.py
│   └── asgi.py
├── orders/                 # App principal de órdenes
│   ├── migrations/
│   ├── models.py           # Modelos (Order, OrderItem, etc)
│   ├── serializers.py      # Serializadores DRF
│   ├── views.py            # Vistas/ViewSets
│   ├── urls.py             # URLs de la app
│   ├── admin.py            # Admin de Django
│   └── tests.py            # Tests
├── users/                  # App de usuarios y autenticación
│   ├── models.py           # Modelo User
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── manage.py
├── requirements.txt
├── .env.example
└── README.md
```

---

## 🔐 Autenticación

El backend usa **JWT (JSON Web Tokens)** para autenticación:

```bash
# 1. Obtener token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Respuesta:
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
# }

# 2. Usar token en requests
curl -X GET http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
pytest

# Con detalles
pytest -v

# Con cobertura
pytest --cov=orders

# Tests específicos
pytest orders/tests.py::TestOrderCreate
```

---

## 📊 Modelos de Datos

### Order
```python
- id (UUID)
- order_number (String, único)
- customer_id (String - referencia a Customer Service)
- status (DRAFT, PENDING, PROCESSING, READY, COMPLETED, CANCELLED)
- items (relación a OrderItem)
- subtotal, tax, shipping, discount, total (Decimal)
- delivery_method (pickup, delivery)
- created_at, updated_at
- metadata (JSON - datos flexibles)
```

### OrderItem
```python
- id (UUID)
- order (ForeignKey a Order)
- product_id (String - referencia a Product Catalog)
- quantity (Integer)
- unit_price (Decimal)
- variants (JSON - talla, color, etc)
- subtotal (Decimal)
```

### OrderStatusHistory
```python
- id (UUID)
- order (ForeignKey a Order)
- old_status
- new_status
- changed_by (ForeignKey a User)
- changed_at (DateTime)
- reason (String)
```

---

## 🔌 Integración con Otros Microservicios

El backend está preparado para comunicarse con:

- **Servicio de Clientes**: Validar cliente_id
- **Servicio de Inventario**: Verificar disponibilidad de productos
- **Servicio de Pagos**: Procesar pagos
- **Servicio de Envíos**: Calcular costos y tiempos

Las integraciones se hacen vía:
- **Llamadas HTTP síncronas** (requests)
- **Eventos asíncronos** (message broker - RabbitMQ, Redis)

---

## 📝 Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

---

## 🐛 Troubleshooting

### Error de conexión a BD
```bash
# Verificar que PostgreSQL está corriendo
# En Windows: services.msc → PostgreSQL
# En Mac: brew services list | grep postgres

# Verificar credenciales en .env
```

### Migraciones no aplicadas
```bash
python manage.py showmigrations
python manage.py migrate
```

### Borrar base de datos y empezar de cero
```bash
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

---

## 📚 Documentación Oficial

- [Django Docs](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [drf-spectacular](https://drf-spectacular.readthedocs.io/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)

---

**Última actualización**: 2026-03-13