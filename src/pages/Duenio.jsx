import React, { useEffect, useState } from "react";
import axios from "axios";
import DuenioForm from "../components/DuenioForm";

function Duenios() {
  const [duenios, setDuenios] = useState([]);
  const [selectedDuenio, setSelectedDuenio] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchDuenios();
  }, []);

  const fetchDuenios = () => {
    axios
      .get("http://localhost:5000/api/duenios")
      .then((response) => setDuenios(response.data))
      .catch((error) => console.error("Error al obtener dueños:", error));
  };

  const handleOpenForm = (duenio = null) => {
    setSelectedDuenio(duenio);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDuenio(null);
  };

  const handleDeleteDuenio = (id) => {
    if (window.confirm("¿Está seguro de eliminar este dueño?")) {
      axios
        .delete(`http://localhost:5000/api/duenios/${id}`)
        .then(() => {
          setDuenios(duenios.filter(duenio => duenio.id !== id));
        })
        .catch((error) => console.error("Error al eliminar dueño:", error));
    }
  };

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
                <button className="btn btn-warning me-2" onClick={() => handleOpenForm(duenio)}>
                  Editar
                </button>
                <button className="btn btn-danger" onClick={() => handleDeleteDuenio(duenio.id)}>
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