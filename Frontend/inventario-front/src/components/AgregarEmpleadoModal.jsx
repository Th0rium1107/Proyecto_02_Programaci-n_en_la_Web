import React, { useState } from "react";
import inventarioApi from "../api/inventarioApi";
import "./modal.css";

export default function AgregarEmpleadoModal({ isOpen, onClose, onEmpleadoAgregado }) {
  const [formData, setFormData] = useState({
    user: {
      username: "",
      first_name: "",
      last_name: "",
      password: "",
    },
    telefono: "",
    is_staff: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("user_")) {
      const fieldName = name.replace("user_", "");
      setFormData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [fieldName]: value
        }
      }));
    } else if (name === "is_staff") {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("🤝 Enviando datos:", formData);
      
      const response = await inventarioApi.post("/empleados/", formData);
      console.log("✅ Empleado agregado:", response.data);
      
      // Limpiar formulario
      setFormData({
        user: {
          username: "",
          first_name: "",
          last_name: "",
          password: "",
        },
        telefono: "",
        is_staff: false,
      });
      
      // Notificar al padre
      if (onEmpleadoAgregado) {
        onEmpleadoAgregado();
      }
      
      // Cerrar modal
      onClose();
    } catch (err) {
      console.error("❌ Error agregando empleado:", err.response?.data);
      console.error("Error completo:", err.response);
      
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.detail || 
                       JSON.stringify(err.response?.data) ||
                       "Error agregando empleado";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Agregar Empleado</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          {/* Usuario */}
          <div className="form-group">
            <label htmlFor="user_username">Usuario *</label>
            <input
              type="text"
              id="user_username"
              name="user_username"
              value={formData.user.username}
              onChange={handleChange}
              placeholder="Nombre de usuario para login"
              required
            />
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="user_first_name">Nombre *</label>
            <input
              type="text"
              id="user_first_name"
              name="user_first_name"
              value={formData.user.first_name}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
          </div>

          {/* Apellido */}
          <div className="form-group">
            <label htmlFor="user_last_name">Apellido *</label>
            <input
              type="text"
              id="user_last_name"
              name="user_last_name"
              value={formData.user.last_name}
              onChange={handleChange}
              placeholder="Apellido"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="user_password">Contraseña *</label>
            <input
              type="password"
              id="user_password"
              name="user_password"
              value={formData.user.password}
              onChange={handleChange}
              placeholder="Contraseña para login"
              required
            />
          </div>

          {/* Teléfono */}
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

          {/* Rol de Usuario */}
          <div className="form-group">
            <label htmlFor="is_staff">Rol de Usuario</label>
            <select
              id="is_staff"
              name="is_staff"
              value={formData.is_staff ? "true" : "false"}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                is_staff: e.target.value === "true"
              }))}
              style={{
                padding: '12px 14px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <option value="false">👤 Usuario</option>
              <option value="true">👨‍💼 Admin</option>
            </select>
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
              {loading ? "Guardando..." : "✔ Guardar Empleado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}