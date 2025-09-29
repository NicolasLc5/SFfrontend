import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import icono from "../assets/pharmacy-icon.png";

// Configuración del ícono del marcador
const pharmacyIcon = new L.Icon({
  iconUrl: icono,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Eliminar el ícono por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Home() {
  const [farmacias, setFarmacias] = useState([]);
  const [selectedFarmacia, setSelectedFarmacia] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtro, setFiltro] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmacias = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let url = "http://localhost:5000/api/farmacias";
        if (filtro) url += `/filtradas?filtro=${filtro}`;

        const response = await axios.get(url);
        setFarmacias(response.data);
      } catch (error) {
        console.error("Error al obtener farmacias:", error);
        setError("Error al cargar las farmacias. Intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmacias();
  }, [filtro]);

  const handleSelectFarmacia = async (farmacia) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/farmacias/${farmacia.id}`);
      let farmaciaData = response.data;
      
      // Asegurar que la imagen tenga el formato correcto
      if (farmaciaData.image && !farmaciaData.image.startsWith('data:image')) {
        farmaciaData.image = `data:image/jpeg;base64,${farmaciaData.image}`;
      }
      
      setSelectedFarmacia(farmaciaData);
    } catch (error) {
      console.error("Error al obtener detalles de la farmacia:", error);
      setError("Error al cargar los detalles de la farmacia.");
    } finally {
      setIsLoading(false);
    }
  };

  const farmaciasFiltradas = farmacias.filter((farmacia) =>
    farmacia.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="text-center text-primary mb-3">Sedes Farmacias</h1>
          <p className="text-center lead">Encuentra farmacias fácilmente en el mapa</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8 offset-md-2">
          <div className="input-group">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Buscar farmacias por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" type="button">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
      )}

      <div className="row">
        {/* Panel de información de la farmacia */}
        <div className="col-md-4 mb-4 mb-md-0">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Información de la Farmacia</h5>
            </div>
            <div className="card-body">
              {isLoading && selectedFarmacia ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : selectedFarmacia ? (
                <>
                  <h4 className="card-title text-center mb-3">{selectedFarmacia.name}</h4>
                  
                  {selectedFarmacia.image ? (
                    <div className="text-center mb-3">
                      <img 
                        src={selectedFarmacia.image} 
                        alt={`Farmacia ${selectedFarmacia.name}`}
                        className="img-fluid rounded shadow"
                        style={{ 
                          maxHeight: '200px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = icono;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center mb-3">
                      <img 
                        src={icono} 
                        alt="Farmacia sin imagen"
                        className="img-fluid rounded"
                        style={{ maxHeight: '150px' }}
                      />
                    </div>
                  )}
                  
                  <ul className="list-group list-group-flush mb-3">
                    <li className="list-group-item">
                      <strong>Sector:</strong> {selectedFarmacia.sectorType == '0' ? 'Privado' : 'Público'}
                    </li>
                    <li className="list-group-item">
                      <strong>Horario de Apertura:</strong> {selectedFarmacia.openingHours === '8' ? '8:00 AM' : '12:00 PM'}
                    </li>
                    <li className="list-group-item">
                      <strong>Dirección:</strong> {selectedFarmacia.address || 'No disponible'}
                    </li>
                    <li className="list-group-item">
                      <strong>NIT:</strong> {selectedFarmacia.nit || 'No disponible'}
                    </li>
                  </ul>
                </>
              ) : (
                <div className="text-center py-4">
                  <img 
                    src={icono} 
                    alt="Seleccione una farmacia"
                    className="img-fluid mb-3"
                    style={{ maxHeight: '150px' }}
                  />
                  <p className="text-muted">Seleccione una farmacia en el mapa para ver más detalles</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="col-md-5 mb-4 mb-md-0">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Mapa de Farmacias</h5>
            </div>
            <div className="card-body p-0">
              <div style={{ height: '100%', minHeight: '400px' }}>
                <MapContainer 
                  center={[-17.3934, -66.1451]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {farmaciasFiltradas.map((farmacia) => {
                    const latitud = parseFloat(farmacia.latitude);
                    const longitud = parseFloat(farmacia.longitude);

                    if (isNaN(latitud) || isNaN(longitud)) {
                      console.error(`Coordenadas inválidas para ${farmacia.name}:`, latitud, longitud);
                      return null;
                    }

                    return (
                      <Marker
                        key={farmacia.id}
                        position={[latitud, longitud]}
                        icon={pharmacyIcon}
                        eventHandlers={{ 
                          click: () => handleSelectFarmacia(farmacia),
                          mouseover: (e) => e.target.openPopup()
                        }}
                      >
                        <Popup>
                          <div>
                            <h6>{farmacia.name}</h6>
                            <p className="mb-1">
                              <small>{farmacia.address || 'Dirección no disponible'}</small>
                            </p>
                            <button 
                              className="btn btn-sm btn-primary mt-1"
                              onClick={() => handleSelectFarmacia(farmacia)}
                            >
                              Ver detalles
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Filtros</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className={`btn ${filtro === "" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFiltro("")}
                >
                  Todas las Farmacias
                </button>
                
                <button 
                  className={`btn ${filtro === "con_sustancias" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFiltro("con_sustancias")}
                >
                  Con Sustancias Controladas
                </button>
                
                <button 
                  className={`btn ${filtro === "turno_hoy" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFiltro("turno_hoy")}
                >
                  Farmacias de Turno
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;