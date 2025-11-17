import React, { useState, useEffect } from "react";
import inventarioApi from "../api/inventarioApi";
import "./modal.css";

export default function AgregarProductoModal({ isOpen, onClose, onProductoAgregado }) {
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    coleccion: "",
    tallas: "",
    descripcion: "",
    precio_unitario: "",
    stock_actual: "",
    stock_minimo: 5,
  });

  const [categorias, setCategorias] = useState([]);
  const [colecciones, setColecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar categorías y colecciones
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [catRes, colRes] = await Promise.all([
          inventarioApi.get("/categorias/"),
          inventarioApi.get("/colecciones/"),
        ]);

        setCategorias(catRes.data.results || catRes.data);
        setColecciones(colRes.data.results || colRes.data);
      } catch (err) {
        console.error("Error cargando categorías/colecciones:", err);
      }
    };

    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos requeridos
      if (!formData.nombre || !formData.categoria || !formData.precio_unitario || formData.stock_actual === "") {
        setError("Por favor completa todos los campos requeridos");
        setLoading(false);
        return;
      }

      const dataToSend = {
        nombre: formData.nombre,
        categoria: parseInt(formData.categoria),
        coleccion: formData.coleccion ? parseInt(formData.coleccion) : null,
        tallas: formData.tallas,
        colores: formData.colores,
        descripcion: formData.descripcion,
        precio_unitario: parseFloat(formData.precio_unitario),
        stock_actual: parseInt(formData.stock_actual),
        stock_minimo: parseInt(formData.stock_minimo),
      };

      console.log("📤 Enviando producto:", dataToSend);
      const response = await inventarioApi.post("/productos/", dataToSend);
      console.log("✅ Producto agregado:", response.data);
      
      // Limpiar formulario
      setFormData({
        nombre: "",
        categoria: "",
        coleccion: "",
        tallas: "",
        colores: "",
        descripcion: "",
        precio_unitario: "",
        stock_actual: "",
        stock_minimo: 5,
      });
      
      // Notificar al padre
      if (onProductoAgregado) {
        onProductoAgregado();
      }
      
      // Cerrar modal
      onClose();
    } catch (err) {
      console.error("❌ Error agregando producto:", err.response?.data);
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.detail || 
                       JSON.stringify(err.response?.data) ||
                       "Error agregando producto";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Agregar Producto</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Producto *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Camiseta Estampada"
              required
            />
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          {/* Colección */}
          <div className="form-group">
            <label htmlFor="coleccion">Colección</label>
            <select
              id="coleccion"
              name="coleccion"
              value={formData.coleccion}
              onChange={handleChange}
            >
              <option value="">Sin colección</option>
              {colecciones.map(col => (
                <option key={col.id} value={col.id}>{col.nombre}</option>
              ))}
            </select>
          </div>

          {/* Tallas */}
          <div className="form-group">
            <label htmlFor="tallas">Tallas (separadas por comas)</label>
            <input
              type="text"
              id="tallas"
              name="tallas"
              value={formData.tallas}
              onChange={handleChange}
              placeholder="Ej: S,M,L,XL"
            />
          </div>

          {/* Colores */}
          <div className="form-group">
            <label htmlFor="colores">Colores (separados por comas)</label>
            <input
              type="text"
              id="colores"
              name="colores"
              value={formData.colores}
              onChange={handleChange}
              placeholder="Ej: Rojo,Azul,Negro,Blanco"
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción del producto"
              rows="3"
            />
          </div>

          {/* Precio */}
          <div className="form-group">
            <label htmlFor="precio_unitario">Precio Unitario *</label>
            <input
              type="number"
              id="precio_unitario"
              name="precio_unitario"
              value={formData.precio_unitario}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Stock Actual */}
          <div className="form-group">
            <label htmlFor="stock_actual">Stock Inicial *</label>
            <input
              type="number"
              id="stock_actual"
              name="stock_actual"
              value={formData.stock_actual}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
          </div>

          {/* Stock Mínimo */}
          <div className="form-group">
            <label htmlFor="stock_minimo">Stock Mínimo</label>
            <input
              type="number"
              id="stock_minimo"
              name="stock_minimo"
              value={formData.stock_minimo}
              onChange={handleChange}
              placeholder="5"
              min="1"
            />
          </div>

          {/* Botones */}
          <div className="modal-buttons">
            <button
              type="button"
              className="btn-cancelar"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar"
              disabled={loading}
            >
              {loading ? "Guardando..." : "✔ Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}