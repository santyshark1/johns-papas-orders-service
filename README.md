# 🍕 John's Papas Orders Service

> Microservicio genérico de gestión de órdenes.
![Status](https://img.shields.io/badge/status-MVP-yellow)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![Django](https://img.shields.io/badge/Django-4.2+-darkgreen)
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
- **Framework**: Django 4.2+ + Django REST Framework
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (Simple JWT)
- **Validación**: Django Serializers + Pydantic
- **Testing**: vitest
- **Documentación**: drf-spectacular (Swagger/OpenAPI)

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
