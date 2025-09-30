import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL; // <-- Variable de entorno

function DuenioForm({ duenio, onClose, setDuenios, duenios }) {
  const [formData, setFormData] = useState({
    name: "",
    fistLastName: "",
    secondSurname: "",
    ci: "",
    cellphone: "",
    gmail: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (duenio) {
      setFormData({
        name: duenio.name,
        fistLastName: duenio.fistLastName,
        secondSurname: duenio.secondSurname || "",
        ci: duenio.ci,
        cellphone: duenio.cellphone,
        gmail: duenio.gmail || ""
      });
    }
  }, [duenio]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (duenio) {
        // Actualizar
        const response = await axios.put(`${API_URL}/api/duenios/${duenio.id}`, formData);
        setDuenios(duenios.map(d => d.id === duenio.id ? response.data : d));
      } else {
        // Crear
        const response = await axios.post(`${API_URL}/api/duenios`, formData);
        setDuenios([...duenios, response.data]);
      }
      onClose();
    } catch (err) {
      console.error("Error al guardar dueño:", err);
      setError(err.response?.data?.message || "Ocurrió un error al guardar el dueño");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{duenio ? "Editar Dueño" : "Crear Dueño"}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" name="name" 
                  value={formData.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Primer Apellido</label>
                <input type="text" className="form-control" name="fistLastName" 
                  value={formData.fistLastName} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Segundo Apellido</label>
                <input type="text" className="form-control" name="secondSurname" 
                  value={formData.secondSurname} onChange={handleChange} />
              </div>
              <div className="mb-3">
                <label className="form-label">CI</label>
                <input type="text" className="form-control" name="ci" 
                  value={formData.ci} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Celular</label>
                <input type="text" className="form-control" name="cellphone" 
                  value={formData.cellphone} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="gmail" 
                  value={formData.gmail} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
              <button type="button" className="btn btn-secondary ms-2" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DuenioForm;
