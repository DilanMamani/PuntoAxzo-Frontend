import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import './AddModal.css';
import Swal from 'sweetalert2';

const AddModalBroker = ({ onClose, onAddSuccess }) => {
  const [tab, setTab] = useState('broker'); // "broker" o "inspector"
  const [nombreBroker, setNombreBroker] = useState('');
  const [nombreInspector, setNombreInspector] = useState('');
  const [emailInspector, setEmailInspector] = useState('');
  const [telefonoInspector, setTelefonoInspector] = useState('');
  const [idBrokerInspector, setIdBrokerInspector] = useState('');
  const [selectedBroker, setSelectedBroker] = useState('');
  const [brokers, setBrokers] = useState([]);

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/brokers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBrokers(response.data.data);
      } catch (error) {
        console.error('Error al obtener brokers:', error);
      }
    };
  
    fetchBrokers();
  }, []);
  const handleAddBroker = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/api/brokers',
        { nombreBroker },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Éxito', 'El broker ha sido añadido con éxito', 'success');
      onAddSuccess();
      onClose();
    } catch (error) {
      console.error('Error al agregar broker:', error);
      Swal.fire('Error', 'No se pudo agregar el broker', 'error');
    }
  };

 // En AddModalBroker.js

// En lugar de llamar a fetchBrokers directamente, puedes recargar los brokers después de eliminar.
const handleDeleteBroker = async () => {
    if (!selectedBroker) {
      Swal.fire('Atención', 'Seleccione un broker para eliminar', 'warning');
      return;
    }
  
    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
  
    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/api/brokers/${selectedBroker}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire('Éxito', 'Broker eliminado correctamente', 'success');
        // Actualiza la lista de brokers
        onAddSuccess();
        onClose();
      } catch (error) {
        Swal.fire('Error', 'Error al eliminar broker', 'error');
        console.error('Error al eliminar broker:', error);
      }
    }
  };

  const handleAddInspector = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/api/inspectorbroker',
        {
          nombre: nombreInspector,
          mail: emailInspector,
          nTelefono: telefonoInspector,
          idBroker: idBrokerInspector,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Éxito', 'El inspector ha sido añadido con éxito', 'success');
      onAddSuccess();
      onClose();
    } catch (error) {
      console.error('Error al agregar inspector:', error);
      Swal.fire('Error', 'No se pudo agregar el inspector', 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button
            className={`tab-button ${tab === 'broker' ? 'active' : ''}`}
            onClick={() => setTab('broker')}
          >
            Nuevo Broker
          </button>
          <button
            className={`tab-button ${tab === 'inspector' ? 'active' : ''}`}
            onClick={() => setTab('inspector')}
          >
            Nuevo Inspector
          </button>
          <button
            className={`tab-button danger-button`}
            onClick={() => setTab('delete')}
          >
            Eliminar Broker
          </button>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {tab === 'broker' && (
            <div className="form-group">
              <label>Nombre del Broker:</label>
              <input
                type="text"
                value={nombreBroker}
                onChange={(e) => setNombreBroker(e.target.value)}
              />
            </div>
          )}
          {tab === 'inspector' && (
            <>
              <div className="form-group">
                <label>Nombre del Inspector:</label>
                <input
                  type="text"
                  value={nombreInspector}
                  onChange={(e) => setNombreInspector(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Email del Inspector:</label>
                <input
                  type="email"
                  value={emailInspector}
                  onChange={(e) => setEmailInspector(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Teléfono del Inspector:</label>
                <input
                  type="text"
                  value={telefonoInspector}
                  onChange={(e) => setTelefonoInspector(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Broker:</label>
                <select
                  value={idBrokerInspector}
                  onChange={(e) => setIdBrokerInspector(e.target.value)}
                >
                  <option value="">Seleccione un broker</option>
                  {brokers.map((broker) => (
                    <option key={broker.idBroker} value={broker.idBroker}>
                      {broker.nombreBroker}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {tab === 'delete' && (
            <div className="form-group">
              <label>Seleccione el Broker a Eliminar:</label>
              <select
                value={selectedBroker}
                onChange={(e) => setSelectedBroker(e.target.value)}
              >
                <option value="">Seleccione un broker</option>
                {brokers.map((broker) => (
                  <option key={broker.idBroker} value={broker.idBroker}>
                    {broker.nombreBroker}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="confirm-button"
            onClick={
              tab === 'broker'
                ? handleAddBroker
                : tab === 'inspector'
                ? handleAddInspector
                : handleDeleteBroker
            }
          >
            Confirmar
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModalBroker;