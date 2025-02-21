import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/axiosConfig';
import './Cliente.css';
import Swal from "sweetalert2";
import Header from "../../../components/Header";
import SideMenu from "../../../components/SideMenu";
import "../../../styles/SideMenu.css";
import "../../../styles/Header.css";

const Cliente = () => {
  const { idProforma, nplaca } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Recuperar datos pasados desde la navegación
  const { idtrabajo, cliente, clienteRC, nplaca2 } = location.state || {};

  // Estado para los datos del cliente principal
  const [nombre, setNombre] = useState(cliente?.nombre || '');
  const [telefono, setTelefono] = useState(cliente?.telefono || '');
  const [correo, setCorreo] = useState(cliente?.mail || '');
  const [clienteId, setClienteId] = useState(cliente?.idCliente || null);
  
  // Estado para Cliente RC (si aplica)
  const [nombreRC, setNombreRC] = useState(clienteRC?.nombre || '');
  const [telefonoRC, setTelefonoRC] = useState(clienteRC?.telefono || '');
  const [correoRC, setCorreoRC] = useState(clienteRC?.mail || '');
  const [clienteIdRC, setClienteIdRC] = useState(clienteRC?.idCliente || null);

  const getToken = () => localStorage.getItem('token');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSave = async () => {
    try {
      const token = getToken();
      if (!token) return;
  
      if (!clienteId) {
        Swal.fire("Error", "No hay un cliente seleccionado para actualizar.", "error");
        return;
      }
  
      // 🔹 Asegurar valores correctos antes de enviar
      const nombreLimpio = nombre.trim();
      const telefonoFinal = (telefono ? String(telefono) : "00000000").trim();
      const correoFinal = (correo ? String(correo) : "S/C").trim().toLowerCase();
  
      // 🔹 Actualizar Cliente Principal
      await api.put(
        `/clientes/${clienteId}`,
        { nombre: nombreLimpio, telefono: telefonoFinal, mail: correoFinal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // 🔹 Si es un trabajo con Cliente RC, actualizarlo también
      if (idtrabajo === 3 && clienteIdRC) {
        const nombreRCLimpio = nombreRC.trim();
        const telefonoRCFinal = (telefonoRC ? String(telefonoRC) : "00000000").trim();
        const correoRCFinal = (correoRC ? String(correoRC) : "S/C").trim().toLowerCase();
  
        await api.put(
          `/clientes/${clienteIdRC}`,
          { nombre: nombreRCLimpio, telefono: telefonoRCFinal, mail: correoRCFinal },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      Swal.fire("Éxito", "Datos del cliente actualizados correctamente.", "success");
      navigate(`/proformas/${idProforma}/${nplaca}`);
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      Swal.fire("Error", "Hubo un error al actualizar los datos.", "error");
    }
  };

  return (
    <>
      {/* Encabezado */}
      <Header toggleMenu={toggleMenu} />
      {/* Menú lateral */}
      <SideMenu toggleMenu={toggleMenu} />

      <div className="cliente-container">
        <h2>Editar Cliente</h2>

        <div className="form-group">
          <label htmlFor="nombre">Nombre del Cliente:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value.trim())}
            placeholder="Escribe el nombre del cliente"
          />

          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="text"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, "").slice(0, 8))}
            placeholder="Escribe el teléfono"
          />

          <label htmlFor="correo">Correo:</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value.trim().toLowerCase())}
            placeholder="Escribe el correo"
          />
        </div>

        {/* Cliente RC (solo si es Seguro RC) */}
        {idtrabajo === 3 && (
          <div className="form-group">
            <h3>Cliente RC</h3>
            <label htmlFor="nombreRC">Nombre del Cliente RC:</label>
            <input
              type="text"
              id="nombreRC"
              value={nombreRC}
              onChange={(e) => setNombreRC(e.target.value.trim())}
              placeholder="Escribe el nombre del cliente RC"
            />

            <label htmlFor="telefonoRC">Teléfono:</label>
            <input
              type="text"
              id="telefonoRC"
              value={telefonoRC}
              onChange={(e) => setTelefonoRC(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Escribe el teléfono"
            />

            <label htmlFor="correoRC">Correo:</label>
            <input
              type="email"
              id="correoRC"
              value={correoRC}
              onChange={(e) => setCorreoRC(e.target.value.trim().toLowerCase())}
              placeholder="Escribe el correo del cliente RC"
            />
          </div>
        )}

        <div className="button-container">
          <button className="btn-back-custom" onClick={() => navigate(`/proformas/${idProforma}/${nplaca2}`)}>
            Volver
          </button>
          <button className="btn-next-custom" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </>
  );
};

export default Cliente;
