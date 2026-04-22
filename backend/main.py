from fastapi import FastAPI
from pedidos.app.routers import pedidos
from usuario.app.routers import auth
app = FastAPI()

app.include_router(auth.router, prefix="/api")
app.include_router(pedidos.router, prefix="/api")