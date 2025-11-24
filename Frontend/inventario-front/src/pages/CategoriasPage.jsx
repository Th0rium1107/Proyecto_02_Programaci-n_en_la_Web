import React, { useEffect, useState } from "react";
import inventarioApi from "../api/inventarioApi";
import "./categorias.css";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const cargarCategorias = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await inventarioApi.get("/categorias/");
      
      let categoriasData = [];
      if (res.data.results) {
        categoriasData = res.data.results;
      } else if (Array.isArray(res.data)) {
        categoriasData = res.data;
      }
      
      setCategorias(categoriasData);
    } catch (err) {
      console.error("Error:", err);
      setError("Error cargando categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleAgregar = () => {
    setFormData({ nombre: "", descripcion: "" });
    setCategoriaEditando(null);
    setModalOpen(true);
  };

  const handleEditar = (categoria) => {
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ""
    });
    setCategoriaEditando(categoria);
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
      if (categoriaEditando) {
        await inventarioApi.put(`/categorias/${categoriaEditando.id}/`, formData);
        console.log("✅ Categoría actualizada");
        setModalEditOpen(false);
      } else {
        await inventarioApi.post("/categorias/", formData);
        console.log("✅ Categoría creada");
        setModalOpen(false);
      }
      
      cargarCategorias();
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.detail || "Error guardando categoría");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      try {
        await inventarioApi.delete(`/categorias/${id}/`);
        cargarCategorias();
      } catch (err) {
        console.error("Error:", err);
        setError("Error eliminando categoría");
      }
    }
  };

  return (
    <div className="categorias-container">
      <h1 className="titulo">📁 Categorías de Productos</h1>

      {loading && <p className="cargando">Cargando categorías...</p>}
      {error && <p className="error">❌ {error}</p>}

      <div className="acciones-superiores">
        <button className="btn-agregar" onClick={handleAgregar}>
          ➕ Agregar Categoría
        </button>
      </div>

      {!loading && (
        <p style={{ color: '#666', marginBottom: '10px' }}>
          Total categorías: {categorias.length}
        </p>
      )}

      {!loading && categorias.length > 0 && (
        <table className="tabla-categorias">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat, idx) => (
              <tr key={cat.id}>
                <td>{idx + 1}</td>
                <td><strong>{cat.nombre}</strong></td>
                <td>{cat.descripcion || "—"}</td>
                <td className="acciones">
                  <button 
                    className="btn-editar" 
                    onClick={() => handleEditar(cat)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-borrar" 
                    onClick={() => handleEliminar(cat.id)}
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

      {!loading && categorias.length === 0 && !error && (
        <p className="sin-datos">No hay categorías registradas</p>
      )}

      {/* Modal Agregar */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Agregar Categoría</h2>
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
                  placeholder="Nombre de la categoría"
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción"
                  rows="3"
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
              <h2>✏️ Editar Categoría</h2>
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
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="3"
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