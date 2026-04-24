FROM python:3.12-slim

WORKDIR /app

# Instalar dependencias del sistema (opcional, útil para algunas librerías)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements primero (mejor caché de Docker)
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY ./app ./app

# Exponer puerto (Render usará el PORT dinámico, pero lo dejamos fijo)
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]