import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = ({ user, handleLogout, toggleMenu }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="home-header">
      <nav className="nav-bar">
        <div className="hamburger-menu" onClick={toggleMenu}>
          <div className="hamburger-lines"></div>
          <div className="hamburger-lines"></div>
          <div className="hamburger-lines"></div>
        </div>
        <a
          href="/home"
          className={`nav-link ${isActive('/home') ? 'active' : ''}`}
        >
          Inicio
        </a>
        <a
          href="/companias"
          className={`nav-link ${isActive('/companias') ? 'active' : ''}`}
        >
          Compañias
        </a>
        <a
          href="/proformas"
          className={`nav-link ${isActive('/proformas') ? 'active' : ''}`}
        >
          Proformas 
        </a>
        <a
          href="/vehiculos"
          className={`nav-link ${isActive('/vehiculos') ? 'active' : ''}`}
        >
         Vehiculos
        </a>{/*
        <a
          href="/clientes"
          className={`nav-link ${isActive('/clientes') ? 'active' : ''}`}
        >
          Clientes
        </a>*/}
        <a
          href="/precios"
          className={`nav-link ${isActive('/precios') ? 'active' : ''}`}
        >
          Precios         
        </a>

        {user?.isMaster && (
          <a
            href="/register"
            className={`nav-link ${isActive('/register') ? 'active' : ''}`}
          >
            Usuarios
          </a>
        )}
      </nav>
      <a className="logout-link" onClick={handleLogout}>
        Cerrar Sesión
      </a>
    </header>
  );
};

export default Header;