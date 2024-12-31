import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../../services/axiosConfig';
import Swal from "sweetalert2";
import Header from "../../../components/Header";
import SideMenu from "../../../components/SideMenu";
import "../../../styles/SideMenu.css";
import "../../../styles/Header.css";
import "./SeguroBroker.css";

const SeguroBroker = () => {
  const { idProforma, nplaca } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Recuperar datos pasados desde la navegación
  const { idSeguro, idBroker, idInspectorS, idInspectorB } = location.state || {};

  // Estados
  const [seguros, setSeguros] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [inspectoresSeguro, setInspectoresSeguro] = useState([]);
  const [inspectoresBroker, setInspectoresBroker] = useState([]);
  const [selectedSeguro, setSelectedSeguro] = useState(idSeguro || '');
  const [selectedBroker, setSelectedBroker] = useState(idBroker || '');
  const [selectedInspectorSeguro, setSelectedInspectorSeguro] = useState(idInspectorS || '');
  const [selectedInspectorBroker, setSelectedInspectorBroker] = useState(idInspectorB || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Estás a punto de cerrar sesión",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Swal.fire({
          title: "Sesión cerrada",
          text: "Has cerrado sesión correctamente.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/login");
      }
    });
  };

  // Fetch seguros
  const fetchSeguros = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await api.get('/api/seguros', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSeguros(response.data.data);
    } catch (error) {
      console.error('Error al cargar seguros:', error);
    }
  };

  // Fetch brokers
  const fetchBrokers = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await api.get('/api/brokers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBrokers(response.data.data);
    } catch (error) {
      console.error('Error al cargar brokers:', error);
    }
  };

  // Fetch inspectores de seguro
  const fetchInspectoresSeguro = async (idSeguro) => {
    try {
      const token = getToken();
      if (!token || !idSeguro) return;
      const response = await api.get(`/api/inspectorseguro/seguro/${idSeguro}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInspectoresSeguro(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar inspectores de seguro:', error);
    }
  };

  // Fetch inspectores de broker
  const fetchInspectoresBroker = async (idBroker) => {
    try {
      const token = getToken();
      if (!token || !idBroker) return;
      const response = await api.get(`/api/inspectorbroker/broker/${idBroker}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInspectoresBroker(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar inspectores de broker:', error);
    }
  };

  useEffect(() => {
    fetchSeguros();
    fetchBrokers();
    if (selectedSeguro) fetchInspectoresSeguro(selectedSeguro);
    if (selectedBroker) fetchInspectoresBroker(selectedBroker);
  }, [selectedSeguro, selectedBroker]);

  const handleSeguroChange = (e) => {
    const idSeguro = e.target.value ? parseInt(e.target.value, 10) : '';
    setSelectedSeguro(idSeguro);
    setSelectedInspectorSeguro('');
    fetchInspectoresSeguro(idSeguro);
  };

  const handleBrokerChange = (e) => {
    const idBroker = e.target.value ? parseInt(e.target.value, 10) : '';
    setSelectedBroker(idBroker);
    setSelectedInspectorBroker('');
    fetchInspectoresBroker(idBroker);
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      if (!token) return;
  
      await api.put(
        `/api/proformas/${idProforma}/updateInspectores`,
        {
          idSeguro: selectedSeguro || null, // Aseguramos que el idSeguro también sea enviado
          idInspectorS: selectedInspectorSeguro || null,
          idBroker: selectedBroker || null, // Por si el broker también debe actualizarse
          idInspectorB: selectedInspectorBroker || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      Swal.fire('Éxito', 'Datos actualizados correctamente.', 'success');
      navigate(`/proformas/${idProforma}/${nplaca}`);
    } catch (error) {
      console.error('Error al guardar los datos:', error.response?.data || error.message);
      Swal.fire('Error', 'Hubo un problema al guardar los datos.', 'error');
    }
  };

  return (
    <div>
      <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />
      <SideMenu 
        user={user}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />
      <div className="seguros-brokers-container">
        <h2>Editar Seguro y Broker</h2>

        <div className="form-group">
          <label htmlFor="seguros">Seguro:</label>
          <select id="seguros" value={selectedSeguro} onChange={handleSeguroChange}>
            <option value="">-- Seleccionar --</option>
            {seguros.map((seguro) => (
              <option key={seguro.idSeguro} value={seguro.idSeguro}>
                {seguro.nombreSeguro}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="inspectores-seguro">Inspector de Seguro:</label>
          <select
            id="inspectores-seguro"
            value={selectedInspectorSeguro}
            onChange={(e) => setSelectedInspectorSeguro(e.target.value ? parseInt(e.target.value, 10) : '')}
          >
            <option value="">-- Seleccionar --</option>
            {inspectoresSeguro.map((inspector) => (
              <option key={inspector.idInspectorS} value={inspector.idInspectorS}>
                {inspector.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="brokers">Broker:</label>
          <select id="brokers" value={selectedBroker} onChange={handleBrokerChange}>
            <option value="">-- Seleccionar --</option>
            {brokers.map((broker) => (
              <option key={broker.idBroker} value={broker.idBroker}>
                {broker.nombreBroker}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="inspectores-broker">Inspector de Broker:</label>
          <select
            id="inspectores-broker"
            value={selectedInspectorBroker}
            onChange={(e) => setSelectedInspectorBroker(e.target.value ? parseInt(e.target.value, 10) : '')}
          >
            <option value="">-- Seleccionar --</option>
            {inspectoresBroker.map((inspector) => (
              <option key={inspector.idInspectorB} value={inspector.idInspectorB}>
                {inspector.nombre}
              </option>
            ))}
          </select>
        </div>

        <button className="btn-save-custom" onClick={handleSave}>
          Guardar
        </button>
      </div>
    </div>
  );
};

export default SeguroBroker;