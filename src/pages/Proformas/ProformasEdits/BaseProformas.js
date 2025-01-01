import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import api from "../../../services/axiosConfig";
import Swal from "sweetalert2";
import Header from "../../../components/Header";
import SideMenu from "../../../components/SideMenu";
import "../../../styles/SideMenu.css";
import "../../../styles/Header.css";
import "./BaseProformas.css";
import PdfCreateProforma from "./PdfCreateProforma";
import PdfViewer from "../../../components/PdfViewer";

const BaseProformas = () => {
  const { idProforma } = useParams();
  const navigate = useNavigate();
  const [proformaData, setProformaData] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [repuestos, setRepuestos] = useState("No se han añadido repuestos.");
  const [marca, setMarca] = useState("Sin determinar");
  const [seguro, setSeguro] = useState("Sin determinar");
  const [broker, setBroker] = useState("Sin determinar");
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [file, setFile] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const [fotos, setFotos] = useState([]);
const [fotosExistentes, setFotosExistentes] = useState(false);
const [fotosSeleccionadas, setFotosSeleccionadas] = useState([]);
const [imagenSeleccionada, setImagenSeleccionada] = useState(null); // Almacena la imagen seleccionada
const [mostrarModal, setMostrarModal] = useState(false); // Controla la visibilidad del modalz
const handleImagenClick = (foto) => {
  setImagenSeleccionada(foto);
  setMostrarModal(true);
};
const eliminarFoto = async (idfoto) => {
  try {
    const token = getToken();
    await api.delete(`/api/fotosProforma/${idfoto}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    Swal.fire("Eliminada", "La foto se eliminó correctamente.", "success");
    fetchFotos(); // Actualiza las fotos después de eliminar
    cerrarModal();
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    Swal.fire("Error", "No se pudo eliminar la foto.", "error");
  }
};
const cerrarModal = () => {
  setMostrarModal(false);
  setImagenSeleccionada(null);
};

// Obtener fotos del vehículo
const fetchFotos = async () => {
  try {
    const token = getToken();
    const response = await api.get(`/api/fotosProforma/${idProforma}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const fotosObtenidas = response.data.fotos || [];

    setFotos(fotosObtenidas);
    setFotosExistentes(fotosObtenidas.length > 0);
  } catch (error) {
    console.error("Error al obtener fotos:", error);
    setFotos([]); // Limpia el estado en caso de error
    setFotosExistentes(false); // Garantiza que esté en falso si falla
  }
};

// Subir nuevas fotos
const uploadFotos = async () => {
  if (fotosSeleccionadas.length === 0) {
    Swal.fire("Error", "Debes seleccionar al menos una foto antes de subirla.", "error");
    return;
  }

  const formData = new FormData();
  fotosSeleccionadas.forEach((foto) => formData.append("fotos", foto));

  try {
    const token = getToken();
    const response = await api.post(`/api/fotosProforma/${idProforma}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    Swal.fire("Éxito", "Las fotos se han subido correctamente.", "success");
    fetchFotos(); // Refresca la lista de fotos
  } catch (error) {
    console.error("Error al subir fotos:", error);
    Swal.fire("Error", "Hubo un problema al subir las fotos.", "error");
  }
};

// Manejar selección de fotos
const handleFotosChange = (e) => {
  const seleccionadas = Array.from(e.target.files);
  if (seleccionadas.length + fotos.length > 15) {
    Swal.fire(
      "Límite excedido",
      "No puedes subir más de 15 fotos en total.",
      "error"
    );
    return;
  }
  setFotosSeleccionadas(seleccionadas);
};

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
  const fetchProformaData = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/proformas/${idProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProformaData(response.data);
    } catch (error) {
      console.error("Error al refrescar los datos de la proforma:", error);
      Swal.fire("Error", "No se pudieron refrescar los datos.", "error");
    }
  };

  const toggleConfirmacion = async () => {
    try {
      const token = getToken();
      const updatedData = { confirmacion: !proformaData.confirmacion };
      const response = await api.put(`/api/proformas/${idProforma}/confirmacion`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Actualizamos usando la respuesta de la API
      setProformaData((prev) => ({ ...prev, confirmacion: response.data.confirmacion }));
      Swal.fire("Éxito", "El estado de confirmación se ha actualizado.", "success");
      fetchProformaData();
    } catch (error) {
      console.error("Error al actualizar el estado de confirmación:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido.";
      Swal.fire("Error", `No se pudo actualizar el estado de confirmación. ${errorMessage}`, "error");
    }
  };
  
  const toggleConfirmacionPago = async () => {
    try {
      const token = getToken();
      const updatedData = { confirmacionpago: !proformaData.confirmacionpago };
      const response = await api.put(`/api/proformas/${idProforma}/confirmacion`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Actualizamos usando la respuesta de la API
      setProformaData((prev) => ({ ...prev, confirmacionpago: response.data.confirmacionpago }));
      Swal.fire("Éxito", "El estado de confirmación de pago se ha actualizado.", "success");
      fetchProformaData();
    } catch (error) {
      console.error("Error al actualizar el estado de confirmación de pago:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido.";
      Swal.fire("Error", `No se pudo actualizar el estado de confirmación de pago. ${errorMessage}`, "error");
    }
  };
  const handleFileChange = (e) => setFile(e.target.files[0]);
  
  const uploadOrdenPDF = async () => {
    if (!file) {
      Swal.fire("Error", "Debes seleccionar un archivo antes de subirlo.", "error");
      return;
    }
    const formData = new FormData();
    formData.append("ordenpdf", file);
    try {
      const token = getToken();
      const response = await api.post(`/api/proformas/${idProforma}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setProformaData((prevData) => ({
        ...prevData,
        ordenpdf: response.data.ordenpdf, // Esto debería venir del backend correctamente
      }));
      Swal.fire("Éxito", "El archivo se ha subido correctamente.", "success");
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      const errorMessage = error.response?.data?.error || "Error desconocido.";
      Swal.fire("Error", `No se pudo subir el archivo. ${errorMessage}`, "error");
    }
  };
  const convertBufferToString = (buffer) => {
    // Convierte un buffer a un string
    return String.fromCharCode(...new Uint8Array(buffer));
  };

  const handleEditarCliente = async () => {
    try {
      const token = getToken();
      if (!token) {
        Swal.fire("Error", "No tienes permisos para realizar esta acción.", "error");
        return;
      }
  
      // Hacer una nueva llamada para garantizar los datos actualizados
      const response = await api.get(`/api/proformas/${idProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const updatedProforma = response.data;
  
      // Mostrar los datos obtenidos en la consola
      console.log("Datos obtenidos de la proforma:", updatedProforma);
  
      navigate(`/proformas/${idProforma}/${updatedProforma.vehiculo.nplaca}/Cliente`, {
        state: {
          idtrabajo: updatedProforma.idtrabajo, // Usar idtrabajo en lugar de idTrabajo
          cliente: updatedProforma.cliente,
          clienteRC: updatedProforma.clienteRC,
          nplaca2: updatedProforma.nplaca,
        },
      });
    } catch (error) {
      console.error("Error al obtener los datos de la proforma:", error);
  
      // Mostrar un mensaje de error más detallado si la llamada falla
      const errorMessage =
        error.response?.data?.error || "Hubo un problema al obtener los datos de la proforma.";
      Swal.fire("Error", errorMessage, "error");
    }
  };
  const deleteOrdenPDF = async () => {
    try {
        const token = getToken();
        const response = await api.delete(`/api/proformas/${idProforma}/delete-pdf`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Éxito", "El archivo se ha eliminado correctamente.", "success");
        fetchProformaData(); // Refresca los datos
    } catch (error) {
        console.error("Error al eliminar el archivo:", error);
        const errorMessage = error.response?.data?.error || "Error desconocido.";
        Swal.fire("Error", `No se pudo eliminar el archivo. ${errorMessage}`, "error");
    }
};

  useEffect(() => {
    const fetchProformaData = async () => {
      try {
        const token = getToken();
        if (!token) return navigate("/login");
  
        const proformaResponse = await api.get(`/api/proformas/${idProforma}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const proforma = proformaResponse.data || {};
        const idMarca = proforma?.vehiculo?.modelo?.idmarca ;
        if (idMarca) {
          const marcaResponse = await api.get(`/api/marcas/${idMarca}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMarca(marcaResponse.data?.nombre || "Sin determinar");
        }
      // Manejar broker
      const idBroker = proforma?.inspectorbroker?.idBroker;
      console.log("ID Broker:", idBroker);
      if (idBroker) {
        const brokerResponse = await api.get(`/api/brokers/${idBroker}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const brokerData = brokerResponse.data?.data;
        console.log("Datos del Broker:", brokerData);
        setBroker(brokerData?.nombreBroker || "Sin determinar");
      } else {
        setBroker("Sin determinar");
      }
        
        if (proforma.ordenpdf && proforma.ordenpdf.type === 'Buffer') {
          proforma.ordenpdf = convertBufferToString(proforma.ordenpdf.data);
        }
        setProformaData(proforma);
        const detallesResponse = await api.get(`/api/detalleproforma/${idProforma}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDetalles(detallesResponse.data?.data || []);
  
        const repuestosResponse = await api.get(`/api/repuestos/proforma/${idProforma}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRepuestos(repuestosResponse.data?.repuestos?.[0]?.detalle );
      } catch (error) {
        console.error("Error al obtener los datos de la proforma:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
      fetchProformaData();
      fetchFotos();
    }
  }, [idProforma, navigate]);

  if (loading) {
    return <div className="base-proformas">Cargando datos...</div>;
  }

  if (!proformaData) {
    return (
      <div className="base-proformas">
        <h1>Error</h1>
        <p>No se pudieron cargar los datos de la proforma.</p>
      </div>
    );
  }

  const handleConfirmar = () => navigate("/proformas");

  return (
    <div className="home-container">
      {/* Barra de navegación superior */}
      <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />

      {/* Menú lateral */}
      <SideMenu 
        user={user}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />
    <div className="base-proformas">
    

      <h1>Proforma</h1>
      <p>
        <strong>Número:</strong> {proformaData.numerop || "Sin número"} /{" "}
        <strong>Año:</strong> {proformaData.anio || "Sin año"}
        <button
  className="btn-anexo"
  onClick={() =>
    navigate(`/proformas/${idProforma}/${proformaData?.vehiculo?.nplaca}/Anexo/${idProforma}`)
  }
>
  Agregar Anexo
</button>
      </p>

      <div className="proforma-section">
        <h2>Datos Principales</h2>
        <p>
          <strong>ID Proforma:</strong> {idProforma}
        </p>
        <p>
          <strong>Fecha:</strong> {proformaData.fecha || "No disponible"}
        </p>
        <p>
          <strong>Vigente Hasta:</strong> {proformaData.fechavigencia || "No disponible"}
        </p>
      </div>
      

      {proformaData.tipotrabajo?.tipoTrabajo !== "Particular" && (
        <>
          <div className="proforma-section">
            <h2>Datos Seguro</h2>
            <p>
              <strong>Nombre Inspector:</strong> {proformaData.inspectorseguro?.nombre || "Sin determinar"}
            </p>
            <p>
              <strong>Seguro:</strong> {proformaData.seguro?.nombreSeguro || "Sin determinar"}
            </p>
            <p>
              <strong>Correo:</strong> {proformaData.inspectorseguro?.mail || "Sin determinar"}
            </p>
          </div>

          <div className="proforma-section">
            <h2>Datos Broker</h2>
            <p>
              <strong>Nombre Inspector:</strong> {proformaData.inspectorbroker?.nombre || "Sin determinar"}
            </p>
            <p>
              <strong>Broker:</strong> {broker}
            </p>
            <p>
              <strong>Correo:</strong> {proformaData.inspectorbroker?.mail || "Sin determinar"}
            </p>
            <button
      className="btn-edit-custom"
      onClick={() =>
        navigate(`/proformas/${idProforma}/${proformaData?.vehiculo?.nplaca}/SeguroBroker`, {
          state: {
            idSeguro: proformaData?.seguro?.idseguro,
            idBroker: proformaData?.inspectorbroker?.idBroker,
            idInspectorS: proformaData?.inspectorseguro?.idInspectorS,
            idInspectorB: proformaData?.inspectorbroker?.idInspectorB,

          },
        })
      }
    >
      Editar Seguro y Broker
    </button>
          </div>

        </>
      )}

<div className="proforma-section">
  <h2>Datos Cliente</h2>
  <p>
    <strong>Nombre:</strong>{" "}
    {proformaData?.cliente?.nombre || "Sin determinar"}
  </p>
  <p>
    <strong>Teléfono:</strong>{" "}
    {proformaData?.cliente?.telefono || "Sin determinar"}
  </p>
  <p>
    <strong>Correo:</strong>{" "}
    {proformaData?.cliente?.mail || "Sin determinar"}
  </p>
  

</div>
{proformaData.tipotrabajo?.tipoTrabajo === "SeguroRC" && (
  <div className="proforma-section">
    <h2>Datos Cliente RC</h2>
    <p>
      <strong>Nombre:</strong>{" "}
      {proformaData?.clienteRC?.nombre || "Sin determinar"}
    </p>
    <p>
      <strong>Teléfono:</strong>{" "}
      {proformaData?.clienteRC?.telefono || "Sin determinar"}
    </p>
    <p>
      <strong>Correo:</strong>{" "}
      {proformaData?.clienteRC?.mail || "Sin determinar"}
    </p>
  </div>
)}
  <button onClick={handleEditarCliente}>Editar Cliente</button>
<div className="proforma-section">
  <h2>Datos Vehículo</h2>
  <p>
    <strong>Placa:</strong>{" "}
    {proformaData?.vehiculo?.nplaca || "Sin determinar"}
  </p>
  <p>
    <strong>Tipo Vehículo:</strong>{" "}
    {proformaData?.vehiculo?.modelo?.tipoVehiculo?.tipo || "Sin determinar"}
  </p>
  <p>
    <strong>Marca:</strong> {marca}
  </p>
  <p>
    <strong>Modelo:</strong>{" "}
    {proformaData?.vehiculo?.modelo?.nombre || "Sin determinar"}
  </p>
  <p>
    <strong>Color:</strong>{" "}
    {proformaData?.vehiculo?.color || "Sin determinar"}
  </p>

  <button
    className="btn-vehiculo"
    onClick={() => navigate(`/proformas/${idProforma}/${proformaData.vehiculo.nplaca}/Vehiculo`)}
  >
    Editar Vehículo
  </button>
</div>
      <div className="proforma-section">
        <h2>Detalles</h2>
        {detalles.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Detalle</th>
                <th>Ítem</th>
                <th>Precio</th>
                <th>Descuento</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((detalle) => (
                <tr key={detalle.idDetalleProforma}>
                  <td>{detalle.detalle}</td>
                  <td>{detalle.item}</td>
                  <td>{detalle.precio}</td>
                  <td>{detalle.descuento}</td>
                  <td>{detalle.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          
        ) : (
          <p>No hay detalles asociados.</p>
        )}
        <button
  className="btn-detalles"
  onClick={() =>
    navigate(`/proformas/${idProforma}/${proformaData.vehiculo.nplaca}/detalles`, {
      state: {
        idSeguro: proformaData?.seguro?.idseguro || null,// Asegúrate de enviar el idSeguro
      },
    })
  }
>
  Editar Detalles
</button>
      </div>

      <div className="proforma-section">
        <h2>Lista de Repuestos</h2>
        <p>{repuestos}</p>
        <button
    className="btn-repuestos"
    onClick={() => navigate(`/proformas/${idProforma}/${proformaData.vehiculo.nplaca}/Repuestos`)}
  >
    Editar Repuestos
  </button>
      </div>

      <div className="proforma-section">
        <h2>Resumen Financiero</h2>
        <p>
          <strong>Moneda:</strong>{proformaData.seguro?.moneda?.nombre|| "No tengo"}
        </p>
        <p>
          <strong>Subtotal:</strong> {proformaData.subtotal || "0.00" }
        </p>
        <p>
          <strong>Descuento Total:</strong> {proformaData.descuento || "0.00"}
        </p>
        <p>
          <strong>Total:</strong> {proformaData.total || "0.00"}
        </p>
        
        <p>
          <strong>Total Literal:</strong> {proformaData.totalliteral || "0.00"} {" "}{proformaData.seguro?.moneda?.nombre|| "No tengo"}
        </p>
        
      </div>
      <div className="proforma-section">
  <h2>Estados</h2>
  <p>
    <strong>Confirmación:</strong>{" "}
    <label className="switch">
      <input
        type="checkbox"
        checked={proformaData.confirmacion}
        onChange={toggleConfirmacion}
      />
      <span className="slider"></span>
    </label>
  </p>
</div>
{/* Mostrar secciones adicionales si confirmación está activa */}
{proformaData.confirmacion && (
  <div className="proforma-section">
    <p>
      <strong>Confirmación Pago:</strong>{" "}
      <label className="switch">
        <input
          type="checkbox"
          checked={proformaData.confirmacionpago}
          onChange={toggleConfirmacionPago}
        />
        <span className="slider"></span>
      </label>
    </p>
    <h2>Orden PDF</h2>
    {proformaData.ordenpdf ? (
      <>
        <PdfViewer
    pdfUrl={`${API_URL}/uploads/proformas/${
        typeof proformaData.ordenpdf === "object"
            ? proformaData.ordenpdf.filename || proformaData.ordenpdf.data
            : proformaData.ordenpdf
    }`}
/>
        <button onClick={deleteOrdenPDF}>Eliminar PDF</button>
      </>
    ) : (
      <>
        <input type="file" onChange={handleFileChange} />
        <button onClick={uploadOrdenPDF}>Subir PDF</button>
      </>
    )}
  </div>
)}
<div className="proforma-section">
  <h2>Fotos del Vehículo</h2>

  {fotosExistentes ? (
  <>
    <p>Ya existen fotos guardadas:</p>
    <div className="fotos-container">
    {fotos.map((foto, index) => (
    <img
      key={index}
      src={foto.foto}
      alt={`Foto ${index + 1}`}
      className="foto-thumbnail"
      onClick={() => handleImagenClick(foto)}
      onError={(e) => console.error("Error cargando imagen:", e)}  // Abre modal al hacer clic
    />
      ))}
    </div>
    {/* Modal para mostrar imagen completa */}
{mostrarModal && (
  <div className="modal-overlay" onClick={cerrarModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <img src={imagenSeleccionada.foto} alt="Imagen completa" className="imagen-completa" />
      <div className="modal-buttons">
        <button onClick={cerrarModal} className="btn-volver">Volver</button>
        <button
          onClick={() => eliminarFoto(imagenSeleccionada.idfoto)}
          className="btn-eliminar"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
)}
  </>
) : (
  <p>No hay fotos guardadas para este vehículo.</p>
)}

{fotos.length < 15 && (
  <>
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handleFotosChange}
    />
    <button onClick={uploadFotos}>Subir Fotos</button>
  </>
)}

{fotos.length === 15 && (
  <p>No puedes subir más fotos. El límite de 15 fotos ha sido alcanzado.</p>
)}
</div>

      <button className="btn-confirmar" onClick={handleConfirmar}>
        Confirmar
      </button>
      <PdfCreateProforma
  proformaData={proformaData}
  detalles={detalles}
  repuestos={repuestos}
  marca={marca}
  idProforma={idProforma}
  fotos={fotos}
/>
      
    </div>
  </div>
  );
};

export default BaseProformas;
