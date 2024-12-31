import React, { useState, useEffect } from 'react';
import Paso1 from './Paso1';
import Paso2 from './Paso2';
import Paso3 from './Paso3';
import Paso4 from './Paso4';
import Paso5 from './Paso5';
import './NuevaProforma.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../Header';
import SideMenu from '../SideMenu';
import '../../styles/SideMenu.css';
import '../../styles/Header.css';

const NuevaProforma = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [proformaData, setProformaData] = useState({
    tipoTrabajo: '', // Tipo de trabajo
    idCliente: null, // ID del cliente principal
    idClienteRC: null, // ID del cliente RC (si aplica)
    idInspectorB: null, // Inspector del broker
    idInspectorS: null, // Inspector del seguro
    idSeguro: null, // <--- Agregar este campo
    vehiculo: null, // Datos del vehículo
    idUsuario: user?.idUsuario || null, // ID del usuario logueado
  });

  useEffect(() => {
    // Asegurar que el usuario esté logueado y sincronizar `idUsuario` en `proformaData`
    if (!user) {
      Swal.fire('Sesión caducada', 'Por favor, inicia sesión nuevamente.', 'error').then(() => {
        navigate('/login');
      });
    }
  }, [user, navigate]);

  const avanzarPaso = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const retrocederPaso = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Paso1
            data={proformaData}
            setData={setProformaData}
            avanzarPaso={avanzarPaso}
          />
        );
      case 2:
        return (
          <Paso2
            data={proformaData}
            setData={setProformaData}
            avanzarPaso={avanzarPaso}
            retrocederPaso={retrocederPaso}
          />
        );
      case 3:
        return (
          <Paso3
            data={proformaData}
            setData={setProformaData}
            avanzarPaso={avanzarPaso}
            retrocederPaso={retrocederPaso}
          />
        );
      case 4:
        return (
          <Paso4
            data={proformaData}
            setData={setProformaData}
            avanzarPaso={avanzarPaso}
            retrocederPaso={retrocederPaso}
          />
        );
      case 5:
        return (
          <Paso5
            data={proformaData}
            setData={setProformaData}
            retrocederPaso={retrocederPaso}
          />
        );
      default:
        return null;
    }
  };

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
    <>
  <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />

  {/* Menú lateral */}
  <SideMenu
    user={user}
    handleLogout={handleLogout}
    isMenuOpen={isMenuOpen}
    toggleMenu={toggleMenu}
  />
    <div className="home-container">
      
      <div className="nueva-proforma-container">
        {/* Globitos de pasos */}
        <div className="steps-container">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`step ${step <= currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(step)}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Contenido dinámico de los pasos */}
        {renderStep()}
      </div>
    </div>
    </>
  );
};

export default NuevaProforma;