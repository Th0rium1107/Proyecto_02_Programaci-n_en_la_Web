from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


# ==========================================
# CATEGORÍAS
# ==========================================
class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name_plural = "Categorías"


# ==========================================
# COLECCIONES
# ==========================================
class Coleccion(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    temporada = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return self.nombre
    
    class Meta:
        verbose_name_plural = "Colecciones"


# ==========================================
# EMPLEADOS (asociados a User)
# ==========================================
class Empleado(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    telefono = models.CharField(max_length=20, blank=True)
    fecha_contratacion = models.DateField()
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


# ==========================================
# PRODUCTOS - CON COLORES
# ==========================================
class Producto(models.Model):
    ESTADO_CHOICES = [
        ('en_stock', 'En Stock'),
        ('bajo_stock', 'Stock Bajo'),
        ('agotado', 'Agotado'),
    ]
    
    # Información básica
    nombre = models.CharField(max_length=200)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)
    coleccion = models.ForeignKey(Coleccion, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Detalles
    tallas = models.CharField(max_length=100, help_text="Ej: S,M,L,XL")
    colores = models.CharField(max_length=200, help_text="Ej: Rojo,Azul,Negro,Blanco", blank=True)
    descripcion = models.TextField(blank=True)
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)
    
    # Precios e inventario
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    stock_actual = models.IntegerField(default=0)
    stock_minimo = models.IntegerField(default=5, help_text="Alerta cuando esté por debajo")
    
    # Metadata
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nombre
    
    @property
    def estado(self):
        """Retorna el estado del producto"""
        if self.stock_actual == 0:
            return 'agotado'
        elif self.stock_actual <= self.stock_minimo:
            return 'bajo_stock'
        else:
            return 'en_stock'
    
    @property
    def stock_bajo(self):
        """Retorna True si el stock está por debajo del mínimo"""
        return self.stock_actual <= self.stock_minimo
    
    @property
    def sin_stock(self):
        """Retorna True si no hay stock"""
        return self.stock_actual == 0
    
    @property
    def lista_colores(self):
        """Retorna una lista de colores separados"""
        if self.colores:
            return [color.strip() for color in self.colores.split(',')]
        return []
    
    @property
    def cantidad_colores(self):
        """Retorna la cantidad de colores disponibles"""
        return len(self.lista_colores)
    
    class Meta:
        ordering = ['nombre']


# ==========================================
# MOVIMIENTOS DE INVENTARIO
# ==========================================
class MovimientoInventario(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada (Compra/Reposición)'),
        ('salida', 'Salida (Venta o Retiro)'),
        ('ajuste', 'Ajuste de Inventario'),
        ('devolucion', 'Devolución'),
    ]
    
    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name='movimientos'
    )
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    cantidad = models.PositiveIntegerField()
    fecha = models.DateTimeField(default=timezone.now)
    empleado = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        null=True, blank=True
    )
    motivo = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk:
            if self.tipo == 'entrada':
                self.producto.stock_actual += self.cantidad
            elif self.tipo == 'salida':
                self.producto.stock_actual -= self.cantidad
            elif self.tipo == 'devolucion':
                self.producto.stock_actual += self.cantidad
            elif self.tipo == 'ajuste':
                self.producto.stock_actual += self.cantidad

            if self.producto.stock_actual < 0:
                self.producto.stock_actual = 0

            self.producto.save()
        
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.tipo} - {self.producto.nombre} ({self.cantidad})"


# ==========================================
# CLIENTES
# ==========================================
class Cliente(models.Model):
    TIPO_CHOICES = [
        ('minorista', 'Cliente Minorista'),
        ('mayorista', 'Cliente Mayorista'),
        ('internacional', 'Cliente Internacional'),
    ]
    
    nombre = models.CharField(max_length=200)
    tipo_cliente = models.CharField(max_length=20, choices=TIPO_CHOICES, default='minorista')
    
    # Contacto
    correo = models.EmailField(blank=True)
    telefono = models.CharField(max_length=20)
    direccion = models.TextField(blank=True)
    
    # Redes sociales
    instagram = models.CharField(max_length=100, blank=True)
    
    # Info del negocio (mayoristas)
    nombre_negocio = models.CharField(max_length=200, blank=True)
    nit_rut = models.CharField(max_length=50, blank=True)
    
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nombre


# ==========================================
# VENTAS
# ==========================================
class Venta(models.Model):
    CANAL_CHOICES = [
        ('nequi', 'Nequi'),
        ('daviplata', 'Daviplata'),
        ('bancolombia', 'Bancolombia'),
        ('presencial', 'Presencial (Efectivo)'),
        ('tarjeta', 'Tarjeta'),
    ]
    
    fecha = models.DateTimeField(auto_now_add=True)
    canal_venta = models.CharField(max_length=20, choices=CANAL_CHOICES)
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT)
    
    # Totales
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    descuento = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    
    notas = models.TextField(blank=True)
    
    def __str__(self):
        return f"Venta #{self.id} - {self.fecha.strftime('%d/%m/%Y')}"
    
    class Meta:
        ordering = ['-fecha']


# ==========================================
# DETALLES DE VENTA
# ==========================================
class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    
    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_unitario
        
        if not self.pk:
            self.producto.stock_actual -= self.cantidad
            if self.producto.stock_actual < 0:
                self.producto.stock_actual = 0
            self.producto.save()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.producto.nombre} x{self.cantidad}"