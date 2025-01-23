import React, { useState, useEffect } from "react";
import api from "../../services/axiosConfig";
import EditarDetalleModal from "./EditarDetalleModal";
import "./Paso4.css";

const Paso4 = ({ data, setData, retrocederPaso, avanzarPaso }) => {
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
  const [monedas, setMonedas] = useState([]);
  const [idMoneda, setIdMoneda] = useState("");
  const [showMonedaModal, setShowMonedaModal] = useState(false);
  const [editarDetalleModalOpen, setEditarDetalleModalOpen] = useState(false);
const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const calcularSubtotal = (detallesCalculados = detalles) => {
    const total = detallesCalculados.reduce(
      (acc, detalle) => acc + parseFloat(detalle.total || 0),
      0
    );
    setSubtotal(total.toFixed(2));
  };

  const cargarNiveles = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/nivelprecio/by-seguro?idSeguro=${data.idSeguro}`, {
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
      const response = await api.get(`/api/detalleproforma/${data.idProforma}`, {
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
      console.error("Error al cargar los detalles de la proforma:", error);
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
  const cargarMoneda = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/seguros/${data.idSeguro}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      // Extraer idMoneda del seguro
      const monedaId = response.data.data?.idMoneda || null;
      if (monedaId) {
        setIdMoneda(monedaId); // Guardar en el estado
      } else {
        console.warn("No se encontró moneda para el seguro.");
        setIdMoneda(""); // Limpia el estado si no se encuentra
      }
    } catch (error) {
      console.error("Error al cargar moneda:", error);
      alert("No se pudo cargar la moneda asociada al seguro.");
    }
  };
  const abrirEditarDetalleModal = (detalle) => {
    setDetalleSeleccionado(detalle);
    setEditarDetalleModalOpen(true);
  };
  const crearNuevoItem = async () => {
      console.log(itemBusqueda, idNivel, idMoneda, parseFloat(precio).toFixed(2));
      console.log("Ítem buscado:", itemBusqueda); // Confirmar que se usa el estado correcto
      console.log("Precio:", precio);
    
      if (!itemBusqueda || !precio || !idNivel || !idMoneda) {
        alert("El ítem, precio, nivel y moneda son obligatorios.");
        return null;
      }
    
      try {
        const token = getToken();
        const response = await api.post(
          "/api/precios",
          {
            detalle: itemBusqueda, // Aquí usamos itemBusqueda
            precio: parseFloat(precio).toFixed(2),
            idMoneda,
            idNivel,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        return response.data.data;
      } catch (error) {
        console.error("Error al crear un nuevo ítem:", error);
        alert("No se pudo crear un nuevo ítem.");
        return null;
      }
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

  const handleDetalleSeleccionado = (detalle) => {
    setDetalle(detalle.detalle);
    setIdDetalle(detalle.idDetalleP);
    setDetallesSugeridos([]);
  };

  const handleItemSeleccionado = (item) => {
    setItemSeleccionado(item);
    setItemBusqueda(item.detalle);
    setPrecio(item.precio);
    setItemsSugeridos([]);
  };

  const eliminarDetalle = async (idDetalleProforma) => {
    try {
      const token = getToken();
      await api.delete(`/api/detalleproforma/${idDetalleProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarDetallesProforma(); // Recarga los detalles después de eliminar
    } catch (error) {
      console.error("Error al eliminar el detalle:", error);
      alert("No se pudo eliminar el detalle.");
    }
  };

  const agregarDetalle = async () => {
    try {
      let itemId = itemSeleccionado?.idItem;

      if (!itemId) {
        const nuevoItem = await crearNuevoItem();
        if (!nuevoItem) return;
        itemId = nuevoItem.idItem;
      }

      const detalleId = idDetalle || (await crearActualizarDetalle(detalle));

      if (!detalleId) {
        alert("Error al crear/actualizar detalle.");
        return;
      }

      const descuentoNumerico = Number(descuento || 0);
      const descuentoCalculado = (Number(precio) * descuentoNumerico) / 100;

      const token = getToken();
      await api.post(
        "/api/detalleproforma",
        {
          idproforma: data.idProforma,
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
      alert("Error al agregar el detalle.");
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

  useEffect(() => {
    cargarNiveles();
    cargarMoneda();
    cargarDetallesProforma();
  }, []);
  return (
    <div className="paso4-container">
      {editarDetalleModalOpen && (
  <EditarDetalleModal
  detalle={detalleSeleccionado}
  idNivel={idNivel} // Pasar el idNivel al modal
  onClose={() => setEditarDetalleModalOpen(false)}
  onSave={cargarDetallesProforma} // Recarga la lista de detalles después de guardar
/>
)}
      <h2>Paso 4: Detalle de Proforma</h2>
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
          onChange={(e) => setPrecio(e.target.value)} // Permite modificar el precio
          placeholder="Escribe el precio"
        />

        <label>Descuento (%):</label>
        <input type="number" value={descuento} onChange={(e) => setDescuento(e.target.value)} />

        <button onClick={agregarDetalle}>Agregar Detalle</button>
      </div>

      <h3>Detalles Agregados</h3>
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
              <td>{ parseFloat(detalle.precio-detalle.descuento).toFixed(2)}</td>
              <td>
  <button onClick={() => abrirEditarDetalleModal(detalle)}>Editar</button>
  <button onClick={() => eliminarDetalle(detalle.idDetalleProforma)}>Eliminar</button>
</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Subtotal: {subtotal}</h3>
      <button className="btn-next" onClick={avanzarPaso}>
        Siguiente
      </button>
    </div>
  );
};

export default Paso4;