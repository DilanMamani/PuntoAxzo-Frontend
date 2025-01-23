import React, { useState } from "react";
import api from "../../services/axiosConfig";
import Swal from "sweetalert2";
import "./EditarDetalleModal.css";


const EditarDetalleModal = ({ detalle, idNivel, onClose, onSave }) => {
  const [detalleTexto, setDetalleTexto] = useState(detalle.detalle || "");
  const [idDetalle, setIdDetalle] = useState(detalle.idDetalleP || null);
  const [detallesSugeridos, setDetallesSugeridos] = useState([]);
  const [precio, setPrecio] = useState(detalle.precio || "");
  const [descuento, setDescuento] = useState(
    ((detalle.descuento / parseFloat(detalle.precio)) * 100).toFixed(2) || 0
  );

  const getToken = () => localStorage.getItem("token");

  const buscarDetalles = async (texto) => {
    if (!texto || texto.length < 3) {
      setDetallesSugeridos([]);
      return;
    }
    try {
      const token = getToken();
      const response = await api.get(`/api/detalleprecios/search?detalle=${texto}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetallesSugeridos(response.data.data || []);
    } catch (error) {
      console.error("Error al buscar detalles:", error.response?.data || error.message);
    }
  };

  const crearActualizarDetalle = async (textoDetalle) => {
    if (!textoDetalle || textoDetalle.trim() === "") {
      Swal.fire("Error", "El campo detalle no puede estar vacío.", "error");
      throw new Error("Campo detalle vacío.");
    }
    try {
      const token = getToken();
      const responseBuscar = await api.get(
        `/api/detalleprecios/search?detalle=${encodeURIComponent(textoDetalle)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Si se encuentran coincidencias, usar el primer detalle encontrado
      if (responseBuscar.data?.data?.length > 0) {
        const detalleExistente = responseBuscar.data.data[0];
        return detalleExistente.idDetalleP;
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error(
          "Error al buscar detalle:",
          error.response?.data || error.message
        );
        throw new Error("Error al buscar el detalle.");
      }
      // Si el error es 404, continuamos para crear el detalle
    }
  
    // Crear un nuevo detalle si no hay coincidencias
    try {
        const token = getToken(); // Obtén el token antes de usarlo
      const responseCrear = await api.post(
        "/api/detalleprecios",
        { detalle: textoDetalle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return responseCrear.data.data.idDetalleP;
    } catch (error) {
      console.error(
        "Error al crear detalle:",
        error.response?.data || error.message
      );
      throw new Error("No se pudo crear el detalle.");
    }
  };

  const handleSave = async () => {
    try {
      let detalleId = idDetalle;

      // Si el texto del detalle cambió, lo des-seleccionamos y creamos uno nuevo
      if (!detalleId || detalleTexto !== detalle.detalle) {
        detalleId = await crearActualizarDetalle(detalleTexto);
      }

      const descuentoNumerico = parseFloat(descuento) || 0;
      const descuentoCalculado = (parseFloat(precio) * descuentoNumerico) / 100;

      const token = getToken();
      await api.put(
        `/api/detalleproforma/${detalle.idDetalleProforma}`,
        {
          iddetallep: detalleId,
          iditem: detalle.idItem,
          precio: parseFloat(precio).toFixed(2),
          descuento: descuentoCalculado,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Éxito", "Detalle actualizado correctamente.", "success");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error al guardar los cambios:", error.message || error);
      Swal.fire("Error", error.message || "No se pudo guardar los cambios.", "error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar Detalle</h3>

        <label>Detalle:</label>
        <input
          type="text"
          value={detalleTexto}
          onChange={(e) => {
            setDetalleTexto(e.target.value);
            // Des-seleccionamos el detalle si se edita
            if (e.target.value !== detalle.detalle) {
              setIdDetalle(null);
            }
            buscarDetalles(e.target.value);
          }}
        />
        {detallesSugeridos.length > 0 && (
          <ul className="sugerencias-list">
            {detallesSugeridos.map((detalle) => (
              <li
                key={detalle.idDetalleP}
                onClick={() => {
                  setDetalleTexto(detalle.detalle);
                  setIdDetalle(detalle.idDetalleP);
                  setDetallesSugeridos([]);
                }}
              >
                {detalle.detalle}
              </li>
            ))}
          </ul>
        )}

        <label>Precio:</label>
        <input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <label>Descuento (%):</label>
        <input
          type="number"
          value={descuento}
          onChange={(e) => setDescuento(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={handleSave} className="save-button">
            Actualizar Detalle
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarDetalleModal;