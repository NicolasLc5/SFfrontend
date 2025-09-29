import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configurar el icono del marcador
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
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position ? (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    setPosition(e.target.getLatLng());
                }
            }}
        />
    ) : null;
}

function FarmaciaForm({ farmaciaId, onClose, setFarmacias, farmacias }) {
    const [formData, setFormData] = useState({
        name: '',
        recordNumber: '',
        address: '',
        latitude: '',
        longitude: '',
        businessName: '',
        nit: '',
        Zone_id: '',
        Owner_id: '',
        Code_id: '',
        User_id: '',
        ControlledSubstances_id: '',
        image: null,
        openingHours: '8',
        sectorType: '0'
    });

    const [position, setPosition] = useState(null);
    const [zonas, setZonas] = useState([]);
    const [duenios, setDuenios] = useState([]);
    const [codigos, setCodigos] = useState([]);
    const [sustancias, setSustancias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [previewImage, setPreviewImage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Cargar datos iniciales
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                // Cargar comboboxes
                const [zonasRes, dueniosRes, codigosRes, sustanciasRes, usuariosRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/zonas'),
                    axios.get('http://localhost:5000/api/duenios'),
                    axios.get('http://localhost:5000/api/codigos'),
                    axios.get('http://localhost:5000/api/sustancias'),
                    axios.get('http://localhost:5000/api/usuarios')
                ]);

                setZonas(zonasRes.data);
                setDuenios(dueniosRes.data);
                setCodigos(codigosRes.data);
                setSustancias(sustanciasRes.data);
                setUsuarios(usuariosRes.data);

                // Si estamos editando, cargar los datos de la farmacia
                if (farmaciaId) {
                    const farmaciaRes = await axios.get(`http://localhost:5000/api/farmacias/${farmaciaId}`);
                    const farmaciaData = farmaciaRes.data;

                    setFormData({
                        name: farmaciaData.name || '',
                        recordNumber: farmaciaData.recordNumber || '',
                        address: farmaciaData.address || '',
                        latitude: farmaciaData.latitude?.toString() || '',
                        longitude: farmaciaData.longitude?.toString() || '',
                        businessName: farmaciaData.businessName || '',
                        nit: farmaciaData.nit || '',
                        Zone_id: farmaciaData.Zone_id?.toString() || '',
                        Owner_id: farmaciaData.Owner_id?.toString() || '',
                        Code_id: farmaciaData.Code_id?.toString() || '',
                        User_id: farmaciaData.User_id?.toString() || '',
                        ControlledSubstances_id: farmaciaData.ControlledSubstances_id?.toString() || '',
                        image: farmaciaData.image || null,
                        openingHours: farmaciaData.openingHours?.toString() || '8',
                        sectorType: farmaciaData.sectorType?.toString() || '0'
                    });

                    if (farmaciaData.latitude && farmaciaData.longitude) {
                        setPosition({
                            lat: parseFloat(farmaciaData.latitude),
                            lng: parseFloat(farmaciaData.longitude)
                        });
                    }

                    if (farmaciaData.image) {
                        setPreviewImage(farmaciaData.image);
                    }
                }
            } catch (error) {
                console.error('Error cargando datos:', error);
                setError('Error al cargar los datos iniciales');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [farmaciaId]);

    // Actualizar coordenadas cuando cambia el marcador
    useEffect(() => {
        if (position && typeof position.lat === 'number' && typeof position.lng === 'number') {
            setFormData(prev => ({
                ...prev,
                latitude: position.lat.toString(),
                longitude: position.lng.toString()
            }));
        }
    }, [position]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen es demasiado grande (máximo 5MB)');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setFormData(prev => ({ ...prev, image: reader.result }));
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validar campos requeridos
        const requiredFields = [
            'name', 'recordNumber', 'address', 'latitude', 'longitude',
            'businessName', 'nit', 'Zone_id', 'Owner_id', 'Code_id', 'User_id'
        ];
        
        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            setError(`Faltan campos requeridos: ${missingFields.join(', ')}`);
            return;
        }

        try {
            // Preparar datos para enviar
            const dataToSend = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                openingHours: parseInt(formData.openingHours),
                sectorType: parseInt(formData.sectorType),
                Zone_id: parseInt(formData.Zone_id),
                Owner_id: parseInt(formData.Owner_id),
                Code_id: parseInt(formData.Code_id),
                User_id: parseInt(formData.User_id),
                ControlledSubstances_id: formData.ControlledSubstances_id ? parseInt(formData.ControlledSubstances_id) : null
            };

            if (farmaciaId) {
                await axios.put(`http://localhost:5000/api/farmacias/${farmaciaId}`, dataToSend);
                const updatedFarmacias = farmacias.map(f =>
                    f.id === farmaciaId ? { ...f, ...dataToSend } : f
                );
                setFarmacias(updatedFarmacias);
            } else {
                const response = await axios.post('http://localhost:5000/api/farmacias', dataToSend);
                setFarmacias([...farmacias, response.data]);
            }
            
            onClose();
        } catch (error) {
            console.error('Error al guardar farmacia:', error);
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.message || 
                               error.message || 
                               'Error desconocido al guardar';
            setError(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-body text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-3">Cargando datos de la farmacia...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{farmaciaId ? 'Editar Farmacia' : 'Crear Farmacia'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Nombre de Farmacia*</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="name"
                                            value={formData.name} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Número de Registro*</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="recordNumber"
                                            value={formData.recordNumber} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Dirección*</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="address"
                                            value={formData.address} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Razón Social*</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="businessName"
                                            value={formData.businessName} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">NIT*</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="nit"
                                            value={formData.nit} 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Horario de Apertura*</label>
                                        <select 
                                            className="form-select" 
                                            name="openingHours"
                                            value={formData.openingHours} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="8">8:00 AM</option>
                                            <option value="12">12:00 PM</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Tipo de Sector*</label>
                                        <select 
                                            className="form-select" 
                                            name="sectorType"
                                            value={formData.sectorType} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="0">Privado</option>
                                            <option value="1">Público</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Zona*</label>
                                        <select 
                                            className="form-select" 
                                            name="Zone_id"
                                            value={formData.Zone_id} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="">Seleccione una zona</option>
                                            {zonas.map(zona => (
                                                <option key={zona.id} value={zona.id}>{zona.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Dueño*</label>
                                        <select 
                                            className="form-select" 
                                            name="Owner_id"
                                            value={formData.Owner_id} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="">Seleccione un dueño</option>
                                            {duenios.map(duenio => (
                                                <option key={duenio.id} value={duenio.id}>
                                                    {`${duenio.name} ${duenio.fistLastName}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Código*</label>
                                        <select 
                                            className="form-select" 
                                            name="Code_id"
                                            value={formData.Code_id} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="">Seleccione un código</option>
                                            {codigos.map(codigo => (
                                                <option key={codigo.id} value={codigo.id}>{codigo.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Sustancia Controlada</label>
                                        <select 
                                            className="form-select" 
                                            name="ControlledSubstances_id"
                                            value={formData.ControlledSubstances_id} 
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione una sustancia</option>
                                            {sustancias.map(sustancia => (
                                                <option key={sustancia.id} value={sustancia.id}>{sustancia.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Usuario Responsable*</label>
                                        <select 
                                            className="form-select" 
                                            name="User_id"
                                            value={formData.User_id} 
                                            onChange={handleChange} 
                                            required
                                        >
                                            <option value="">Seleccione un usuario</option>
                                            {usuarios.map(usuario => (
                                                <option key={usuario.id} value={usuario.id}>{usuario.username}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Imagen (max 5MB)</label>
                                        <input 
                                            type="file" 
                                            className="form-control" 
                                            accept="image/*"
                                            onChange={handleFileChange} 
                                        />
                                        {previewImage && (
                                            <div className="mt-2">
                                                <img 
                                                    src={previewImage} 
                                                    alt="Preview" 
                                                    style={{ maxWidth: '100%', maxHeight: '150px' }} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="row mt-3">
                                <div className="col-12">
                                    <label className="form-label">Ubicación en Mapa* (haga clic para seleccionar)</label>
                                    <div style={{ height: '300px', width: '100%' }}>
                                        <MapContainer
                                            key={position ? `${position.lat}-${position.lng}` : 'default-map'}
                                            center={position || [-17.7833, -63.1821]}
                                            zoom={13}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <LocationMarker position={position} setPosition={setPosition} />
                                        </MapContainer>
                                    </div>
                                    <div className="mt-2">
                                        <span>Latitud: {formData.latitude || 'No seleccionada'}</span>
                                        <span className="ms-3">Longitud: {formData.longitude || 'No seleccionada'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer mt-3">
                                <button type="submit" className="btn btn-primary">
                                    {farmaciaId ? 'Actualizar' : 'Guardar'}
                                </button>
                                <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>
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