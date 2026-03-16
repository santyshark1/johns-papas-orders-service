import uuid
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


class Pedido(models.Model):
    class Estado(models.TextChoices):
        BORRADOR = 'BORRADOR', 'Borrador'
        EN_PROCESO = 'EN_PROCESO', 'En Proceso'
        ENVIADO = 'ENVIADO', 'Enviado'
        ENTREGADO = 'ENTREGADO', 'Entregado'
        CANCELADO = 'CANCELADO', 'Cancelado'
        COMPLETADO = 'COMPLETADO', 'Completado'
        REEMBOLSADO = 'REEMBOLSADO', 'Reembolsado'
        FALLIDO = 'FALLIDO', 'Fallido'

    class Plataforma(models.TextChoices):
        WEB = 'WEB', 'Web'
        MOVIL = 'MOVIL', 'Movil'
        TIENDA_FISICA = 'TIENDA_FISICA', 'Tienda Fisica'

    class Entrega(models.TextChoices):
        DOMICILIO = 'DOMICILIO', 'Domicilio'
        RECOGIDA = 'RECOGIDA', 'Recogida'
        RETIRO_TIENDA = 'RETIRO_TIENDA', 'Retiro en Tienda'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    numero_orden = models.CharField(max_length=20, unique=True)

    cliente_id = models.UUIDField(db_index=True)
    cliente_nombre = models.CharField(max_length=255)
    cliente_email = models.EmailField(max_length=255)
    cliente_telefono = models.CharField(max_length=10)

    tienda_id = models.UUIDField(db_index=True)
    tienda_nombre = models.CharField(max_length=255)
    plataforma = models.CharField(max_length=20, choices=Plataforma.choices)
    entrega = models.CharField(max_length=20, choices=Entrega.choices)
    moneda = models.CharField(max_length=10, default='COP')

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    impuestos = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    servicio = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])
    descuento = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    total = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.00'))])

    codigo_descuento = models.CharField(max_length=50, blank=True, null=True)
    tiempo_servicio = models.DurationField(blank=True, null=True)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    completado_en = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'pedidos'
        ordering = ['-creado_en']
        indexes = [
            models.Index(fields=['cliente_id']),
            models.Index(fields=['tienda_id']),
        ]

    def __str__(self) -> str:
        return f'Pedido {self.numero_orden} - Cliente: {self.cliente_nombre} - Total: {self.total}'


class DireccionServicio(models.Model):
    class TipoDireccion(models.TextChoices):
        DOMICILIO = 'DOMICILIO', 'Domicilio'
        FACTURACION = 'FACTURACION', 'Facturacion'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pedido = models.ForeignKey(Pedido, related_name='direcciones', on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TipoDireccion.choices)
    numero1 = models.CharField(max_length=255)
    numero2 = models.CharField(max_length=255, blank=True, null=True)
    calle = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=255)

    class Meta:
        db_table = 'direcciones_servicio'
        constraints = [
            models.UniqueConstraint(fields=['pedido', 'tipo'], name='unique_pedido_tipo'),
        ]


class ItemPedido(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='items')

    # Producto externo (id del catalogo)
    producto_id = models.CharField(max_length=50)

    # Snapshots del producto
    nombre_producto_snapshot = models.CharField(max_length=200)
    sku_producto_snapshot = models.CharField(max_length=100, blank=True)
    precio_unitario_snapshot = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    #cantidad de unidades del producto en este item
    cantidad = models.PositiveIntegerField()
    #subtotal del item (precio_unitario * cantidad) sin impuestos ni descuentos.
    subtotal_snapshot = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    #impuesto de cada item (subtotal * tasa_impuesto) se guarda para no depender de cambios en el catalogo
    impuesto_item = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    #lo mismo de arriba pero descuentos :D
    descuento_item = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    #subtotal con impuestos y descuentos (subtotal + impuesto - descuento)
    total_item = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))],
    )
    #variantes del producto (talla, color, etc) se guardan como snapshot para no depender de cambios en el catalogo, se guardan como json {talla: M, color: rojo}
    variantes_json = models.JSONField(default=dict, blank=True)
    # descripcion adicional del item, por ejemplo para aclarar algo al restaurante o al cliente
    notas = models.TextField(blank=True)
    #fecha de creacion del item, se guarda para tener un historial de cuando se agrego cada item al pedido
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'items_pedido'
        indexes = [models.Index(fields=['pedido'])]

    def __str__(self) -> str:
        return f'{self.nombre_producto_snapshot} x{self.cantidad}'
    # el clean sirve para validar que el subtotal_snapshot sea igual 
    # al precio_unitario_snapshot * cantidad, y que el total_item sea 
    # igual al subtotal_snapshot + impuesto_item - descuento_item, 
    # asi nos aseguramos que los datos sean consistentes y no haya 
    # errores de calculo al guardar el item
    def clean(self):
        super().clean()
        precision = Decimal('0.01')

        if (
            self.precio_unitario_snapshot is not None
            and self.cantidad is not None
            and self.subtotal_snapshot is not None
        ):
            subtotal_esperado = (self.precio_unitario_snapshot * self.cantidad).quantize(precision)
            if self.subtotal_snapshot.quantize(precision) != subtotal_esperado:
                raise ValidationError(
                    {
                        'subtotal_snapshot': (
                            f'El subtotal debe ser {subtotal_esperado} '
                            f'(precio_unitario_snapshot x cantidad).'
                        )
                    }
                )

        if (
            self.subtotal_snapshot is not None
            and self.impuesto_item is not None
            and self.descuento_item is not None
            and self.total_item is not None
        ):
            total_esperado = (self.subtotal_snapshot + self.impuesto_item - self.descuento_item).quantize(precision)
            if self.total_item.quantize(precision) != total_esperado:
                raise ValidationError(
                    {
                        'total_item': (
                            f'El total_item debe ser {total_esperado} '
                            f'(subtotal_snapshot + impuesto_item - descuento_item).'
                        )
                    }
                )


class OpcionSeleccionadaItemPedido(models.Model):
 
    # Normalizacion de variantes elegidas por item  asi no pasa nada con los otros micros y no hay dependencia con el catalogo, se guarda como snapshot


    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item_pedido = models.ForeignKey(
        ItemPedido,
        on_delete=models.CASCADE,
        related_name='opciones_seleccionadas',
    )

    # Si el producto tiene opciones, se guardan como snapshot para evitar dependencia con catalogo
    opcion_id = models.CharField(max_length=50, blank=True)
    tipo_opcion_snapshot = models.CharField(max_length=50)
    codigo_opcion_snapshot = models.CharField(max_length=50)
    etiqueta_opcion_snapshot = models.CharField(max_length=100)


class HistorialEstadoPedido(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='historial_estados')

    estado_anterior = models.CharField(max_length=20, choices=Pedido.Estado.choices)
    estado_nuevo = models.CharField(max_length=20, choices=Pedido.Estado.choices)
    cambiado_por = models.CharField(max_length=50)
    razon = models.TextField(blank=True)
    cambiado_en = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-cambiado_en']
        indexes = [models.Index(fields=['pedido', '-cambiado_en'])]
