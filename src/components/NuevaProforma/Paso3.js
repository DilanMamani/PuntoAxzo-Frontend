import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';
import './Paso3.css';

const Paso3 = ({ data, setData, avanzarPaso, retrocederPaso }) => {
  const [nPlaca, setNPlaca] = useState(data?.vehiculo?.nPlaca || '');
  const [vehiculos, setVehiculos] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(data?.vehiculo?.marca || '');
  const [modelo, setModelo] = useState(data?.vehiculo?.modelo || '');
  const [tipo, setTipo] = useState(data?.vehiculo?.tipo || '');
  const [color, setColor] = useState(data?.vehiculo?.color || '');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(data?.vehiculo || null);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [idSeguro, setIdSeguro] = useState(data.idSeguro || null);

  const getToken = () => localStorage.getItem('token');

  // Cargar marcas
  const cargarMarcas = async () => {
    try {
      const token = getToken();
      const response = await api.get('/api/marcas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarcas(response.data || []);
    } catch (error) {
      console.error('Error al cargar marcas:', error);
    }
  };

  // Cargar modelos según marca
  const cargarModelos = async (idMarca) => {
    try {
      const token = getToken();
      const response = await api.get(`/api/modelos?marca=${idMarca}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModelos(response.data || []);
    } catch (error) {
      console.error('Error al cargar modelos:', error);
    }
  };

  // Buscar vehículo por placa
  const buscarVehiculoPorPlaca = async (placa) => {
    try {
      const token = getToken();
      const response = await api.get(`/api/vehiculos/${placa.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehiculos(response.data.data || []);
    } catch (error) {
      console.error('Error al buscar vehículos:', error);
      setVehiculos([]);
    }
  };

  const handlePlacaChange = (e) => {
    let value = limpiarPlaca(e.target.value);
  
    // 🔹 Limitar a 7 caracteres
    if (value.length > 7) {
      value = value.slice(0, 7);
    }
  
    setNPlaca(value);
    if (value.length > 2) buscarVehiculoPorPlaca(value);
    else setVehiculos([]);
  };

  // Seleccionar vehículo existente
  const seleccionarVehiculo = (vehiculo) => {
    setNPlaca(vehiculo.nplaca);
    setColor(vehiculo.color || '');
    setVehiculoSeleccionado(vehiculo);

    if (vehiculo.modelo?.marca) {
      setMarcaSeleccionada(vehiculo.modelo.marca.idMarca);
      cargarModelos(vehiculo.modelo.marca.idMarca);
    } else {
      setMarcaSeleccionada('');
    }

    if (vehiculo.modelo) {
      setModelo(vehiculo.modelo.idModelo);
      setTipo(vehiculo.modelo.tipoVehiculo?.tipo || '');
    } else {
      setModelo('');
      setTipo('');
    }

    setVehiculos([]);
  };

  const handleMarcaChange = (e) => {
    const idMarca = e.target.value;
    setMarcaSeleccionada(idMarca);
    cargarModelos(idMarca);
    setModelo('');
    setTipo('');
  };

  const handleModeloChange = (e) => {
    const idModeloSeleccionado = parseInt(e.target.value, 10);
    setModelo(idModeloSeleccionado);

    const modeloSeleccionado = modelos.find((m) => m.idModelo === idModeloSeleccionado);
    if (modeloSeleccionado) {
      setTipo(modeloSeleccionado.tipoVehiculo?.tipo || '');
    }
  };

  const limpiarPlaca = (placa) => {
    return placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(); // 🔹 Solo letras y números, en mayúsculas
  };
  
  const handleNext = async () => {
    let placaLimpia = limpiarPlaca(nPlaca);
    
    console.log("Datos actuales antes de avanzar:", {
      nPlaca: placaLimpia, 
      idCliente: data.idCliente,
      idClienteRC: data.idClienteRC,
      idTrabajo: data.idTrabajo,
      idUsuario: JSON.parse(localStorage.getItem("user"))?.idUsuario,
      idInspectorS: data.idInspectorS,
      idInspectorB: data.idInspectorB,
      idSeguro: data.idSeguro,
      modelo,
      color: color || "Sin Color especificado",
    });
  
    try {
      const token = getToken();
      if (!token) {
        console.error("No hay token disponible.");
        return;
      }
  
      // Validar campos obligatorios
      if (!placaLimpia || !modelo) {
        alert("Por favor, completa todos los campos del vehículo.");
        return;
      }
  
      try {
        if (!vehiculoSeleccionado) {
          console.log("Creando nuevo vehículo con placa:", placaLimpia);
          await api.post(
            "/api/vehiculos",
            { nPlaca: placaLimpia, idModelo: modelo, color: color || "Sin Color especificado" }, // 🔹 Enviar placa corregida
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          console.log("Actualizando vehículo existente con placa:", placaLimpia);
          await api.put(
            `/api/vehiculos/${placaLimpia}`, // 🔹 Enviar placa corregida
            { idModelo: modelo, color: color || "Sin Color especificado" },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error) {
        console.error("Error al guardar el vehículo:", error);
        alert("No se pudo guardar el vehículo. Verifica los datos y vuelve a intentarlo.");
      }
  
      // Preparar payload de la proforma
      const usuarioLogueado = JSON.parse(localStorage.getItem("user"));
      const proformaPayload = {
        nplaca: placaLimpia, // 🔹 Guardar placa limpia
        idCliente: data.idCliente,
        idUsuario: usuarioLogueado?.idUsuario,
        idTrabajo: data.tipoTrabajo,
        idInspectorS: data.idInspectorS || null,
        idInspectorB: data.idInspectorB || null,
        idClienteRC: data.idClienteRC || null,
        idSeguro: data.idSeguro || null,
      };
  
      console.log("Datos de la proforma preparados:", proformaPayload);
  
      if (!proformaPayload.idCliente || !proformaPayload.idUsuario || !proformaPayload.idTrabajo) {
        alert("Por favor, verifica los datos antes de continuar.");
        return;
      }
  
      console.log("Creando proforma...");
      const response = await api.post("/api/proformas", proformaPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Guardar el idProforma en el estado global
      const idProformaCreada = response.data.proforma.idproforma;
      console.log("ID de la proforma creada:", idProformaCreada);
  
      setData((prevData) => ({
        ...prevData,
        idProforma: idProformaCreada,
        vehiculo: { ...prevData.vehiculo, nPlaca: placaLimpia }, // 🔹 Guardar placa limpia
      }));
  
      avanzarPaso();
    } catch (error) {
      console.error("Error al procesar los datos:", error);
      alert("Hubo un error al procesar los datos.");
    }
  };

  useEffect(() => {
    cargarMarcas();
    if (marcaSeleccionada) cargarModelos(marcaSeleccionada);
  }, [marcaSeleccionada]);

  return (
    <div className="paso3-container">
      <h2>Paso 3: Datos del Vehículo</h2>
      <div className="form-group">
        <label htmlFor="nPlaca">Placa:</label>
        <input
          type="text"
          id="nPlaca"
          value={nPlaca}
          onChange={handlePlacaChange}
          placeholder="Buscar por placa"
        />
        {vehiculos.length > 0 && (
          <ul className="sugerencias">
            {vehiculos.map((vehiculo) => (
              <li
                key={vehiculo.nplaca}
                onClick={() => seleccionarVehiculo(vehiculo)}
              >
                {vehiculo.nplaca}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="form-group">
        <label>Marca:</label>
        <select onChange={handleMarcaChange} value={marcaSeleccionada || ''}>
          <option value="">Seleccione una marca</option>
          {marcas.map((m) => (
            <option key={m.idMarca} value={m.idMarca}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Modelo:</label>
        <select onChange={handleModeloChange} value={modelo || ''}>
          <option value="">Seleccione un modelo</option>
          {modelos.map((m) => (
            <option key={m.idModelo} value={m.idModelo}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Tipo:</label>
        <input type="text" value={tipo} disabled />
      </div>
      <div className="form-group">
        <label>Color:</label>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <button className="btn-next" onClick={handleNext}>
        Siguiente
      </button>
      <button className="btn-back" onClick={retrocederPaso}>
        Volver
      </button>
    </div>
  );
};

export default Paso3;