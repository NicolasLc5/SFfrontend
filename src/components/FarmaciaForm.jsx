import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const API_URL = import.meta.env.VITE_API_URL; // <-- variable de entorno

// Configurar icono de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) map.flyTo(position, map.getZoom());
  }, [position, map]);

  return position ? (
    <Marker
      position={position}
      draggable
      eventHandlers={{ dragend: (e) => setPosition(e.target.getLatLng()) }}
    />
  ) : null;
}

function FarmaciaForm({ farmaciaId, onClose, setFarmacias, farmacias }) {
  const [formData, setFormData] = useState({ /* mismo state que antes */ });
  const [position, setPosition] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [duenios, setDuenios] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [sustancias, setSustancias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [zonasRes, dueniosRes, codigosRes, sustanciasRes, usuariosRes] = await Promise.all([
          axios.get(`${API_URL}/api/zonas`),
          axios.get(`${API_URL}/api/duenios`),
          axios.get(`${API_URL}/api/codigos`),
          axios.get(`${API_URL}/api/sustancias`),
          axios.get(`${API_URL}/api/usuarios`)
        ]);

        setZonas(zonasRes.data);
        setDuenios(dueniosRes.data);
        setCodigos(codigosRes.data);
        setSustancias(sustanciasRes.data);
        setUsuarios(usuariosRes.data);

        if (farmaciaId) {
          const farmaciaRes = await axios.get(`${API_URL}/api/farmacias/${farmaciaId}`);
          const f = farmaciaRes.data;
          setFormData({ /* asignación igual que antes */ });
          if (f.latitude && f.longitude) setPosition({ lat: parseFloat(f.latitude), lng: parseFloat(f.longitude) });
          if (f.image) setPreviewImage(f.image);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar datos iniciales');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [farmaciaId]);

  useEffect(() => {
    if (position?.lat && position?.lng) {
      setFormData(prev => ({ ...prev, latitude: position.lat.toString(), longitude: position.lng.toString() }));
    }
  }, [position]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => { /* igual que antes */ };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const requiredFields = ['name','recordNumber','address','latitude','longitude','businessName','nit','Zone_id','Owner_id','Code_id','User_id'];
      const missingFields = requiredFields.filter(f => !formData[f]);
      if (missingFields.length) throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);

      const dataToSend = { /* igual que antes, parse ints y floats */ };

      if (farmaciaId) {
        await axios.put(`${API_URL}/api/farmacias/${farmaciaId}`, dataToSend);
        setFarmacias(farmacias.map(f => f.id === farmaciaId ? { ...f, ...dataToSend } : f));
      } else {
        const res = await axios.post(`${API_URL}/api/farmacias`, dataToSend);
        setFarmacias([...farmacias, res.data]);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error desconocido al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="modal show d-block text-center p-5"><div className="spinner-border text-primary"></div><p>Cargando...</p></div>;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{farmaciaId ? 'Editar Farmacia' : 'Crear Farmacia'}</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              {/* aquí iría todo tu HTML del form igual que antes */}
              <div className="modal-footer mt-3">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : (farmaciaId ? 'Actualizar' : 'Guardar')}
                </button>
                <button type="button" className="btn btn-secondary ms-2" onClick={onClose} disabled={isSubmitting}>
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

export default FarmaciaForm;
