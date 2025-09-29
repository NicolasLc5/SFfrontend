import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Spinner, Alert } from 'react-bootstrap';

const Turnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Obtener mes actual (1-12)
  const currentMonth = new Date().getMonth() + 1;
  
  const [filtros, setFiltros] = useState({
    codigo: '',
    mes: currentMonth.toString() // Mes actual por defecto
  });

  // Meses para el combobox
  const meses = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // Cargar códigos disponibles
  useEffect(() => {
    const fetchCodigos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/codigos');
        setCodigos(response.data);
      } catch (err) {
        setError('Error al cargar códigos');
      }
    };
    fetchCodigos();
  }, []);

  // Cargar turnos
  useEffect(() => {
    const fetchTurnos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5000/api/turnos/filtrados', {
          params: {
            codigo: filtros.codigo,
            mes: filtros.mes
          }
        });
        
        setTurnos(response.data);
      } catch (err) {
        setError('Error al cargar turnos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTurnos();
  }, [filtros]);

  const handleEnviarCorreos = async () => {
    if (turnos.length === 0) {
      setError('No hay turnos para enviar');
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post('http://localhost:5000/api/turnos/enviar-correos', {
        turnos: turnos
      });
      
      const { exitosos, fallidos, message } = response.data;
      
      if (fallidos > 0) {
        setSuccess(`${message}. Ver detalles en consola.`);
        console.log('Detalles de envío:', response.data.detalles);
      } else {
        setSuccess(message);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      'Error al enviar correos';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  

  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Turnos</h1>
      
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      
      <div className="row mb-4">
        <div className="col-md-4">
          <Form.Group>
            <Form.Label>Código de Farmacia</Form.Label>
            <Form.Control
              as="select"
              name="codigo"
              value={filtros.codigo}
              onChange={handleChangeFiltro}
            >
              <option value="">Todos los códigos</option>
              {codigos.map(codigo => (
                <option key={codigo.id} value={codigo.name}>
                  {codigo.name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>
        
        <div className="col-md-4">
          <Form.Group>
            <Form.Label>Mes</Form.Label>
            <Form.Control
              as="select"
              name="mes"
              value={filtros.mes}
              onChange={handleChangeFiltro}
            >
              {meses.map(mes => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>
        
        <div className="col-md-4 d-flex align-items-end">
          <Button 
            variant="primary" 
            onClick={handleEnviarCorreos}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ml-2">Enviando...</span>
              </>
            ) : 'Enviar Correos'}
          </Button>
        </div>
      </div>
      
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Código</th>
              <th>Farmacia</th>
              <th>Fecha Turno</th>
              <th>Dueño</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {loading && turnos.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  <Spinner animation="border" />
                </td>
              </tr>
            ) : turnos.length > 0 ? (
              turnos.map(turno => (
                <tr key={turno.pharmacy_id}>
                  <td>{turno.pharmacy_code}</td>
                  <td>{turno.pharmacy_name}</td>
                  <td>{new Date(turno.shift_date).toLocaleDateString()}</td>
                  <td>{turno.owner_name}</td>
                  <td>{turno.owner_email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No hay turnos disponibles para este mes</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Turnos;