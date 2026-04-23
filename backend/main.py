from fastapi import FastAPI
from pedidos.app.routers.pedidos import router as pedidos_router
from usuario.app.routers.auth import router as auth_router

app = FastAPI()

app.include_router(auth_router, prefix="/api")
app.include_router(pedidos_router, prefix="/api")