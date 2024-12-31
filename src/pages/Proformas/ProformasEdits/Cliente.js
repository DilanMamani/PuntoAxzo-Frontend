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

  // Recuperar datos pasados desde la navegación
  const { idtrabajo, cliente, clienteRC,nplaca2} = location.state || {};

  // Estado para los datos del cliente principal
  const [nombre, setNombre] = useState(cliente?.nombre || '');
  const [telefono, setTelefono] = useState(cliente?.telefono || '');
  const [correo, setCorreo] = useState(cliente?.mail || '');
  const [clientes, setClientes] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [seleccionado, setSeleccionado] = useState(!!cliente?.idCliente);
  const [clienteId, setClienteId] = useState(cliente?.idCliente || null);
  // Estado para Cliente RC (si aplica)
  const [nombreRC, setNombreRC] = useState(clienteRC?.nombre ||'');
  const [telefonoRC, setTelefonoRC] = useState(clienteRC?.telefono || '');
  const [correoRC, setCorreoRC] = useState(clienteRC?.mail || '');
  const [clientesRC, setClientesRC] = useState([]);
  const [seleccionadoRC, setSeleccionadoRC] = useState(false);
  const [clienteIdRC, setClienteIdRC] = useState(clienteRC?.idCliente || null);


  const getToken = () => localStorage.getItem('token');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Estás a punto de cerrar sesión",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Swal.fire({
          title: "Sesión cerrada",
          text: "Has cerrado sesión correctamente.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/login");
      }
    });
  };

  // Buscar clientes en tiempo real
  const buscarClientes = async (nombre, setClientes) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.get(`/clientes/search?nombre=${nombre}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.data) {
        setClientes(response.data.data);
      } else {
        setClientes([]);
      }
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    }
  };

  const handleNombreChange = (e, setNombre, setSeleccionado, setClienteId, setClientes) => {
    const value = e.target.value;
    setNombre(value);
    setSeleccionado(false);
    setClienteId(null);

    if (value.length > 2) {
      buscarClientes(value, setClientes);
    } else {
      setClientes([]);
    }
  };

  const handleClienteSeleccionado = (cliente, setNombre, setTelefono, setCorreo, setSeleccionado, setClienteId) => {
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono || '');
    setCorreo(cliente.mail || '');
    setSeleccionado(true);
    setClienteId(cliente.idCliente);
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      if (!token) return;

      let newClienteId = clienteId;

      // Guardar o actualizar Cliente Principal
      if (clienteId) {
        await api.put(
          `/clientes/${clienteId}`,
          { nombre, telefono, mail: correo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await api.post(
          `/clientes`,
          { nombre, telefono, mail: correo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newClienteId = response.data.data.idCliente; // Asignar el nuevo ID
        setClienteId(newClienteId);
      }

      let newClienteIdRC = clienteIdRC;

      // Guardar o actualizar Cliente RC (si aplica)
      if (idtrabajo === 3) {
        if (clienteIdRC) {
          await api.put(
            `/clientes/${clienteIdRC}`,
            { nombre: nombreRC, telefono: telefonoRC, mail: correoRC },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          const responseRC = await api.post(
            `/clientes`,
            { nombre: nombreRC, telefono: telefonoRC, mail: correoRC },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          newClienteIdRC = responseRC.data.data.idCliente; // Asignar el nuevo ID
          setClienteIdRC(newClienteIdRC);
        }
      }

      Swal.fire('Éxito', 'Datos del cliente guardados correctamente.', 'success');
      navigate(`/proformas/${idProforma}/${nplaca}`);
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      Swal.fire('Error', 'Hubo un error al guardar los datos.', 'error');
    }
  };

  useEffect(() => {
    console.log('Datos iniciales del cliente:', {
      idCliente: clienteId,
      idClienterc: clienteIdRC,
      idtrabajo,
    });
  }, []);

  if (!idtrabajo) {
    return (
      <div className="error-container">
        <p>Error: No se recibió el tipo de trabajo. Por favor, regresa al detalle de la proforma.</p>
        <button onClick={() => navigate(`/proformas/${idProforma}/${nplaca}`)}>Volver</button>
      </div>
    );
  }

  return (
<>
  {/* Encabezado */}
  <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />

  {/* Menú lateral */}
  <SideMenu
    user={user}
    handleLogout={handleLogout}
    isMenuOpen={isMenuOpen}
    toggleMenu={toggleMenu}
  />
    <div className="cliente-container">

      <h2>Editar Cliente</h2>

      <div className="clientes-grid">
        {/* Cliente Principal */}
        <div className="form-group">
          <h3>Cliente Principal</h3>
          <label htmlFor="nombre">Nombre del Cliente:</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => handleNombreChange(e, setNombre, setSeleccionado, setClienteId, setClientes)}
            placeholder="Escribe el nombre del cliente"
          />
          {!seleccionado && clientes.length > 0 && (
            <ul className="sugerencias-list">
              {clientes.map((cliente) => (
                <li
                  key={cliente.idCliente}
                  onClick={() =>
                    handleClienteSeleccionado(cliente, setNombre, setTelefono, setCorreo, setSeleccionado, setClienteId)
                  }
                >
                  {cliente.nombre}
                </li>
              ))}
            </ul>
          )}
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="text"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Escribe el teléfono"
          />
          <label htmlFor="correo">Correo:</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
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
              onChange={(e) => handleNombreChange(e, setNombreRC, setSeleccionadoRC, setClienteIdRC, setClientesRC)}
              placeholder="Escribe el nombre del cliente RC"
            />
            {!seleccionadoRC && clientesRC.length > 0 && (
              <ul className="sugerencias-list">
                {clientesRC.map((cliente) => (
                  <li
                    key={clienteRC.idCliente}
                    onClick={() =>
                      handleClienteSeleccionado(
                        cliente,
                        setNombreRC,
                        setTelefonoRC,
                        setCorreoRC,
                        setSeleccionadoRC,
                        setClienteIdRC
                      )
                    }
                  >
                    {cliente.nombre}
                  </li>
                ))}
              </ul>
            )}
            <label htmlFor="telefonoRC">Teléfono:</label>
            <input
              type="text"
              id="telefonoRC"
              value={telefonoRC}
              onChange={(e) => setTelefonoRC(e.target.value)}
              placeholder="Escribe el teléfono del cliente RC"
            />
            <label htmlFor="correoRC">Correo:</label>
            <input
              type="email"
              id="correoRC"
              value={correoRC}
              onChange={(e) => setCorreoRC(e.target.value)}
              placeholder="Escribe el correo del cliente RC"
            />
          </div>
        )}
      </div>

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