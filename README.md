# 🍕 John's Papas Orders Service

> Microservicio genérico de gestión de órdenes.
> 
![Status](https://img.shields.io/badge/status-MVP-yellow)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/Python-3.12+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-05998b)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)

## 📋 Descripción

Sistema modular de gestión de órdenes/pedidos diseñado como microservicio reutilizable. Proporciona APIs REST robustas para crear, consultar y gestionar el ciclo de vida completo de las órdenes, independientemente del tipo de negocio.

### ¿Por qué este proyecto?

- **Genérico**: No está amarrado a un negocio específico
- **Escalable**: Arquitectura de microservicios lista para crecer
- **Documentado**: APIs claras con Swagger/OpenAPI
- **Seguro**: Autenticación JWT y control de acceso basado en roles (RBAC)
- **Testeable**: Código cubierto con pruebas automatizadas
- **Integrable**: Diseñado para comunicarse con otros servicios

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI 0.115.6 (Python 3.12+)
- **Base de Datos**: Supabase (PostgreSQL 15+) - misma BD compartida entre todos los microservicios
- **Autenticación**: JWT (Access Token 30min, Refresh Token 7 días) con bcrypt para hashing de contraseñas
- **Validación**: Pydantic v2 (schemas con validadores personalizados, EmailStr, regex, etc.)
- **Documentación**: Swagger UI (automática en /docs) y ReDoc (en /redoc)

### Frontend
- **Framework**: Next.js 14+ con TypeScript
- **Gestión de Estado**: Zustand + TanStack Query (React Query)
- **Formularios**: React Hook Form + Zod
- **Estilos**: Tailwind CSS
- **Testing**: Vitest + Testing Library
- **Cliente HTTP**: Axios

### DevOps
- **Containerización**: Docker + Docker Compose
- **Base de Datos**: PostgreSQL en contenedor
