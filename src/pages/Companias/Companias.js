import React, { useEffect, useState } from 'react';
import SegurosList from '../../components/companiasB/SegurosList';
import BrokersList from '../../components/companiasB/BrokersList';
import { useNavigate } from 'react-router-dom';
import './Companias.css';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SideMenu from '../../components/SideMenu';
import '../../styles/SideMenu.css';
import '../../styles/Header.css';

const Companias = () => {
  const [activeTab, setActiveTab] = useState('seguros');
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

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
    <div className="companias-container">
      {/* Tabs */}
      <div className="companias-tabs">
        <button
          className={`companias-tab ${activeTab === 'seguros' ? 'active' : ''}`}
          onClick={() => setActiveTab('seguros')}
        >
          Seguros
        </button>
        <button
          className={`companias-tab ${activeTab === 'brokers' ? 'active' : ''}`}
          onClick={() => setActiveTab('brokers')}
        >
          Brokers
        </button>
      </div>

      {/* Content */}
      <div className="companias-content">
        {activeTab === 'seguros' ? <SegurosList /> : <BrokersList />}
      </div>
      </div>
    </div>
  );
};

export default Companias;