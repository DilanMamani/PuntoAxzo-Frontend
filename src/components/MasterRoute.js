import React from 'react';
import { Navigate } from 'react-router-dom';

const MasterRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user')); // Obtener usuario del localStorage

  // Verificar si el usuario es Master
  if (!user || !user.isMaster) {
    return <Navigate to="/home" state={{ from: '/register' }} />;// Redirigir al Welcome si no es Master
  }

  return children; // Renderizar hijos si es Master
};

export default MasterRoute;