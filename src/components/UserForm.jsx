import React, { useState, useEffect } from "react";
import axios from "axios";

function UserForm({ user, onClose, setUsers, users }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    gmail: "",
    rol: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: "", // No se muestra la contraseña actual por seguridad
        gmail: user.gmail,
        rol: user.rol,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      axios
        .put(`http://localhost:5000/api/usuarios/${user.id}`, formData)
        .then((response) => {
          setUsers(users.map((u) => (u.id === user.id ? response.data : u)));
          onClose();
        })
        .catch((error) => console.error("Error al actualizar usuario:", error));
    } else {
      axios
        .post("http://localhost:5000/api/usuarios", formData)
        .then((response) => {
          setUsers([...users, response.data]);
          onClose();
        })
        .catch((error) => console.error("Error al crear usuario:", error));
    }
  };

  return (
    <div className="modal show d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{user ? "Editar Usuario" : "Crear Usuario"}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Usuario</label>
                <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required={!user} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="gmail" value={formData.gmail} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Rol</label>
                <input type="text" className="form-control" name="rol" value={formData.rol} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-success">Guardar</button>
              <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>Cancelar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserForm;
