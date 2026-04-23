from uuid import UUID

from fastapi import APIRouter, status

from ..deps import DBSession
from ..schemas.schemas import MessageResponse, PedidoCreate, PedidoEstadoUpdate, PedidoRead, PedidoUpdate
from ..services.pedido_service import (
    cancel_pedido,
    change_estado,
    create_pedido,
    get_pedido,
    list_pedidos,
    update_pedido,
)


router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


@router.get("/", response_model=list[PedidoRead])
def get_pedidos(db: DBSession):
    return list_pedidos(db)


@router.post("/", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def post_pedido(payload: PedidoCreate, db: DBSession):
    return create_pedido(db, payload)


@router.get("/{pedido_id}", response_model=PedidoRead)
def get_pedido_detail(pedido_id: UUID, db: DBSession):
    return get_pedido(db, pedido_id)


@router.put("/{pedido_id}", response_model=PedidoRead)
def put_pedido(pedido_id: UUID, payload: PedidoUpdate, db: DBSession):
    return update_pedido(db, pedido_id, payload)


@router.delete("/{pedido_id}", response_model=MessageResponse)
def delete_pedido(pedido_id: UUID, db: DBSession):
    cancel_pedido(db, pedido_id)
    return MessageResponse(message="Pedido cancelado")


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def patch_estado_pedido(pedido_id: UUID, payload: PedidoEstadoUpdate, db: DBSession):
    return change_estado(db, pedido_id, payload)
