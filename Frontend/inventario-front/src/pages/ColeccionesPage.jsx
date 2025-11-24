import React, { useEffect, useState } from "react";
import inventarioApi from "../api/inventarioApi";
import "./colecciones.css";

export default function ColeccionesPage() {
  const [colecciones, setColecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [coleccionEditando, setColeccionEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", temporada: "" });
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const cargarColecciones = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await inventarioApi.get("/colecciones/");
      
      let coleccionesData = [];
      if (res.data.results) {
        coleccionesData = res.data.results;
      } else if (Array.isArray(res.data)) {
        coleccionesData = res.data;
      }
      
      setColecciones(coleccionesData);
    } catch (err) {
      console.error("Error:", err);
      setError("Error cargando colecciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarColecciones();
  }, []);

  const handleAgregar = () => {
    setFormData({ nombre: "", temporada: "" });
    setColeccionEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (coleccion) => {
    setFormData({
      nombre: coleccion.nombre,
      temporada: coleccion.temporada || ""
    });
    setColeccionEditando(coleccion);
    setModalEditOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      if (coleccionEditando) {
        await inventarioApi.put(`/colecciones/${coleccionEditando.id}/`, formData);
        console.log("✅ Colección actualizada");
        setModalEditOpen(false);
      } else {
        await inventarioApi.post("/colecciones/", formData);
        console.log("✅ Colección creada");
        setModalOpen(false);
      }
      
      cargarColecciones();
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.detail || "Error guardando colección");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta colección?")) {
      try {
        await inventarioApi.delete(`/colecciones/${id}/`);
        cargarColecciones();
      } catch (err) {
        console.error("Error:", err);
        setError("Error eliminando colección");
      }
    }
  };

  return (
    <div className="colecciones-container">
      <h1 className="titulo">🎨 Colecciones</h1>

      {loading && <p className="cargando">Cargando colecciones...</p>}
      {error && <p className="error">❌ {error}</p>}

      <div className="acciones-superiores">
        <button className="btn-agregar" onClick={handleAgregar}>
          ➕ Agregar Colección
        </button>
      </div>

      {!loading && (
        <p style={{ color: '#666', marginBottom: '10px' }}>
          Total colecciones: {colecciones.length}
        </p>
      )}

      {!loading && colecciones.length > 0 && (
        <table className="tabla-colecciones">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Temporada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {colecciones.map((col, idx) => (
              <tr key={col.id}>
                <td>{idx + 1}</td>
                <td><strong>{col.nombre}</strong></td>
                <td>{col.temporada || "—"}</td>
                <td className="acciones">
                  <button 
                    className="btn-editar" 
                    onClick={() => handleEditar(col)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-borrar" 
                    onClick={() => handleEliminar(col.id)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && colecciones.length === 0 && !error && (
        <p className="sin-datos">No hay colecciones registradas</p>
      )}

      {/* Modal Agregar */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Agregar Colección</h2>
              <button className="btn-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre de la colección"
                  required
                />
              </div>
              <div className="form-group">
                <label>Temporada</label>
                <input
                  type="text"
                  name="temporada"
                  value={formData.temporada}
                  onChange={handleChange}
                  placeholder="Ej: Invierno 2024"
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-cancelar" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={loadingSubmit}>
                  {loadingSubmit ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditOpen && (
        <div className="modal-overlay" onClick={() => setModalEditOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar Colección</h2>
              <button className="btn-close" onClick={() => setModalEditOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Temporada</label>
                <input
                  type="text"
                  name="temporada"
                  value={formData.temporada}
                  onChange={handleChange}
                  placeholder="Ej: Invierno 2024"
                />
              </div>
              <div className="modal-buttons">
                <button type="button" className="btn-cancelar" onClick={() => setModalEditOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={loadingSubmit}>
                  {loadingSubmit ? "Guardando..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}