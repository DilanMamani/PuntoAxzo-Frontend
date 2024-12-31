import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/axiosConfig";
import "./Vehiculo.css";

const Vehiculo = () => {
  const { idProforma, nplaca } = useParams();
  const navigate = useNavigate();

  const [nPlaca, setNPlaca] = useState(nplaca || "");
  const [vehiculos, setVehiculos] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState("");
  const [modelo, setModelo] = useState("");
  const [tipo, setTipo] = useState("");
  const [color, setColor] = useState("");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [proformaData, setProformaData] = useState(null);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    cargarMarcas();
  }, []);

  useEffect(() => {
    if (marcaSeleccionada) {
      cargarModelos(marcaSeleccionada);
    }
  }, [marcaSeleccionada]);

  useEffect(() => {
    if (nplaca) {
      buscarVehiculoPorPlaca(nplaca);
    }
  }, [nplaca]);

  // Cargar marcas
  const cargarMarcas = async () => {
    try {
      const token = getToken();
      const response = await api.get("/api/marcas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarcas(response.data || []);
    } catch (error) {
      console.error("Error al cargar marcas:", error);
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
      console.error("Error al cargar modelos:", error);
    }
  };

  // Buscar vehículo por placa
  const buscarVehiculoPorPlaca = async (placa) => {
    try {
      const token = getToken();
      const response = await api.get(`/api/vehiculos/buscar?nPlaca=${placa}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehiculos(response.data.data || []);
    } catch (error) {
      console.error("Error al buscar vehículos:", error);
      setVehiculos([]);
    }
  };

  // Seleccionar vehículo existente
  const seleccionarVehiculo = (vehiculo) => {
    setNPlaca(vehiculo.nplaca);
    setColor(vehiculo.color || "");
    setVehiculoSeleccionado(vehiculo);

    if (vehiculo.modelo?.marca) {
      setMarcaSeleccionada(vehiculo.modelo.marca.idMarca);
      cargarModelos(vehiculo.modelo.marca.idMarca);
    } else {
      setMarcaSeleccionada("");
    }

    if (vehiculo.modelo) {
      setModelo(vehiculo.modelo.idModelo);
      setTipo(vehiculo.modelo.tipoVehiculo?.tipo || "");
    } else {
      setModelo("");
      setTipo("");
    }

    setVehiculos([]);
  };

  const handleMarcaChange = (e) => {
    const idMarca = e.target.value;
    setMarcaSeleccionada(idMarca);
    cargarModelos(idMarca);
    setModelo(""); // Resetear modelo y tipo al cambiar la marca
    setTipo("");
    setVehiculoSeleccionado(null); // Desvincular selección previa
  };

  const handleModeloChange = (e) => {
    const idModeloSeleccionado = parseInt(e.target.value, 10);
    setModelo(idModeloSeleccionado);

    const modeloSeleccionado = modelos.find((m) => m.idModelo === idModeloSeleccionado);
    if (modeloSeleccionado) {
      setTipo(modeloSeleccionado.tipoVehiculo?.tipo || "");
    }
  };

  const guardarVehiculo = async () => {
    try {
      const token = getToken();
      if (!nPlaca || !modelo || !color) {
        alert("Por favor, completa todos los campos del vehículo.");
        return;
      }
  
      // Verificar si el vehículo ya está asociado a la proforma
      const proformaResponse = await api.get(`/api/proformas/${idProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const proforma = proformaResponse.data || {};
  
      console.log("Datos de la proforma:", proforma);
  
      // Actualizar o crear el vehículo
      if (nPlaca === proforma.nplaca) {
        // Si el vehículo ya está asociado, actualizar
        await api.put(
          `/api/vehiculos/${proforma.vehiculo.nplaca}`,
          { idModelo: modelo, color },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Si el vehículo no está asociado, crearlo
        await api.post(
          "/api/vehiculos",
          { nPlaca, idModelo: modelo, color },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        // Actualizar la proforma para asociar el nuevo vehículo
        await api.put(
          `/api/proformas/${idProforma}`,
          { nplaca: nPlaca },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Vehículo creado y asociado correctamente.");
      }
  
      // Redirigir a la vista de la proforma
      navigate(`/proformas/${idProforma}/${nPlaca}`);
    } catch (error) {
      console.error("Error al guardar el vehículo:", error);
      if (error.response?.status === 409) {
        alert("La placa ya existe en la base de datos.");
      } else {
        alert("Error al guardar el vehículo.");
      }
    }
  };

  return (
    <div className="vehiculo-container">
      <h2>Editar Vehículo</h2>
      <div className="form-group">
        <label>Placa:</label>
        <input
          type="text"
          value={nPlaca}
          onChange={(e) => {
            setNPlaca(e.target.value);
            buscarVehiculoPorPlaca(e.target.value);
          }}
          placeholder="Escribe la placa"
        />
        {vehiculos.length > 0 && (
          <ul className="vehiculos-list">
            {vehiculos.map((vehiculo) => (
              <li key={vehiculo.nplaca} onClick={() => seleccionarVehiculo(vehiculo)}>
                {vehiculo.nplaca}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="form-group">
  <label>Marca:</label>
  <select 
    value={marcaSeleccionada} 
    onChange={(e) => {
      const idMarca = e.target.value;
      setMarcaSeleccionada(idMarca);
      setModelo(""); // Limpiar modelo al cambiar marca
      setTipo(""); // Limpiar tipo al cambiar marca
      cargarModelos(idMarca);
    }}
  >
    <option value="">Seleccionar marca</option>
    {marcas.map((marca) => (
      <option key={marca.idMarca} value={marca.idMarca}>
        {marca.nombre}
      </option>
    ))}
  </select>
</div>

<div className="form-group">
  <label>Modelo:</label>
  <select 
    value={modelo} 
    onChange={(e) => {
      const idModeloSeleccionado = parseInt(e.target.value, 10);
      setModelo(idModeloSeleccionado); // Actualizar el modelo seleccionado

      const modeloSeleccionado = modelos.find(
        (m) => m.idModelo === idModeloSeleccionado
      );
      if (modeloSeleccionado) {
        setTipo(modeloSeleccionado.tipoVehiculo?.tipo || ""); // Actualizar el tipo
      } else {
        setTipo(""); // Limpiar el tipo si no hay modelo seleccionado
      }
    }}
  >
    <option value="">Seleccionar modelo</option>
    {modelos.map((modelo) => (
      <option key={modelo.idModelo} value={modelo.idModelo}>
        {modelo.nombre}
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
      <div className="buttons-container">
        <button onClick={guardarVehiculo}>Guardar</button>
        <button onClick={() => navigate(`/proformas/${idProforma}/${nPlaca}`)}>Volver</button>
      </div>
    </div>
  );
};

export default Vehiculo;