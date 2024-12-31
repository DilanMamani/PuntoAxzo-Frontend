import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../../components/Header';
import SideMenu from '../../../components/SideMenu';
import api from '../../../services/axiosConfig';
import '../../../styles/SideMenu.css';
import '../../../styles/Header.css';
import './Pendientes.css';

const Pendientes = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendientes, setPendientes] = useState([]); // Almacenar las proformas pendientes
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendientes();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de cerrar sesión',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Swal.fire({
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/login');
      }
    });
  };

  const fetchPendientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/proformas', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filtrar proformas donde confirmacionpago es false
      const pendientesData = response.data.filter(
        (proforma) => !proforma.confirmacionpago
      );

      setPendientes(pendientesData);
    } catch (error) {
      console.error('Error al cargar las proformas pendientes:', error);
      Swal.fire('Error', 'No se pudieron cargar las proformas pendientes.', 'error');
    }
  };

  return (
    <div className="home-container">
      <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />
      <SideMenu
        user={user}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      <div className="pendientes-table-container">
        <h2>Proformas Pendientes de Pago</h2>
        <table className="pendientes-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Año</th>
              <th>Cliente</th>
              <th>Placa</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pendientes.map((proforma) => (
              <tr key={proforma.idproforma}>
                <td>{proforma.numerop}</td>
                <td>{proforma.anio}</td>
                <td>{proforma.cliente?.nombre || 'Sin cliente'}</td>
                <td>{proforma.nplaca}</td>
                <td>{proforma.total}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() =>
                      navigate(`/proformas/${proforma.idproforma}/${proforma.nplaca}`)
                    }
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pendientes;