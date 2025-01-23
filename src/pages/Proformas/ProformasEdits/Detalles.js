import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/axiosConfig";
import "./Detalles.css";
import EditarDetalleModal from "../../../components/NuevaProforma/EditarDetalleModal.js"

const Detalles = () => {
  const { idProforma, nplaca } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { idSeguro } = location.state || {};
  const [niveles, setNiveles] = useState([]);
  const [idNivel, setIdNivel] = useState("");
  const [detalle, setDetalle] = useState("");
  const [idDetalle, setIdDetalle] = useState(null);
  const [detallesSugeridos, setDetallesSugeridos] = useState([]);
  const [itemBusqueda, setItemBusqueda] = useState("");
  const [itemsSugeridos, setItemsSugeridos] = useState([]);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("");
  const [detalles, setDetalles] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [idMoneda, setIdMoneda] = useState("");
    const [editarDetalleModalOpen, setEditarDetalleModalOpen] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    cargarNiveles();
    cargarMoneda();
    cargarDetallesProforma();
  }, []);

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

  const cargarMoneda = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/seguros/${idSeguro}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const monedaId = response.data.data?.idMoneda || null;
      setIdMoneda(monedaId);
    } catch (error) {
      console.error("Error al cargar moneda:", error);
      alert("No se pudo cargar la moneda asociada al seguro.");
    }
  };

  const cargarDetallesProforma = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/detalleproforma/${idProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.data) {
        const detallesCargados = response.data.data.map((detalle) => ({
          idDetalleProforma: detalle.iddetalle,
          detalle: detalle.detalle,
          item: detalle.item,
          precio: parseFloat(detalle.precio).toFixed(2),
          descuento: parseFloat(detalle.descuento).toFixed(2),
          total: parseFloat(detalle.total).toFixed(2),
        }));

        setDetalles(detallesCargados);
        calcularSubtotal(detallesCargados);
      } else {
        console.warn("No se encontraron detalles de la proforma.");
        setDetalles([]);
        calcularSubtotal([]);
      }
    } catch (error) {
      console.error("Error al cargar detalles de la proforma:", error);
    }
  };

  const calcularSubtotal = (detallesCalculados = detalles) => {
    const total = detallesCalculados.reduce((acc, detalle) => acc + parseFloat(detalle.total || 0), 0);
    setSubtotal(total.toFixed(2));
  };

  const crearActualizarDetalle = async (detalleTexto) => {
    try {
      const token = getToken();
      if (idDetalle) {
        await api.put(
          `/api/detalleprecios/${idDetalle}`,
          { detalle: detalleTexto },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return idDetalle;
      } else {
        const response = await api.post(
          "/api/detalleprecios",
          { detalle: detalleTexto },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data.data.idDetalleP;
      }
    } catch (error) {
      console.error("Error al crear/actualizar detalle:", error);
      return null;
    }
  };

  const crearActualizarItem = async () => {
    if (!itemBusqueda || !precio || !idNivel) {
      alert("El ítem, precio y nivel son obligatorios.");
      return null;
    }

    try {
      const token = getToken();
      const response = await api.post(
        "/api/precios",
        {
          detalle: itemBusqueda,
          precio: parseFloat(precio).toFixed(2),
          idMoneda,
          idNivel,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data.idItem;
    } catch (error) {
      console.error("Error al crear/actualizar ítem:", error);
      return null;
    }
  };

  const agregarDetalle = async () => {
    try {
      const detalleId = idDetalle || (await crearActualizarDetalle(detalle));
      const itemId = itemSeleccionado?.idItem || (await crearActualizarItem());

      if (!detalleId || !itemId) {
        alert("Error al crear/actualizar detalle o ítem.");
        return;
      }

      const descuentoNumerico = Number(descuento || 0);
      const descuentoCalculado = (Number(precio) * descuentoNumerico) / 100;

      const token = getToken();
      await api.post(
        "/api/detalleproforma",
        {
          idproforma: idProforma,
          iditem: itemId,
          descuento: descuentoCalculado,
          iddetallep: detalleId,
          precio: parseFloat(precio).toFixed(2),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      cargarDetallesProforma();
      limpiarCampos();
    } catch (error) {
      console.error("Error al agregar detalle:", error);
      alert("Hubo un problema al agregar el detalle.");
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
      console.error("Error al eliminar el detalle:", error);
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
  const abrirEditarDetalleModal = (detalle) => {
    setDetalleSeleccionado(detalle);
    setEditarDetalleModalOpen(true);
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

  return (
    <div className="detalles-container">
      {editarDetalleModalOpen && (
  <EditarDetalleModal
  detalle={detalleSeleccionado}
  idNivel={idNivel} // Pasar el idNivel al modal
  onClose={() => setEditarDetalleModalOpen(false)}
  onSave={cargarDetallesProforma} // Recarga la lista de detalles después de guardar
/>
)}
      <h2>Editar Detalles de Proforma</h2>

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
    const nuevoDetalle = e.target.value;
    setDetalle(nuevoDetalle);
    // Deseleccionar si el texto cambia
    if (nuevoDetalle !== detalle) {
      setIdDetalle(null);
    }
    buscarDetalles(nuevoDetalle);
  }}
  placeholder="Escribe un detalle"
/>
{detallesSugeridos.length > 0 && (
  <ul className="sugerencias-list">
    {detallesSugeridos.map((detalle) => (
      <li
        key={detalle.idDetalleP}
        onClick={() => {
          setDetalle(detalle.detalle);
          setIdDetalle(detalle.idDetalleP);
          setDetallesSugeridos([]);
        }}
      >
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
    const nuevoItem = e.target.value;
    setItemBusqueda(nuevoItem);
    // Deseleccionar si el texto cambia
    if (nuevoItem !== (itemSeleccionado?.detalle || "")) {
      setItemSeleccionado(null);
    }
    buscarItems(nuevoItem);
  }}
  placeholder="Buscar ítem"
/>
{itemsSugeridos.length > 0 && (
  <ul className="sugerencias-list">
    {itemsSugeridos.map((item) => (
      <li
        key={item.idItem}
        onClick={() => {
          setItemBusqueda(item.detalle);
          setItemSeleccionado(item);
          setPrecio(item.precio); // Actualizar el precio con el ítem seleccionado
          setItemsSugeridos([]);
        }}
      >
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
            <tr key={detalle.idDetalleProforma}>
              <td>{detalle.detalle}</td>
              <td>{detalle.item}</td>
              <td>{detalle.precio}</td>
              <td>{detalle.descuento}</td>
              <td>{parseFloat(detalle.precio-detalle.descuento).toFixed(2)}</td>
              <td>
  <button onClick={() => abrirEditarDetalleModal(detalle)}>Editar</button>
  <button onClick={() => eliminarDetalle(detalle.idDetalleProforma)}>Eliminar</button>
</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Subtotal: {subtotal}</h3>
      <button onClick={() => navigate(`/proformas/${idProforma}/${nplaca}`)}>Volver a Proforma</button>
    </div>
  );
};

export default Detalles;