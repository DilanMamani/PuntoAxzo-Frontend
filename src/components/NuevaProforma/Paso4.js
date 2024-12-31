import React, { useState, useEffect } from "react";
import api from "../../services/axiosConfig";
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

  const getToken = () => localStorage.getItem("token");

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

  const cargarMonedas = async () => {
    try {
      const token = getToken();
      const response = await api.get("/api/monedas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMonedas(response.data || []);
    } catch (error) {
      console.error("Error al cargar monedas:", error);
    }
  };
  const cargarDetallesProforma = async () => {
  try {
    const token = getToken();
    const response = await api.get(`/api/detalleproforma/${data.idProforma}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.data) {
      const detallesCargados = response.data.data.map((detalle) => ({
        idDetalleProforma: detalle.iddetalle,
        detalle: detalle.detalle, // Detalle del ítem
        item: detalle.item, // Ítem relacionado (nombre)
        precio: parseFloat(detalle.precio).toFixed(2), // Convertimos el precio a decimal con dos decimales
        descuento: parseFloat(detalle.descuento).toFixed(2), // Convertimos el descuento a decimal con dos decimales
        total: parseFloat(detalle.total).toFixed(2), // Convertimos el total a decimal con dos decimales
      }));

      setDetalles(detallesCargados);
      calcularSubtotal(detallesCargados);
    } else {
      console.warn("La respuesta no contiene detalles de la proforma.");
      setDetalles([]);
      calcularSubtotal([]);
    }
  } catch (error) {
    console.error("Hubo un error al cargar los detalles de la proforma. Por favor, inténtalo de nuevo.");
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


  const eliminarDetalle = async (idDetalleProforma) => {
    try {
      const token = getToken();
      await api.delete(`/api/detalleproforma/${idDetalleProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarDetallesProforma();
    } catch (error) {
      console.error("Error al eliminar detalle:", error);
      alert("Error al eliminar el detalle.");
    }
  };

  const agregarDetalle = async () => {
    try {
      const detalleId = idDetalle || (await crearActualizarDetalle(detalle));
      const itemId = await crearActualizarItem();

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
          idproforma: data.idProforma,
          iditem: itemId,
          descuento: descuentoCalculado,
          iddetallep: detalleId,
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
    setIdMoneda("");
  };
  const handleAvanzar = () => {
    // Actualiza los datos globales
    setData((prevData) => ({
      ...prevData,
      detalles, // Guardar los detalles actuales
      subtotal, // Guardar el subtotal actual
    }));
  
    // Guarda los datos en el localStorage
    localStorage.setItem(
      "data",
      JSON.stringify({
        ...data,
        detalles,
        subtotal,
      })
    );
  
    // Avanza al siguiente paso
    avanzarPaso();
  };
  useEffect(() => {
    cargarNiveles();
    cargarMonedas();
    cargarDetallesProforma();
  }, []);

  return (
    <div className="paso4-container">
         {/* Moneda modal */}
      {showMonedaModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Seleccione una Moneda</h3>
            <select onChange={(e) => setIdMoneda(e.target.value)} value={idMoneda}>
              <option value="">Seleccionar moneda</option>
              {monedas.map((moneda) => (
                <option key={moneda.idMoneda} value={moneda.idMoneda}>
                  {moneda.nombre}
                </option>
              ))}
            </select>
            <button onClick={() => setShowMonedaModal(false)}>Confirmar</button>
          </div>
        </div>
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
        <td>{detalle.item}</td> {/* Muestra el ítem aquí */}
        <td>{detalle.precio}</td>
        <td>{detalle.descuento}</td>
        <td>{detalle.total}</td>
        <td>
          <button onClick={() => eliminarDetalle(detalle.idDetalleProforma)}>
            Eliminar
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      <h3>Subtotal: {subtotal}</h3>

      {/* Botón Siguiente */}
      <div className="boton-siguiente">
  <button className="btn-next" onClick={handleAvanzar}>
    Siguiente
  </button>
</div>
    </div>
  );
};

export default Paso4;