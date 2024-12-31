import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/axiosConfig";
import "./Repuestos.css";

const Repuestos = () => {
  const { idProforma, nplaca } = useParams();
  const navigate = useNavigate();
  const [repuestos, setRepuestos] = useState("");
  const [idRepuesto, setIdRepuesto] = useState(null);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    cargarRepuestos();
  }, [idProforma]);

  // Cargar repuestos de la proforma
  const cargarRepuestos = async () => {
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
     handleVolver();

    } catch (error) {
      console.error("Error al guardar los repuestos:", error);
      alert("Error al guardar los repuestos.");
    }
  };

  // Manejar la acción de "Volver"
  const handleVolver = () => {
    navigate(`/proformas/${idProforma}/${nplaca}`);
  };

  return (
    <div className="repuestos-container">
      <h2>Editar Repuestos</h2>
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
      <button onClick={handleVolver}>Volver</button>
        <button onClick={guardarRepuestos}>Guardar</button>
        

      </div>
    </div>
  );
};

export default Repuestos;