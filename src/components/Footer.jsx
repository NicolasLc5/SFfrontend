// src/components/Footer.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import logo from "../assets/univalle.jpg"; // Importación correcta del logo

const Footer = () => {
  // Color de fondo basado en el logo (ajusta el código hexadecimal según necesites)
  const footerStyle = {
    backgroundColor: '#1D1D1D', // Azul oscuro universitario común
    color: 'white',
    marginTop: '10rem',
    paddingTop: '2rem',
    paddingBottom: '2rem'
  };

  return (
    <footer style={footerStyle}>
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="mb-4 mb-md-0 text-center text-md-start">
            <div className="d-flex flex-column align-items-center align-items-md-start">
              <img 
                src={logo} // Usamos la variable importada
                alt="Logo Univalle" 
                style={{ 
                  maxHeight: '200px', 
                  marginBottom: '1rem',
                  borderRadius: '4px' // Opcional: para suavizar bordes si es necesario
                }}
              />
              <p className="mb-0">Sistema de gestión para farmacias</p>
            </div>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Contacto</h5>
            <ul className="list-unstyled">
              <li><i className="bi bi-telephone me-2"></i> (591-4) 4318800 int. 4470335</li>
              <li><i className="bi bi-phone me-2"></i> 76963666</li>
              <li><i className="bi bi-envelope me-2"></i> ecallevi@univalle.edu</li>
              <li><i className="bi bi-geo-alt me-2"></i> Cochabamba - Bolivia</li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5>Enlaces</h5>
            <ul className="list-unstyled">
              <li>
                <a href="https://www.univalle.edu/" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-none">
                  <i className="bi bi-globe me-2"></i> Sitio web Univalle
                </a>
              </li>
              <li>
                <a href="/" className="text-white text-decoration-none">
                  <i className="bi bi-house-door me-2"></i> Inicio
                </a>
              </li>
              <li>
                <a href="/login" className="text-white text-decoration-none">
                  <i className="bi bi-box-arrow-in-right me-2"></i> Login
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        
        <Row className="mt-4">
          <Col className="text-center">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} Universidad del Valle. Todos los derechos reservados.
            </p>
            <p className="mb-0 mt-2">Powered by Univalle</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;