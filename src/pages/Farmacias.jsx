import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FarmaciaForm from '../components/FarmaciaForm';

function Farmacias() {
  const [farmacias, setFarmacias] = useState([]);
  const [selectedFarmaciaId, setSelectedFarmaciaId] = useState(null); // Estado añadido
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFarmacias();
  }, []);

  const fetchFarmacias = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/farmacias');
      setFarmacias(response.data);
    } catch (error) {
      console.error('Error al obtener farmacias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (farmaciaId = null) => {
    setSelectedFarmaciaId(farmaciaId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedFarmaciaId(null);
    fetchFarmacias(); // Recargar datos después de cerrar el formulario
  };

  const handleDeleteFarmacia = async (id) => {
    if (window.confirm('¿Está seguro de eliminar esta farmacia?')) {
      try {
        await axios.delete(`http://localhost:5000/api/farmacias/${id}`);
        setFarmacias(farmacias.filter(farmacia => farmacia.id !== id));
      } catch (error) {
        console.error('Error al eliminar farmacia:', error);
        alert('No se pudo eliminar la farmacia: ' + error.message);
      }
    }
  };

  if (isLoading) {
    return <div className="container mt-4">Cargando farmacias...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Gestión de Farmacias</h2>
      <button className="btn btn-primary mb-3" onClick={() => handleOpenForm()}>
        Crear Farmacia
      </button>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Zona</th>
              <th>Dueño</th>
              <th>Horario Apertura</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {farmacias.map(farmacia => (
              <tr key={farmacia.id}>
                <td>{farmacia.name}</td>
                <td>{farmacia.address}</td>
                <td>{farmacia.zone_name || '-'}</td>
                <td>{farmacia.owner_name || '-'}</td>
                <td>{farmacia.openingHours}:00</td>
                <td>
                  <button 
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleOpenForm(farmacia.id)} // Pasamos solo el ID
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteFarmacia(farmacia.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <FarmaciaForm 
          farmaciaId={selectedFarmaciaId} 
          onClose={handleCloseForm} 
          setFarmacias={setFarmacias} 
          farmacias={farmacias} 
        />
      )}
    </div>
  );
}

export default Farmacias;