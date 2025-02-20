import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import './Paso2.css';

const Paso2 = ({ data, setData, avanzarPaso, retrocederPaso }) => {
  // Cliente Principal
  const [nombre, setNombre] = useState(data.nombre || '');
  const [telefono, setTelefono] = useState(data.telefono || '');
  const [correo, setCorreo] = useState(data.correo || '');
  const [clientes, setClientes] = useState([]);
  const [seleccionado, setSeleccionado] = useState(!!data.idCliente);
  const [clienteId, setClienteId] = useState(data.idCliente || null);

  // Cliente RC
  const [nombreRC, setNombreRC] = useState(data.nombreRC || '');
  const [telefonoRC, setTelefonoRC] = useState(data.telefonoRC || '');
  const [correoRC, setCorreoRC] = useState(data.correoRC || '');
  const [clientesRC, setClientesRC] = useState([]);
  const [seleccionadoRC, setSeleccionadoRC] = useState(!!data.idClienteRC);
  const [clienteIdRC, setClienteIdRC] = useState(data.idClienteRC || null);

  const getToken = () => localStorage.getItem('token');

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

  const handleNext = async () => {
    try {
            // Valores predeterminados
      const defaultTelefono = "00000000";
      const defaultCorreo = "S/C";
      const token = getToken();
      if (!token) return;

      let newClienteId = clienteId;

      // Guardar o actualizar Cliente Principal
      if (clienteId) {
        await api.put(
          `/clientes/${clienteId}`,
          { nombre,telefono: telefono||defaultTelefono, mail: correo||defaultCorreo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await api.post(
          `/clientes`,
          { nombre, telefono: telefono||defaultTelefono, mail: correo||defaultCorreo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newClienteId = response.data.data.idCliente; // Asignar el nuevo ID
        setClienteId(newClienteId);
      }

      let newClienteIdRC = clienteIdRC;

      // Guardar o actualizar Cliente RC (si aplica)
      if (data.tipoTrabajo === 3) {
        if (clienteIdRC) {
          await api.put(
            `/clientes/${clienteIdRC}`,
            { nombre: nombreRC, telefono: telefonoRC ||defaultTelefono, mail: correoRC ||defaultCorreo},
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          const responseRC = await api.post(
            `/clientes`,
            { nombre: nombreRC, telefono: telefonoRC ||defaultTelefono, mail: correoRC ||defaultCorreo },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          newClienteIdRC = responseRC.data.data.idCliente; // Asignar el nuevo ID
          setClienteIdRC(newClienteIdRC);
        }
      }
      // Actualizar estado global
      console.log('Actualizando datos globales en setData...');
      setData((prevData) => ({
        ...prevData,
        idCliente: newClienteId,
        idClienteRC: data.tipoTrabajo === 3 ? newClienteIdRC : null,
        nombre,
        telefono: telefono || defaultTelefono,
        correo: correo || defaultCorreo,
        nombreRC,
        telefonoRC: telefonoRC || defaultTelefono,
        correoRC: correoRC || defaultCorreo,
      }));

      avanzarPaso();
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      alert('Hubo un error al guardar los datos.');
    }
  };

  useEffect(() => {
    console.log("Datos iniciales del cliente:", {
      idCliente: data.idCliente,
      idClienteRC: data.idClienteRC,
    });
  }, [data]);

  if (!data.tipoTrabajo) {
    return (
      <div className="error-container">
        <p>Error: No se recibió el tipo de trabajo. Por favor, regresa al Paso 1.</p>
        <button onClick={retrocederPaso}>Volver</button>
      </div>
    );
  }

  return (
    <div className="paso2-container">
      <h2>Paso 2: Datos del Cliente</h2>

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
        {data.tipoTrabajo === 3 && (
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
                    key={cliente.idCliente}
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
        <button className="btn-back-custom" onClick={retrocederPaso}>
          Volver
        </button>
        <button className="btn-next-custom" onClick={handleNext}>
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Paso2;