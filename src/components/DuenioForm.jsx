import React, { useState, useEffect } from "react";
import axios from "axios";

function DuenioForm({ duenio, onClose, setDuenios, duenios }) {
  const [formData, setFormData] = useState({
    name: "",
    fistLastName: "",
    secondSurname: "",
    ci: "",
    cellphone: "",
    gmail: ""
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (duenio) {
      axios
        .put(`http://localhost:5000/api/duenios/${duenio.id}`, formData)
        .then((response) => {
          setDuenios(duenios.map(d => d.id === duenio.id ? response.data : d));
          onClose();
        })
        .catch((error) => console.error("Error al actualizar dueño:", error));
    } else {
      axios
        .post("http://localhost:5000/api/duenios", formData)
        .then((response) => {
          setDuenios([...duenios, response.data]);
          onClose();
        })
        .catch((error) => console.error("Error al crear dueño:", error));
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
              <button type="submit" className="btn btn-success">Guardar</button>
              <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>
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