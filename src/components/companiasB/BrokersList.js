import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import EditInspectorModal from './EditInspectorModal';
import './BrokersList.css';
import AddModal from './AddModalBroker';
import Swal from 'sweetalert2';

const BrokersList = () => {
  const [brokers, setBrokers] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [inspectores, setInspectores] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInspector, setEditingInspector] = useState(null);

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token disponible.');
      return null;
    }
    return token;
  };

  const fetchInspectores = async (idBroker) => {
    try {
      const token = getToken();
      if (!token) return;
  
      const response = await api.get(`/api/inspectorbroker/broker/${idBroker}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Si no hay inspectores, establece la lista como vacía
      if (response.data.data.length === 0) {
        setInspectores([]);
      } else {
        setInspectores(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener inspectores:', error);
      // Limpia la lista de inspectores en caso de error
      setInspectores([]);
    }
  };

  const fetchBrokers = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.get('/api/brokers', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data.length > 0) {
        const brokerList = response.data.data;
        setBrokers(brokerList);
        setSelectedBroker(brokerList[0].idBroker);
        fetchInspectores(brokerList[0].idBroker);
      }
    } catch (error) {
      console.error('Error al obtener brokers:', error);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  const handleDelete = async (idInspectorB) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await api.delete(`/api/inspectorbroker/${idInspectorB}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          Swal.fire('¡Eliminado!', 'El inspector ha sido eliminado.', 'success');
          fetchInspectores(selectedBroker);
        } catch (error) {
          console.error('Error al eliminar el inspector:', error);
          Swal.fire('Error', 'Ocurrió un error al intentar eliminar el inspector.', 'error');
        }
      }
    });
  };

  const handleEditClick = (inspector) => {
    if (!inspector || !inspector.idInspectorB) {
      console.error('Inspector inválido:', inspector);
      return;
    }
    setEditingInspector(inspector);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingInspector(null);
  };

  const handleModalConfirm = async (updatedData) => {
    try {
      if (!editingInspector || !editingInspector.idInspectorB) {
        console.error('El inspector no tiene un ID válido.');
        return;
      }

      await api.put(`/api/inspectorbroker/${editingInspector.idInspectorB}`, updatedData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      fetchInspectores(selectedBroker);
      setModalOpen(false);
      setEditingInspector(null);
    } catch (error) {
      console.error('Error al actualizar el inspector:', error);
    }
  };

  return (
    <div>
      <button className="add-button" onClick={() => setAddModalOpen(true)}>
        Editar
      </button>
      {addModalOpen && (
        <AddModal
          onClose={() => setAddModalOpen(false)}
          onAddSuccess={() => fetchBrokers()} // Refresca la lista al agregar
        />
      )}

      <div className="brokers-inspectores-container">
        <div className="brokers-list">
          <ul>
            {brokers.map((broker) => (
              <li key={broker.idBroker}>
                <button
                  className={`broker-button ${selectedBroker === broker.idBroker ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedBroker(broker.idBroker);
                    fetchInspectores(broker.idBroker);
                  }}
                >
                  {broker.nombreBroker}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="inspectores-list">
          {inspectores.length > 0 ? (
            <table className="inspectores-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inspectores.map((inspector) => (
                  <tr key={inspector.idInspectorB}>
                    <td>{inspector.nombre}</td>
                    <td>{inspector.mail}</td>
                    <td>{inspector.nTelefono}</td>
                    <td>
                      <button onClick={() => handleEditClick(inspector)} className="btn-modify">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(inspector.idInspectorB)} className="btn-delete">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-inspectores">
              No hay inspectores disponibles para este broker.
            </div>
          )}
        </div>
        {modalOpen && (
          <EditInspectorModal
            inspector={editingInspector}
            onClose={handleModalClose}
            onConfirm={handleModalConfirm}
          />
        )}
      </div>
    </div>
  );
};

export default BrokersList;