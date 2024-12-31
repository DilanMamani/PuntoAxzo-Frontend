import React, { useState } from 'react';
import './EditInspectorModal.css';

const EditInspectorModal = ({ inspector, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    nombre: inspector.nombre || '',
    mail: inspector.mail || '',
    nTelefono: inspector.nTelefono || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleConfirm = () => {
    onConfirm(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Inspector</h2>
        <form>
          <label>
            Nombre:
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
            />
          </label>
          <label>
            Teléfono:
            <input
              type="text"
              name="nTelefono"
              value={formData.nTelefono}
              onChange={handleChange}
            />
          </label>
        </form>
        <div className="modal-buttons">
          <button className="confirm-button" onClick={handleConfirm}>
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

export default EditInspectorModal;