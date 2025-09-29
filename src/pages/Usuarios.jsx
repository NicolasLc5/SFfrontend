import React, { useEffect, useState } from "react";
import axios from "axios";
import UserForm from "../components/UserForm";

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Obtener usuarios
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/usuarios")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error al obtener usuarios:", error));
  }, []);

  // Abrir formulario para crear o editar
  const handleOpenForm = (user = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  // Eliminar usuario
  const handleDeleteUser = (id) => {
    axios
      .delete(`http://localhost:5000/api/usuarios/${id}`)
      .then(() => setUsers(users.filter((user) => user.id !== id)))
      .catch((error) => console.error("Error al eliminar usuario:", error));
  };

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>
      <button className="btn btn-primary mb-3" onClick={() => handleOpenForm()}>
        Crear Usuario
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.gmail}</td>
              <td>{user.rol}</td>
              <td>
                <button className="btn btn-warning me-2" onClick={() => handleOpenForm(user)}>
                  Editar
                </button>
                <button className="btn btn-danger" onClick={() => handleDeleteUser(user.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isFormOpen && <UserForm user={selectedUser} onClose={handleCloseForm} setUsers={setUsers} users={users} />}
    </div>
  );
}

export default Users;