import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import './Paso1.css';

const Paso1 = ({ data, setData, avanzarPaso }) => {
  const [seguros, setSeguros] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [inspectoresSeguro, setInspectoresSeguro] = useState([]);
  const [inspectoresBroker, setInspectoresBroker] = useState([]);
  const [selectedTipoTrabajo, setSelectedTipoTrabajo] = useState(data.tipoTrabajo || '');
  const [selectedSeguro, setSelectedSeguro] = useState(data.idSeguro || '');
  const [selectedBroker, setSelectedBroker] = useState(data.idBroker || '');
  const [selectedInspectorSeguro, setSelectedInspectorSeguro] = useState(data.idInspectorS || '');
  const [selectedInspectorBroker, setSelectedInspectorBroker] = useState(data.idInspectorB || '');

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token disponible.');
      return null;
    }
    return token;
  };

  // Fetch seguros
  const fetchSeguros = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await api.get('/api/seguros', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const segurosFiltrados = response.data.data.filter(
        (seguro) => seguro.nombreSeguro.toLowerCase() !== 'ninguno'
      );
      setSeguros(segurosFiltrados);
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
      if (!token) return;
      const response = await api.get(`/api/inspectorseguro/seguro/${idSeguro}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInspectoresSeguro(response.data.data);
    } catch (error) {
      console.error('Error al cargar inspectores de seguro:', error);
    }
  };

  // Fetch inspectores de broker
  const fetchInspectoresBroker = async (idBroker) => {
    try {
      const token = getToken();
      if (!token) return;
      const response = await api.get(`/api/inspectorbroker/broker/${idBroker}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInspectoresBroker(response.data.data);
    } catch (error) {
      console.error('Error al cargar inspectores de broker:', error);
    }
  };

  useEffect(() => {
    fetchSeguros();
    fetchBrokers();
    if (selectedSeguro) fetchInspectoresSeguro(selectedSeguro);
    if (selectedBroker) fetchInspectoresBroker(selectedBroker);
  }, []);

  const handleSeguroChange = (e) => {
    const idSeguro = parseInt(e.target.value, 10);
    setSelectedSeguro(idSeguro);
    setSelectedInspectorSeguro('');
    fetchInspectoresSeguro(idSeguro);

    setData((prevData) => ({
      ...prevData,
      idSeguro: idSeguro,
      idInspectorS: null, // Limpiar el inspector si cambia el seguro
    }));
  };

  const handleBrokerChange = (e) => {
    const idBroker = parseInt(e.target.value, 10);
    setSelectedBroker(idBroker);
    setSelectedInspectorBroker('');
    fetchInspectoresBroker(idBroker);

    setData((prevData) => ({
      ...prevData,
      idBroker: idBroker,
      idInspectorB: null, // Limpiar el inspector si cambia el broker
    }));
  };

  const handleTipoTrabajoChange = (e) => {
    const tipoTrabajoSeleccionado = parseInt(e.target.value, 10);
    setSelectedTipoTrabajo(tipoTrabajoSeleccionado);

    // Configurar comportamiento según el tipo de trabajo seleccionado
    if (tipoTrabajoSeleccionado === 1) {
      // Si es "Particular", asignar idSeguro = 1
      setSelectedSeguro(1);
      setData((prevData) => ({
        ...prevData,
        tipoTrabajo: tipoTrabajoSeleccionado,
        idSeguro: 1, // idSeguro asignado automáticamente
        idBroker: null,
        idInspectorS: null,
        idInspectorB: null,
      }));
    } else if ([2, 3].includes(tipoTrabajoSeleccionado)) {
      // Limpiar datos si es "Seguro" o "Seguro RC"
      setSelectedSeguro('');
      setSelectedBroker('');
      setSelectedInspectorSeguro('');
      setSelectedInspectorBroker('');
      setData((prevData) => ({
        ...prevData,
        tipoTrabajo: tipoTrabajoSeleccionado,
        idSeguro: null,
        idBroker: null,
        idInspectorS: null,
        idInspectorB: null,
      }));
    } else {
      // Restablecer a valores por defecto para casos no válidos
      setData((prevData) => ({
        ...prevData,
        tipoTrabajo: tipoTrabajoSeleccionado,
      }));
    }
  };

  const handleNext = () => {
    if (!selectedTipoTrabajo) {
      alert('Por favor selecciona un tipo de trabajo.');
      return;
    }

    setData((prevData) => ({
      ...prevData,
      tipoTrabajo: selectedTipoTrabajo,
      idSeguro: selectedSeguro || null,
      idBroker: selectedBroker || null,
      idInspectorS: selectedInspectorSeguro || null,
      idInspectorB: selectedInspectorBroker || null,
    }));
    avanzarPaso();
  };

  return (
    <div className="paso1-container">
      <h2>Paso 1: Tipo de Trabajo</h2>
      <div className="selector-container">
        {/* Selector de Tipo de Trabajo */}
        <div className="tipo-trabajo-container">
          <label htmlFor="tipo-trabajo">Selecciona el Tipo de Trabajo:</label>
          <select
            id="tipo-trabajo"
            value={selectedTipoTrabajo}
            onChange={handleTipoTrabajoChange}
          >
            <option value="">-- Seleccionar --</option>
            <option value={1}>Particular</option>
            <option value={2}>Seguro</option>
            <option value={3}>Seguro RC</option>
          </select>
        </div>

        {/* Mostrar según el Tipo de Trabajo */}
        {(selectedTipoTrabajo === 2 || selectedTipoTrabajo === 3) && (
          <>
            {/* Selector de Seguro */}
            <div className="seguros-container">
              <label htmlFor="seguros">Selecciona un Seguro:</label>
              <select
                id="seguros"
                value={selectedSeguro}
                onChange={handleSeguroChange}
              >
                <option value="">-- Seleccionar --</option>
                {seguros.map((seguro) => (
                  <option key={seguro.idSeguro} value={seguro.idSeguro}>
                    {seguro.nombreSeguro}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Inspector de Seguro */}
            {selectedSeguro && (
              <div className="inspectores-seguro-container">
                <label htmlFor="inspectores-seguro">Selecciona un Inspector:</label>
                <select
                  id="inspectores-seguro"
                  value={selectedInspectorSeguro}
                  onChange={(e) => setSelectedInspectorSeguro(parseInt(e.target.value, 10))}
                >
                  <option value="">-- Seleccionar --</option>
                  {inspectoresSeguro.map((inspector) => (
                    <option key={inspector.idInspectorS} value={inspector.idInspectorS}>
                      {inspector.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selector de Broker */}
            <div className="brokers-container">
              <label htmlFor="brokers">Selecciona un Broker:</label>
              <select
                id="brokers"
                value={selectedBroker}
                onChange={handleBrokerChange}
              >
                <option value="">-- Seleccionar --</option>
                {brokers.map((broker) => (
                  <option key={broker.idBroker} value={broker.idBroker}>
                    {broker.nombreBroker}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Inspector de Broker */}
            {selectedBroker && (
              <div className="inspectores-broker-container">
                <label htmlFor="inspectores-broker">Selecciona un Inspector:</label>
                <select
                  id="inspectores-broker"
                  value={selectedInspectorBroker}
                  onChange={(e) => setSelectedInspectorBroker(parseInt(e.target.value, 10))}
                >
                  <option value="">-- Seleccionar --</option>
                  {inspectoresBroker.map((inspector) => (
                    <option key={inspector.idInspectorB} value={inspector.idInspectorB}>
                      {inspector.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>
      <button className="btn-next-custom" onClick={handleNext}>
        Siguiente
      </button>
    </div>
  );
};

export default Paso1;