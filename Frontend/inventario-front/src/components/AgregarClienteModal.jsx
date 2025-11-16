import React, { useState } from "react";
import inventarioApi from "../api/inventarioApi";
import "./modal.css";

export default function AgregarClienteModal({ isOpen, onClose, onClienteAgregado }) {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await inventarioApi.post("/clientes/", formData);
      console.log("✅ Cliente agregado:", response.data);
      
      // Limpiar formulario
      setFormData({
        nombre: "",
        correo: "",
        telefono: "",
      });
      
      // Notificar al padre para que recargue la lista
      if (onClienteAgregado) {
        onClienteAgregado();
      }
      
      // Cerrar modal
      onClose();
    } catch (err) {
      console.error("❌ Error agregando cliente:", err.response?.data);
      setError(err.response?.data?.detail || "Error agregando cliente");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Agregar Usuario</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          {/* Campo nombre */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre del cliente"
              required
            />
          </div>

          {/* Campo correo */}
          <div className="form-group">
            <label htmlFor="correo">Correo</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="cliente@ejemplo.com"
            />
          </div>

          {/* Campo teléfono */}
          <div className="form-group">
            <label htmlFor="telefono">Teléfono *</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 3005551234"
              required
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
              {loading ? "Guardando..." : "✓ Guardar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}