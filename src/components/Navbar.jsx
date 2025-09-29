import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/vite.svg"; // Cambia esto por tu logo real

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout(); // Usamos la función del contexto
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="Logo" height="40" className="me-2" />
          Sedes Farmacias
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/usuarios" onClick={toggleMenu}>
                    Usuarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/farmacias" onClick={toggleMenu}>
                    Farmacias
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/Duenio" onClick={toggleMenu}>
                    Propietarios
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/Turnos" onClick={toggleMenu}>
                    Turnos
                  </Link>
                </li>
              </>
            )}
            <li className="nav-item">
              {isAuthenticated ? (
                <button className="btn btn-outline-light" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              ) : (
                <Link className="btn btn-outline-light" to="/login">
                  Iniciar Sesión
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;