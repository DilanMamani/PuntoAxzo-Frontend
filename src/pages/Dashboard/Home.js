import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Home.css';
import Header from '../../components/Header';
import SideMenu from '../../components/SideMenu';
import api from '../../services/axiosConfig';
import '../../styles/SideMenu.css';
import '../../styles/Header.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [recentProformas, setRecentProformas] = useState([]); // Estado para los últimos 5 proformas
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }

    fetchRecentProformas(); // Cargar los últimos 5 proformas
  }, [navigate]);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const fetchRecentProformas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire('Error', 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'error');
        navigate('/login');
        return;
      }
  
      const isTokenExpired = () => {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          return payload.exp && currentTime > payload.exp;
        } catch (e) {
          return true;
        }
      };
  
      if (isTokenExpired()) {
        Swal.fire('Error', 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', 'error');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
  
      const response = await api.get('/api/proformasRec', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentProformas(response.data || []);
    } catch (error) {
      console.error('Error al cargar los últimos proformas:', error);
      Swal.fire('Error', 'No se pudieron cargar los últimos proformas.', 'error');
    }
  };
  return (
    <div className="home-container">
      {/* Barra de navegación superior */}
      <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />

      {/* Menú lateral */}
      <SideMenu
        user={user}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />

      {/* Contenido principal */}
      <div className="home-content">
        <div className="left-content">
          <div className="card user-info">
            <h2>Datos del Usuario</h2>
            {user ? (
              <>
                <p><strong>Nombre:</strong> {user.nombre}</p>
                <p><strong>Email:</strong> {user.mail}</p>
                <p><strong>CI:</strong> {user.ci}</p>
                <p><strong>Teléfono:</strong> {user.telefono}</p>
              </>
            ) : (
              <p>Cargando...</p>
            )}
          </div>
        </div>

        {/* Últimos proformas */}
        <div className="recent-proformas">
          <h2>Últimos Proformas</h2>
          <table className="recent-proformas-table">
            <thead>
              <tr>
                <th>Numero P</th>
                <th>Placa</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recentProformas.map((proforma) => (
                <tr key={proforma.idproforma}>
                  <td>{proforma.numerop}/{proforma.anio}</td>
                  <td>{proforma.nplaca}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => navigate(`/proformas/${proforma.idproforma}/${proforma.nplaca}`)}
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
    </div>
  );
};

export default Home;