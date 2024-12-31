import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";
import "./Paso5.css";

const Paso5 = ({ data = {}, setData, retrocederPaso }) => {
  const [repuestos, setRepuestos] = useState("");
  const [idRepuesto, setIdRepuesto] = useState(null);
  const [nplaca, setNplaca] = useState(""); // Estado para almacenar la placa obtenida
  const navigate = useNavigate();

  const idProforma = data?.idProforma;

  const getToken = () => localStorage.getItem("token");

  // Cargar la placa y datos de la proforma
  const cargarProforma = async () => {
    if (!idProforma) {
      console.error("ID Proforma no está definido.");
      return;
    }

    try {
      const token = getToken();
      const response = await api.get(`/api/proformas/${idProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.nplaca) {
        setNplaca(response.data.nplaca); // Guardar la placa obtenida
      } else {
        console.warn("No se encontró una placa para la proforma proporcionada.");
      }
    } catch (error) {
      console.error("Error al cargar la proforma:", error);
    }
  };

  // Cargar repuestos de la proforma
  const cargarRepuestos = async () => {
    if (!idProforma) {
      console.error("ID Proforma no está definido.");
      return;
    }

    try {
      const token = getToken();
      const response = await api.get(`/api/repuestos/proforma/${idProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.repuestos && response.data.repuestos.length > 0) {
        const repuesto = response.data.repuestos[0];
        setRepuestos(repuesto.detalle);
        setIdRepuesto(repuesto.iditem);
      } else {
        setRepuestos("");
        setIdRepuesto(null);
      }
    } catch (error) {
      console.error("Error al cargar los repuestos:", error);
    }
  };

  // Guardar o actualizar los repuestos
  const guardarRepuestos = async () => {
    if (!idProforma) {
      console.error("ID Proforma no está definido.");
      return;
    }

    try {
      const token = getToken();
      const payload = {
        detalle: repuestos,
        idproforma: idProforma,
      };

      if (idRepuesto) {
        await api.put(`/api/repuestos/${idRepuesto}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Repuestos actualizados correctamente.");
      } else {
        await api.post(`/api/repuestos`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Repuestos creados correctamente.");
      }

      cargarRepuestos();
    } catch (error) {
      console.error("Error al guardar los repuestos:", error);
      alert("Error al guardar los repuestos.");
    }
  };

  // Manejar la acción de "Siguiente"
  const handleSiguiente = async () => {
    if (!idProforma || !nplaca) {
      console.error("ID Proforma o Placa no está definido.");
      return;
    }

    await guardarRepuestos(); // Guardar antes de avanzar
    navigate(`/proformas/${idProforma}/${nplaca}`); // Redirigir a la vista BaseProformas
  };

  useEffect(() => {
    cargarProforma(); // Cargar la placa al montar
    cargarRepuestos(); // Cargar los repuestos al montar
  }, [idProforma]);

  return (
    <div className="paso5-container">
      <h2>Paso 5: Repuestos</h2>
      <div className="repuestos-form">
        <label>Lista de Repuestos:</label>
        <textarea
          rows="10"
          cols="50"
          value={repuestos}
          onChange={(e) => setRepuestos(e.target.value)}
          placeholder="Escribe aquí la lista de repuestos, un repuesto por línea..."
        ></textarea>
      </div>
      <div className="buttons-container">
        <button onClick={retrocederPaso}>Atrás</button>
        <button onClick={guardarRepuestos}>Guardar</button>
        <button onClick={handleSiguiente}>Siguiente</button>
      </div>
    </div>
  );
};

export default Paso5;