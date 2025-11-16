import React, { useEffect, useState } from "react";
import inventarioApi from "../api/inventarioApi";
import AgregarClienteModal from "../components/AgregarClienteModal";
import "./clientes.css";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [formEditData, setFormEditData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
  });
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Cargar clientes desde el backend
  const cargarClientes = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log("Intentando cargar clientes...");
      
      const res = await inventarioApi.get("/clientes/");
      console.log("Respuesta completa del servidor:", res.data);
      
      // Verificar si los datos vienen en results (paginación) o directamente
      let clientesData = [];
      
      if (res.data.results) {
        // Si viene con paginación (results, count, next, previous)
        clientesData = res.data.results;
        console.log("Datos de results:", clientesData);
      } else if (Array.isArray(res.data)) {
        // Si viene directamente como array
        clientesData = res.data;
        console.log("Datos directos (array):", clientesData);
      }
      
      console.log("Clientes a mostrar:", clientesData);
      setClientes(clientesData);
    } catch (err) {
      console.error("Error completo:", err);
      console.error("Respuesta del error:", err.response?.data);
      const mensajeError = err.response?.data?.detail || "Error cargando clientes";
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleAgregar = () => {
    setModalOpen(true);
  };

  const handleEditar = (cliente) => {
    console.log("Editar cliente:", cliente.id);
    setClienteEditando(cliente);
    setFormEditData({
      nombre: cliente.nombre,
      correo: cliente.correo || "",
      telefono: cliente.telefono || "",
    });
    setModalEditOpen(true);
  };

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setFormEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setLoadingEdit(true);

    try {
      const response = await inventarioApi.put(`/clientes/${clienteEditando.id}/`, formEditData);
      console.log("✅ Cliente actualizado:", response.data);
      
      // Recarga la lista
      cargarClientes();
      
      // Cerrar modal
      setModalEditOpen(false);
    } catch (err) {
      console.error("❌ Error actualizando cliente:", err.response?.data);
      setError(err.response?.data?.detail || "Error actualizando cliente");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await inventarioApi.delete(`/clientes/${id}/`);
        cargarClientes();
      } catch (err) {
        console.error("Error al eliminar:", err);
        setError("Error eliminando cliente");
      }
    }
  };

  return (
    <div className="clientes-container">
      <h1 className="titulo">Clientes</h1>

      {loading && <p className="cargando">Cargando clientes...</p>}
      {error && <p className="error">❌ {error}</p>}

      {/* Botón para agregar */}
      <div className="acciones-superiores">
        <button className="btn-agregar" onClick={handleAgregar}>
          ➕ Agregar Usuario
        </button>
      </div>

      {/* Tabla */}
      {!loading && clientes.length > 0 && (
        <table className="tabla-clientes">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((c, idx) => (
              <tr key={c.id}>
                <td>{idx + 1}</td>
                <td>{c.nombre}</td>
                <td>{c.telefono || "—"}</td>
                <td>{c.correo || "—"}</td>
                <td className="acciones">
                  <button 
                    className="btn-editar" 
                    onClick={() => handleEditar(c)}
                    title="Editar cliente"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-borrar" 
                    onClick={() => handleEliminar(c.id)}
                    title="Eliminar cliente"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && clientes.length === 0 && !error && (
        <p className="sin-datos">No hay clientes registrados. ¡Crea uno nuevo!</p>
      )}

      {/* Modal para agregar cliente */}
      <AgregarClienteModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onClienteAgregado={cargarClientes}
      />

      {/* Modal para editar cliente */}
      {modalEditOpen && (
        <div className="modal-overlay" onClick={() => setModalEditOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar Usuario</h2>
              <button className="btn-close" onClick={() => setModalEditOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitEdit} className="modal-form">
              {/* Campo nombre */}
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formEditData.nombre}
                  onChange={handleChangeEdit}
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
                  value={formEditData.correo}
                  onChange={handleChangeEdit}
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
                  value={formEditData.telefono}
                  onChange={handleChangeEdit}
                  placeholder="Ej: 3005551234"
                  required
                />
              </div>

              {/* Botones */}
              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalEditOpen(false)}
                  disabled={loadingEdit}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-guardar"
                  disabled={loadingEdit}
                >
                  {loadingEdit ? "Guardando..." : "✓ Actualizar Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}