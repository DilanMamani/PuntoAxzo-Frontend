import React from 'react';

const SideMenu = ({ user, handleLogout, isMenuOpen, toggleMenu }) => {
  return (
    <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
      <div className="side-menu-close" onClick={toggleMenu}>
        &times;
      </div>
      <a href="/home">Inicio</a>
      <a href="/companias">Compañias</a>
      <a href="/proformas">Proformas</a>
      <a href="/vehiculos">Vehiculos</a>
      <a href="/precios">Precios</a>
      {user?.isMaster && ( 
        <a href="/register">Usuarios</a>
      )}
      <a onClick={handleLogout}>Cerrar Sesión</a>
    </div>
  );
};

export default SideMenu;