import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/axiosConfig";
import "./Repuestos.css"; // Cambiar a tu archivo CSS específico si es necesario

const DetalleMecanica = () => {
  const { idProforma, nplaca } = useParams();
  const navigate = useNavigate();
  const [detalleMecanica, setDetalleMecanica] = useState("");
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  const [idMec, setIdMec] = useState(null);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    cargarDetalleMecanica();
  }, [idProforma]);

  // Cargar el detalle de mecánica asociado a la proforma
  const cargarDetalleMecanica = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/detallemecanica/proforma/${idProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.detallesMecanica && response.data.detallesMecanica.length > 0) {
        const detalle = response.data.detallesMecanica[0];
        setDetalleMecanica(detalle.detalle);
        setPrecio(detalle.precio || "0.00");
        setDescuento(
          ((detalle.descuento / detalle.precio) * 100).toFixed(2) || "0.00" // Convertir a porcentaje
        );
        setIdMec(detalle.idmec);
      } else {
        limpiarCampos(); // Limpiar si no hay detalle asociado
      }
    } catch (error) {
      console.error("Error al cargar el detalle de mecánica:", error);
    }
  };

  // Guardar o actualizar el detalle de mecánica
  const guardarDetalleMecanica = async () => {
    const precioFinal = parseFloat(precio || 0).toFixed(2); // Valor por defecto 0
    const descuentoFinal = parseFloat(descuento || 0); // Valor por defecto 0

    if (!detalleMecanica) {
      alert("El detalle es obligatorio.");
      return;
    }

    try {
      const token = getToken();

      // Calcular el descuento en valor absoluto
      const descuentoCalculado = ((descuentoFinal / 100) * precioFinal).toFixed(2);

      const payload = {
        detalle: detalleMecanica,
        idproforma: idProforma,
        precio: precioFinal,
        descuento: descuentoCalculado, // Enviar el descuento calculado
      };

      if (idMec) {
        // Actualizar si ya existe
        await api.put(`/api/detallemecanica/${idMec}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Detalle actualizado correctamente.");
      } else {
        // Crear nuevo si no existe
        const response = await api.post(`/api/detallemecanica`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIdMec(response.data.detalleMecanica.idmec); // Establecer el ID del nuevo detalle
        alert("Detalle creado correctamente.");
      }

      cargarDetalleMecanica();
    } catch (error) {
      console.error("Error al guardar el detalle de mecánica:", error);
      alert("Error al guardar el detalle.");
    }
  };

  // Limpiar los campos de entrada
  const limpiarCampos = () => {
    setDetalleMecanica("");
    setPrecio("");
    setDescuento("");
    setIdMec(null);
  };

  // Manejar la acción de volver
  const handleVolver = () => {
    navigate(`/proformas/${idProforma}/${nplaca}`);
  };

  return (
    <div className="repuestos-container">
      <h2>Editar Detalles Mecánica</h2>
      <div className="repuestos-form">
        <label>Detalle:</label>
        <textarea
          rows="5"
          cols="50"
          value={detalleMecanica}
          onChange={(e) => setDetalleMecanica(e.target.value)}
          placeholder="Escribe aquí el detalle..."
        ></textarea>

        <label>Precio:</label>
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Escribe el precio"
        />

        <label>Descuento (%):</label>
        <input
          type="number"
          value={descuento}
          onChange={(e) => setDescuento(e.target.value)}
          placeholder="Escribe el descuento en porcentaje"
        />
      </div>
      <div className="buttons-container">
        <button onClick={handleVolver}>Volver</button>
        <button onClick={guardarDetalleMecanica}>Guardar</button>
      </div>
    </div>
  );
};

export default DetalleMecanica;