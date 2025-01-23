import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import Swal from 'sweetalert2';
import './EditModeloModal.css'; // Asegúrate de crear este archivo para estilos

const EditModeloModal = ({ onClose, onEditSuccess, modelo, tiposVehiculos }) => {
  const [nombreModelo, setNombreModelo] = useState(modelo.nombre);
  const [selectedTipo, setSelectedTipo] = useState(modelo.idTipo);

  const handleEditModelo = async () => {
    if (!nombreModelo.trim() || !selectedTipo) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/api/modelos/${modelo.idModelo}`,
        {
          nombre: nombreModelo.trim(),
          idTipo: parseInt(selectedTipo, 10), // Convierte el valor a número
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire('Éxito', 'El modelo ha sido actualizado con éxito.', 'success');
      if (onEditSuccess) {
        onEditSuccess(); // Refresca la lista de modelos
      }
      onClose(); // Cierra el modal
    } catch (error) {
      console.error('Error al editar el modelo:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'No se pudo editar el modelo. Verifica los datos enviados.',
        'error'
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Editar Modelo</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Nombre del Modelo:</label>
            <input
              type="text"
              value={nombreModelo}
              onChange={(e) => setNombreModelo(e.target.value)}
              placeholder="Ingrese el nuevo nombre del modelo"
              maxLength={60}
            />
          </div>
          <div className="form-group">
            <label>Tipo de Vehículo:</label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
            >
              <option value="">Seleccione un tipo</option>
              {tiposVehiculos.map((tipo) => (
                <option key={tipo.idtipo} value={tipo.idtipo}>
                  {tipo.tipo}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="save-button" onClick={handleEditModelo}>
            Guardar Cambios
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModeloModal;