import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../../services/axiosConfig";
import Swal from "sweetalert2";
import Header from "../../../../components/Header";
import SideMenu from "../../../../components/SideMenu";
import "../../../../styles/SideMenu.css";
import "../../../../styles/Header.css";
import "./Detalles.css";

const DetallesAnexo = () => {
  const { nplaca } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { idProforma, idanexo, idseguro } = location.state || {};
  const [niveles, setNiveles] = useState([]);
  const [idNivel, setIdNivel] = useState("");
  const [detalle, setDetalle] = useState("");
  const [idDetalle, setIdDetalle] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemsSugeridos, setItemsSugeridos] = useState([]);
  const [detallesSugeridos, setDetallesSugeridos] = useState([]);
  const [itemBusqueda, setItemBusqueda] = useState("");
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("");

  const getToken = () => localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Estás a punto de cerrar sesión",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        Swal.fire({
          title: "Sesión cerrada",
          text: "Has cerrado sesión correctamente.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/login");
      }
    });
  };

  useEffect(() => {
    cargarNiveles();
    cargarDetallesAnexo();
  }, [idanexo, idseguro]);

  const cargarNiveles = async () => {
    if (!idseguro) {
      console.error("ID de seguro no disponible.");
      return;
    }
    try {
      const token = getToken();
      const response = await api.get(`/api/nivelprecio/by-seguro?idSeguro=${idseguro}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNiveles(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar niveles:", error);
    }
  };

  const cargarDetallesAnexo = async () => {
    if (!idanexo) {
      console.error("ID del anexo no disponible.");
      return;
    }
    try {
      const token = getToken();
      const response = await api.get(`/api/detalleanexo/${idanexo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const detallesData = response.data?.data || [];
      const detallesConTotales = detallesData.map((detalle) => ({
        ...detalle,
        total: parseFloat(
          detalle.precio.precio - (detalle.precio.precio * (detalle.descuento || 0)) / 100
        ).toFixed(2),
      }));
      setDetalles(detallesConTotales);
      calcularSubtotal(detallesConTotales);
    } catch (error) {
      console.error("Error al cargar detalles del anexo:", error);
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

  const agregarDetalle = async () => {
    if (!idNivel || !detalle || !precio || isNaN(precio) || parseFloat(precio) <= 0) {
      Swal.fire("Error", "Todos los campos son obligatorios.", "error");
      return;
    }
    try {
      const token = getToken();
      await api.post(
        "/api/detalleanexo",
        {
          idanexo, // Usamos el ID del anexo
          iditem: itemSeleccionado?.idItem,
          descuento: descuento || 0,
          iddetallep: idDetalle,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarDetallesAnexo();
      limpiarCampos();
    } catch (error) {
      console.error("Error al agregar detalle:", error);
      Swal.fire("Error", "Hubo un problema al agregar el detalle.", "error");
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

  const eliminarDetalle = async (idDetalleAnexo) => {
    try {
      const token = getToken();
      await api.delete(`/api/detalleanexo/${idDetalleAnexo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      cargarDetallesAnexo();
    } catch (error) {
      console.error("Error al eliminar detalle:", error);
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
    <div className="home-container">
      <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />
      <SideMenu
        user={user}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />
      <div className="detalles-container">
        <h2>Editar Detalles de Anexo</h2>

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
          />

          <label>Descuento (%):</label>
          <input
            type="number"
            value={descuento}
            onChange={(e) => setDescuento(e.target.value)}
          />

          <button onClick={agregarDetalle}>Agregar Detalle</button>
        </div>

        <h3>Detalles de Anexo</h3>
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
              <tr key={detalle.iddetallea}>
                <td>{detalle.detallePrecio?.detalle || "No disponible"}</td>
                <td>{detalle.precio?.detalle || "No disponible"}</td>
                <td>{detalle.precio?.precio || "0.00"}</td>
                <td>{detalle.descuento || "0.00"}</td>
                <td>{detalle.total || "0.00"}</td>
                <td>
                  <button onClick={() => eliminarDetalle(detalle.iddetallea)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Subtotal: {subtotal}</h3>
        <button onClick={() => navigate(`/proformas/${idProforma}/${nplaca}/Anexo/${idProforma}`)}>
          Volver a Proforma
        </button>
      </div>
    </div>
  );
};

export default DetallesAnexo;