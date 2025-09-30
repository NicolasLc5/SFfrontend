import React, { useEffect, useState } from "react";
import axios from "axios";
import DuenioForm from "../components/DuenioForm";

const API_URL = import.meta.env.VITE_API_URL; // <-- Variable de entorno

function Duenios() {
  const [duenios, setDuenios] = useState([]);
  const [selectedDuenio, setSelectedDuenio] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDuenios();
  }, []);

  const fetchDuenios = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/duenios`);
      setDuenios(response.data);
    } catch (error) {
      console.error("Error al obtener dueños:", error);
      alert("Error al cargar dueños: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (duenio = null) => {
    setSelectedDuenio(duenio);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDuenio(null);
    fetchDuenios(); // Recargar datos después de cerrar el formulario
  };

  const handleDeleteDuenio = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este dueño?")) {
      try {
        await axios.delete(`${API_URL}/api/duenios/${id}`);
        setDuenios(duenios.filter((duenio) => duenio.id !== id));
      } catch (error) {
        console.error("Error al eliminar dueño:", error);
        alert("No se pudo eliminar el dueño: " + error.message);
      }
    }
  };

  if (isLoading) {
    return <div className="container mt-4">Cargando dueños...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Gestión de Dueños</h2>
      <button className="btn btn-primary mb-3" onClick={() => handleOpenForm()}>
        Crear Dueño
      </button>

      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Nombre Completo</th>
            <th>CI</th>
            <th>Celular</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {duenios.map((duenio) => (
            <tr key={duenio.id}>
              <td>{`${duenio.name} ${duenio.fistLastName} ${duenio.secondSurname || ''}`}</td>
              <td>{duenio.ci}</td>
              <td>{duenio.cellphone}</td>
              <td>{duenio.gmail || '-'}</td>
              <td>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleOpenForm(duenio)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteDuenio(duenio.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isFormOpen && (
        <DuenioForm
          duenio={selectedDuenio}
          onClose={handleCloseForm}
          setDuenios={setDuenios}
          duenios={duenios}
        />
      )}
    </div>
  );
}

export default Duenios;
