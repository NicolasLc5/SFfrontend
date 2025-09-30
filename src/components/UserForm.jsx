import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // ✅ Variable de entorno para Render

function UserForm({ user, onClose, setUsers, users }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    gmail: "",
    rol: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: "", // Nunca mostramos contraseña actual
        gmail: user.gmail,
        rol: user.rol,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (user) {
        // Editar usuario
        const res = await axios.put(`${API_URL}/api/usuarios/${user.id}`, formData);
        setUsers(users.map((u) => (u.id === user.id ? res.data : u)));
      } else {
        // Crear usuario
        const res = await axios.post(`${API_URL}/api/usuarios`, formData);
        setUsers([...users, res.data]);
      }
      onClose();
    } catch (err) {
      console.error("Error en formulario usuario:", err);
      setError(err.response?.data?.message || "Error al guardar usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{user ? "Editar Usuario" : "Crear Usuario"}</h5>
            <button className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!user} // Obligatoria solo al crear
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="gmail"
                  value={formData.gmail}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Rol</label>
                <input
                  type="text"
                  className="form-control"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserForm;
