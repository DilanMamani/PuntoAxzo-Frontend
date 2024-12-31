import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import './AddModal.css';
import Swal from 'sweetalert2';

const AddModal = ({ onClose, onAddSuccess, onDeleteSuccess }) => {
  const [nombreMarca, setNombreMarca] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [selectedMarca, setSelectedMarca] = useState('');

  // Obtener marcas desde el backend
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/marcas', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMarcas(response.data);
      } catch (error) {
        console.error('Error al obtener marcas:', error);
      }
    };
    fetchMarcas();
  }, []);

  // Manejo para agregar una nueva marca
  const handleAdd = async () => {
    if (!nombreMarca.trim()) {
      Swal.fire('Error', 'El nombre de la marca no puede estar vacío', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await api.post(
        '/api/marcas',
        { nombre: nombreMarca.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire('Éxito', 'La marca ha sido añadida con éxito', 'success');
      if (onAddSuccess) {
        onAddSuccess(); // Refresca la lista de marcas
      }
      onClose(); // Cierra el modal
    } catch (error) {
      console.error('Error al guardar la marca:', error);
      Swal.fire('Error', 'No se pudo guardar la marca', 'error');
    }
  };

  // Manejo para eliminar una marca seleccionada
  const handleDelete = async () => {
    if (!selectedMarca) {
      Swal.fire('Error', 'Seleccione una marca para eliminar', 'error');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await api.delete(`/api/marcas/${selectedMarca}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire('Éxito', 'La marca ha sido eliminada con éxito', 'success');
          if (onDeleteSuccess) {
            onDeleteSuccess(); // Refresca la lista de marcas
          }
          onClose(); // Cierra el modal// Reinicia la selección
        } catch (error) {
          console.error('Error al eliminar la marca:', error);
          Swal.fire('Error', 'No se pudo eliminar la marca', 'error');
        }
      }
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Administrar Marca</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {/* Sección para agregar una nueva marca */}
          <div className="add-section">
            <h4>Nueva Marca</h4>
            <div className="form-group">
              <label>Nombre de la Marca:</label>
              <input
                type="text"
                value={nombreMarca}
                onChange={(e) => setNombreMarca(e.target.value)}
              />
            </div>
            <button className="add-button" onClick={handleAdd}>
              Agregar Marca
            </button>
          </div>
          {/* Sección para eliminar una marca existente */}
          <div className="delete-section">
            <h4>Eliminar Marca</h4>
            <div className="form-group">
              <label>Seleccione una Marca:</label>
              <select
                value={selectedMarca}
                onChange={(e) => setSelectedMarca(e.target.value)}
              >
                <option value="">Seleccione una marca</option>
                {marcas.map((marca) => (
                  <option key={marca.idMarca} value={marca.idMarca}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button className="delete-button" onClick={handleDelete}>
              Eliminar Marca
            </button>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;