import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/axiosConfig";
import "./Detalles.css";

const Detalles = () => {
  const { idProforma, nplaca } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { idSeguro } = location.state || {}; // Obtenemos el ID de seguro desde la navegación
  const [niveles, setNiveles] = useState([]);
  const [idNivel, setIdNivel] = useState("");
  const [detalle, setDetalle] = useState("");
  const [idDetalle, setIdDetalle] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemsSugeridos, setItemsSugeridos] = useState([]);
  const [itemBusqueda, setItemBusqueda] = useState("");
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  const [detallesSugeridos, setDetallesSugeridos] = useState([]);
  const [idMoneda, setIdMoneda] = useState("");
  const [showMonedaModal, setShowMonedaModal] = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    cargarNiveles();
    cargarDetallesProforma();
  }, []);

  const handleItemSeleccionado = (item) => {
    setItemSeleccionado(item);
    setItemBusqueda(item.detalle);
    setPrecio(item.precio);
    setItemsSugeridos([]);
  };

  const handleDetalleSeleccionado = (detalle) => {
    setDetalle(detalle.detalle);
    setIdDetalle(detalle.idDetalleP);
    setDetallesSugeridos([]);
  };
  const buscarItems = async (texto) => {
    if (!texto || texto.length < 3 || !idNivel) {
      setItemsSugeridos([]);
      return;
    }
    try {
      const token = getToken();
      const response = await api.get(`/api/precios/search?detalle=${texto}&idNivel=${idNivel}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItemsSugeridos(response.data.data || []);
    } catch (error) {
      console.error("Error al buscar ítems:", error);
    }
  };


  const cargarNiveles = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/nivelprecio/by-seguro?idSeguro=${idSeguro}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNiveles(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar niveles:", error);
    }
  };

  const cargarDetallesProforma = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/detalleproforma/${idProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetalles(response.data?.data || []);
      calcularSubtotal(response.data?.data || []);
    } catch (error) {
      console.error("Error al cargar detalles de la proforma:", error);
    }
  };



  const agregarDetalle = async () => {
    try {
      if (!idNivel) {
        alert("Debe seleccionar un nivel antes de agregar un detalle.");
        return;
      }
  
      if (!itemSeleccionado?.idItem) {
        alert("Debe seleccionar un ítem válido.");
        return;
      }
  
      if (!detalle) {
        alert("Debe proporcionar un detalle.");
        return;
      }
  
      if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
        alert("Debe ingresar un precio válido.");
        return;
      }
  
      const descuentoNumerico = Number(descuento || 0);
      const descuentoCalculado = (Number(precio) * descuentoNumerico) / 100;
  
      const token = getToken();
      await api.post(
        "/api/detalleproforma",
        {
          idproforma: idProforma, // Usamos el idProforma recibido en el parámetro
          iditem: itemSeleccionado.idItem, // ID del ítem seleccionado
          descuento: descuentoCalculado, // Descuento calculado
          iddetallep: idDetalle, // ID del detalle proporcionado
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarDetallesProforma(); // Refrescamos la lista de detalles
      limpiarCampos(); // Limpiamos los campos del formulario
    } catch (error) {
      console.error("Error al agregar detalle:", error);
      alert("Hubo un problema al agregar el detalle. Por favor, inténtelo de nuevo.");
    }
  };

  const eliminarDetalle = async (idDetalleProforma) => {
    try {
      const token = getToken();
      await api.delete(`/api/detalleproforma/${idDetalleProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarDetallesProforma();
    } catch (error) {
      console.error("Error al eliminar detalle:", error);
    }
  };

  const limpiarCampos = () => {
    setDetalle("");
    setIdDetalle(null);
    setItemBusqueda("");
    setItemSeleccionado(null);
    setPrecio("");
    setDescuento("");
  };
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
      console.error("Error al buscar detalles:", error);
    }
  };

  const crearActualizarItem = async () => {
    if (!itemBusqueda || !precio || !idNivel) {
      alert("El ítem, precio y nivel son obligatorios.");
      return null;
    }

    if (!itemSeleccionado?.idItem && !idMoneda) {
      setShowMonedaModal(true);
      return null;
    }

    try {
      const token = getToken();
      if (itemSeleccionado?.idItem) {
        await api.put(
          `/api/precios/${itemSeleccionado.idItem}`,
          { detalle: itemBusqueda, precio, idNivel },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return itemSeleccionado.idItem;
      } else {
        const response = await api.post(
          "/api/precios",
          { detalle: itemBusqueda, precio, idNivel, idMoneda },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.data.idItem;
      }
    } catch (error) {
      console.error("Error al crear/actualizar ítem:", error);
      return null;
    }
  };
  const calcularSubtotal = (detallesCalculados = detalles) => {
    const total = detallesCalculados.reduce(
      (acc, detalle) => acc + parseFloat(detalle.total || 0),
      0
    );
    setSubtotal(total.toFixed(2));
  };

  return (
    <div className="detalles-container">
      <h2>Editar Detalles de Proforma</h2>

      {/* Formulario para agregar detalle */}
      <div className="detalle-form">
        <label>Nivel:</label>
        <select value={idNivel} onChange={(e) => setIdNivel(e.target.value)}>
          <option value="">Seleccionar nivel</option>
          {niveles.map((nivel) => (
            <option key={nivel.idnivel} value={nivel.idnivel}>
              {nivel.nivel}
            </option>
          ))}
        </select>

        <label>Detalle:</label>
        <input
          type="text"
          value={detalle}
          onChange={(e) => {
            setDetalle(e.target.value);
            buscarDetalles(e.target.value);
          }}
          placeholder="Escribe un detalle"
        />
        {detallesSugeridos.length > 0 && (
          <ul className="sugerencias-list">
            {detallesSugeridos.map((detalle) => (
              <li key={detalle.idDetalleP} onClick={() => handleDetalleSeleccionado(detalle)}>
                {detalle.detalle} (ID: {detalle.idDetalleP})
              </li>
            ))}
          </ul>
        )}

<label>Ítem:</label>
        <input
          type="text"
          value={itemBusqueda}
          onChange={(e) => {
            setItemBusqueda(e.target.value);
            buscarItems(e.target.value);
          }}
          placeholder="Buscar ítem"
        />
        {itemsSugeridos.length > 0 && (
          <ul className="sugerencias-list">
            {itemsSugeridos.map((item) => (
              <li key={item.idItem} onClick={() => handleItemSeleccionado(item)}>
                {item.detalle} (ID: {item.idItem}) - {item.precio}
              </li>
            ))}
          </ul>
        )}

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
        />

        <button onClick={agregarDetalle}>Agregar Detalle</button>
      </div>

      {/* Tabla de detalles */}
      <h3>Detalles de la Proforma</h3>
      <table>
        <thead>
          <tr>
            <th>Detalle</th>
            <th>Ítem</th>
            <th>Precio</th>
            <th>Descuento</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detalle) => (
            <tr key={detalle.iddetalle}>
              <td>{detalle.detalle}</td>
              <td>{detalle.item}</td>
              <td>{detalle.precio}</td>
              <td>{detalle.descuento}</td>
              <td>{detalle.total}</td>
              <td>
                <button onClick={() => eliminarDetalle(detalle.iddetalle)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Subtotal: {subtotal}</h3>

      {/* Botón para volver */}
      <button className="btn-back" onClick={() => navigate(`/proformas/${idProforma}/${nplaca}`)}>
        Volver a Proforma
      </button>
    </div>
  );
};

export default Detalles;