import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import './AddModal.css';
import Swal from 'sweetalert2';

const AddModal = ({ onClose, onAddSuccess }) => {
  const [tab, setTab] = useState('seguro');
  const [nombreSeguro, setNombreSeguro] = useState('');
  const [nombreInspector, setNombreInspector] = useState('');
  const [emailInspector, setEmailInspector] = useState('');
  const [telefonoInspector, setTelefonoInspector] = useState('');
  const [idSeguroInspector, setIdSeguroInspector] = useState('');
  const [idSeguroEliminar, setIdSeguroEliminar] = useState('');
  const [seguros, setSeguros] = useState([]);

  useEffect(() => {
    const fetchSeguros = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/seguros', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const segurosFiltrados = response.data.data.filter(
          (seguro) => seguro.nombreSeguro.toLowerCase() !== 'ninguno'
        );
        setSeguros(segurosFiltrados);
      } catch (error) {
        console.error('Error al obtener seguros:', error);
      }
    };
    fetchSeguros();
  }, []);

  const handleAddSeguro = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/api/seguros',
        { nombreSeguro },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Éxito', 'El seguro ha sido añadido con éxito', 'success');
      onAddSuccess();
      onClose();
    } catch (error) {
      console.error('Error al agregar seguro:', error);
      Swal.fire('Error', 'No se pudo agregar el seguro', 'error');
    }
  };

  const handleAddInspector = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/api/inspectorseguro',
        {
          nombre: nombreInspector,
          mail: emailInspector,
          nTelefono: telefonoInspector,
          idSeguro: idSeguroInspector,
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

  const handleDeleteSeguro = async () => {
    if (!idSeguroEliminar) {
      Swal.fire('Error', 'Seleccione un seguro para eliminar', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/seguros/${idSeguroEliminar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire('Éxito', 'El seguro ha sido eliminado con éxito', 'success');
      onAddSuccess();
      onClose();
    } catch (error) {
      console.error('Error al eliminar seguro:', error);
      Swal.fire('Error', 'No se pudo eliminar el seguro', 'error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <button
            className={`tab-button ${tab === 'seguro' ? 'active' : ''}`}
            onClick={() => setTab('seguro')}
          >
            Nuevo Seguro
          </button>
          <button
            className={`tab-button ${tab === 'inspector' ? 'active' : ''}`}
            onClick={() => setTab('inspector')}
          >
            Nuevo Inspector
          </button>
          <button
            className={`tab-button ${tab === 'eliminar' ? 'active' : ''}`}
            onClick={() => setTab('eliminar')}
          >
            Eliminar Seguro
          </button>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {tab === 'seguro' && (
            <div className="form-group">
              <label>Nombre del Seguro:</label>
              <input
                type="text"
                value={nombreSeguro}
                onChange={(e) => setNombreSeguro(e.target.value)}
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
                <label>Seguro:</label>
                <select
                  value={idSeguroInspector}
                  onChange={(e) => setIdSeguroInspector(e.target.value)}
                >
                  <option value="">Seleccione un seguro</option>
                  {seguros.map((seguro) => (
                    <option key={seguro.idSeguro} value={seguro.idSeguro}>
                      {seguro.nombreSeguro}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {tab === 'eliminar' && (
            <div className="form-group">
              <label>Seleccione el Seguro a Eliminar:</label>
              <select
                value={idSeguroEliminar}
                onChange={(e) => setIdSeguroEliminar(e.target.value)}
              >
                <option value="">Seleccione un seguro</option>
                {seguros.map((seguro) => (
                  <option key={seguro.idSeguro} value={seguro.idSeguro}>
                    {seguro.nombreSeguro}
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
              tab === 'seguro'
                ? handleAddSeguro
                : tab === 'inspector'
                ? handleAddInspector
                : handleDeleteSeguro
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

export default AddModal;