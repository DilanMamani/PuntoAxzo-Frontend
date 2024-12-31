import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import EditInspectorModal from './EditInspectorModal';
import './SegurosList.css';
import AddModal from './AddModal';
import Swal from 'sweetalert2';

const SegurosList = () => {
  const [seguros, setSeguros] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [inspectores, setInspectores] = useState([]);
  const [selectedSeguro, setSelectedSeguro] = useState(null);
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
  // Mueve fetchInspectores fuera del useEffect
  const fetchInspectores = async (idSeguro) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token disponible.');
        return;
      }
      const response = await api.get(`/api/inspectorseguro/seguro/${idSeguro}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInspectores(response.data.data);
    } catch (error) {
      console.error('Error al obtener inspectores:', error);
    }
  };

  const fetchSeguros = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token disponible.');
        return;
      }
      const response = await api.get('/api/seguros', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data.data.length > 0) {
        // Filtra seguros para excluir aquellos con el nombre "ninguno"
        const segurosFiltrados = response.data.data.filter(
          (seguro) => seguro.nombreSeguro.toLowerCase() !== 'ninguno'
        );
        setSeguros(segurosFiltrados);
  
        if (segurosFiltrados.length > 0) {
          setSelectedSeguro(segurosFiltrados[0].idSeguro);
          fetchInspectores(segurosFiltrados[0].idSeguro);
        }
      }
    } catch (error) {
      console.error('Error al obtener seguros:', error);
    }
  };
  useEffect(() => {
    fetchSeguros();
  }, []);
  const handleDelete = async (idInspectorS) => {
    console.log('ID recibido para eliminar:', idInspectorS);
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await api.delete(`/api/inspectorseguro/${idInspectorS}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                console.log('Inspector eliminado:', response.data);
                Swal.fire('¡Eliminado!', 'El inspector ha sido eliminado.', 'success');
                // Actualizar la lista de inspectores después de eliminar
                fetchInspectores(selectedSeguro);
            } catch (error) {
                console.error("Error al eliminar el inspector:", error);
                Swal.fire('Error', 'Ocurrió un error al intentar eliminar el inspector.', 'error');
            }
        }
    });
};
  // Define handleEditClick
  const handleEditClick = (inspector) => {
    if (!inspector || !inspector.idInspectorS) { // Cambiado a idInspectorS
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
      if (!editingInspector || !editingInspector.idInspectorS) { // Cambiado a idInspectorS
        console.error('El inspector no tiene un ID válido.');
        return;
      }
  
      await api.put(`/api/inspectorseguro/${editingInspector.idInspectorS}`, updatedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      fetchInspectores(selectedSeguro); // Refresca la lista de inspectores
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
    onAddSuccess={() => fetchSeguros()} // Refresca la lista al agregar
  />
)}
  
    <div className="seguros-inspectores-container">
      <div className="seguros-list">
        <ul>
          {seguros.map((seguro) => (
            <li key={seguro.idSeguro}>
              <button
                className={`seguro-button ${selectedSeguro === seguro.idSeguro ? 'active' : ''}`}
                onClick={() => {
                  setSelectedSeguro(seguro.idSeguro);
                  fetchInspectores(seguro.idSeguro);
                }}
              >
                {seguro.nombreSeguro}
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
        <tr key={inspector.idInspectorS}>
            <td>{inspector.nombre}</td>
            <td>{inspector.mail}</td>
            <td>{inspector.nTelefono}</td>
            <td>
                <button
                    onClick={() => handleEditClick(inspector)}
                    className="btn-modify"
                >
                    Editar
                </button>
                <button
                    onClick={() => handleDelete(inspector.idInspectorS)}
                    className="btn-delete"
                >
                    Eliminar
                </button>
            </td>
        </tr>
    ))}
</tbody>
          </table>
        ) : (
          <div className="no-inspectores">No hay inspectores disponibles para este seguro.</div>
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

export default SegurosList;