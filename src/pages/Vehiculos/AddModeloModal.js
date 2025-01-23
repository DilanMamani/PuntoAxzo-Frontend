import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import Swal from 'sweetalert2';
import './AddModeloModal.css';

const AddModeloModal = ({ onClose, onAddSuccess, idMarca, nombreMarca }) => {
  const [nombreModelo, setNombreModelo] = useState('');
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [error, setError] = useState(null);

  // Obtener los tipos de vehículos al cargar el componente
  useEffect(() => {
    const fetchTipos = async () => {
      setLoadingTipos(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/tipos', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Tipos de vehículo desde la API:', response.data); // Verificar la respuesta
        setTiposVehiculos(response.data); // Almacena los tipos recibidos
      } catch (error) {
        console.error('Error al obtener los tipos de vehículos:', error);
        setError('No se pudieron cargar los tipos de vehículos.');
        Swal.fire('Error', 'No se pudieron cargar los tipos de vehículos.', 'error');
      } finally {
        setLoadingTipos(false);
      }
    };
    fetchTipos();
  }, []);

  // Manejar la creación de un nuevo modelo
  const handleAddModelo = async () => {
    if (!nombreModelo.trim() || !selectedTipo) {
      Swal.fire('Error', 'Todos los campos son obligatorios y deben ser válidos.', 'error');
      return;
    }

    try {
      console.log('Datos enviados al servidor:', {
        nombre: nombreModelo.trim(),
        idMarca,
        idTipo: parseInt(selectedTipo, 10),
      });

      const token = localStorage.getItem('token');
      await api.post(
        '/api/modelos',
        {
          nombre: nombreModelo.trim(),
          idMarca: parseInt(idMarca, 10), // Asegura que sea un número
          idTipo: parseInt(selectedTipo, 10), // Convierte a número el idTipo
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Swal.fire('Éxito', 'El modelo ha sido creado con éxito.', 'success');
      if (onAddSuccess) {
        onAddSuccess(); // Refresca los datos en el componente principal
      }
      onClose(); // Cierra el modal
    } catch (error) {
      console.error('Error al crear el modelo:', error);
      Swal.fire(
        'Error',
        error.response?.data?.message || 'No se pudo crear el modelo. Verifica los datos enviados.',
        'error'
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Nuevo Modelo</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>Marca seleccionada: <strong>{nombreMarca}</strong></p>
          <div className="form-group">
            <label>Nombre del Modelo:</label>
            <input
              type="text"
              value={nombreModelo}
              onChange={(e) => setNombreModelo(e.target.value)}
              placeholder="Ingrese el nombre del modelo"
              maxLength={60}
            />
          </div>
          <div className="form-group">
            <label>Tipo de Vehículo:</label>
            {loadingTipos ? (
              <p>Cargando tipos de vehículos...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <select
                value={selectedTipo}
                onChange={(e) => setSelectedTipo(e.target.value)} // Usa el valor directamente
              >
                <option value="">Seleccione un tipo</option>
                {tiposVehiculos.map((tipo) => (
                  <option key={tipo.idtipo} value={tipo.idtipo}> {/* Ajusta a `idtipo` */}
                    {tipo.tipo}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="add-button"
            onClick={handleAddModelo}
            disabled={loadingTipos || !nombreModelo.trim() || !selectedTipo}
          >
            Crear Modelo
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModeloModal;