import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../services/axiosConfig";
import Swal from "sweetalert2";
import Header from "../../../../components/Header";
import SideMenu from "../../../../components/SideMenu";
import PdfViewer from "../../../../components/PdfViewer";
import "../../../../styles/SideMenu.css";
import "../../../../styles/Header.css";
import "./AnexoProforma.css";
import PdfCreateAnexo from "./PdfCreateAnexo";

const BaseAnexos = () => {
  const { idProforma } = useParams();
  const navigate = useNavigate();
  const [anexoData, setAnexoData] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [proformaData, setProformaData] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  const [descuentoTotal, setDescuentoTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalLiteral, setTotalLiteral] = useState("");
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [idanexo, setIdAnexo] = useState(null);
  const [repuestos, setRepuestos] = useState("No se han añadido repuestos.");
  const [file, setFile] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [fotosExistentes, setFotosExistentes] = useState(false);
  const [fotosSeleccionadas, setFotosSeleccionadas] = useState([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);


  const getToken = () => localStorage.getItem("token");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleEditarDetalles = () => {
  navigate(`/proformas/${idProforma}/${anexoData?.proforma?.nplaca}/Anexo/${idanexo}/detalles`, {
    state: {
      idProforma,
      idanexo,
      idseguro: anexoData?.proforma?.idseguro || null, // Asegúrate de que idseguro esté disponible
    },
  });
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
  const convertBufferToString = (buffer) => {
    // Convierte un buffer a un string
    return String.fromCharCode(...new Uint8Array(buffer));
  };

  const fetchAnexoData = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/anexoproforma/proforma/${idProforma}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.idanexo) {
        setIdAnexo(response.data.idanexo);
        fetchFotos(response.data.idanexo);

        const anexoResponse = await api.get(`/api/anexoproforma/${response.data.idanexo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Convierte el campo `ordenpdf` si es un buffer
        if (anexoResponse.data.ordenpdf && anexoResponse.data.ordenpdf.type === "Buffer") {
          anexoResponse.data.ordenpdf = convertBufferToString(anexoResponse.data.ordenpdf.data);
        }

        const detallesResponse = await api.get(`/api/detalleanexo/${response.data.idanexo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const repuestosResponse = await api.get(`/api/repuestosanexo/proforma/${response.data.idanexo}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAnexoData(anexoResponse.data);
        setDetalles(detallesResponse.data.data || []);
        setRepuestos(repuestosResponse.data.repuestos || []);
        setTotalLiteral(anexoResponse.data.totalliteral || "Sin literal");
        calcularTotales(detallesResponse.data.data || []);
        fetchFotos(response.data.idanexo);
        
      }
    } catch (error) {
      console.error("Error al cargar los datos del anexo:", error);
      Swal.fire("Error", "No se pudieron cargar los datos del anexo.", "error");
    }
  };
  

  // Crear un nuevo Anexo
  const crearAnexo = async () => {
    try {
      const token = getToken();
      const response = await api.post(
        `/api/anexoproforma`,
        { idproforma: idProforma },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIdAnexo(response.data.anexo.idanexo);
      Swal.fire("Éxito", "Anexo creado exitosamente.", "success");
      fetchAnexoData();
    } catch (error) {
      console.error("Error al crear el anexo:", error);
      Swal.fire("Error", "No se pudo crear el anexo.", "error");
    }
  };

  // Eliminar archivo PDF del Anexo
  const deleteOrdenPDF = async () => {
    try {
      const token = getToken();
      await api.delete(`/api/anexoproforma/${idanexo}/delete-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Éxito", "El archivo PDF fue eliminado correctamente.", "success");
      fetchAnexoData();
    } catch (error) {
      console.error("Error al eliminar el archivo PDF:", error);
      Swal.fire("Error", "No se pudo eliminar el archivo PDF.", "error");
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
      await api.post(`/api/anexoproforma/${idanexo}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Éxito", "El archivo se ha subido correctamente.", "success");
      fetchAnexoData();// Refresca los datos del anexo
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      Swal.fire("Error", "No se pudo subir el archivo.", "error");
    }
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
      await api.put(
        `/api/anexoproforma/${idanexo}/confirmacion`,
        { confirmacion: !anexoData.confirmacion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAnexoData();
    } catch (error) {
      console.error("Error al cambiar confirmación:", error);
    }
  };

  const toggleConfirmacionPago = async () => {
    try {
      const token = getToken();
      await api.put(
        `/api/anexoproforma/${idanexo}/confirmacion`,
        { confirmacionpago: !anexoData.confirmacionpago },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAnexoData();
    } catch (error) {
      console.error("Error al cambiar confirmación de pago:", error);
    }
  };

  const calcularTotales = (detalles) => {
    const nuevoSubtotal = detalles.reduce((acc, detalle) => acc + parseFloat(detalle.precio.precio || 0), 0);
    const nuevoDescuentoTotal = detalles.reduce(
      (acc, detalle) => acc + (parseFloat(detalle.precio.precio || 0) * parseFloat(detalle.descuento || 0)) / 100,
      0
    );
    setSubtotal(nuevoSubtotal.toFixed(2));
    setDescuentoTotal(nuevoDescuentoTotal.toFixed(2));
    setTotal((nuevoSubtotal - nuevoDescuentoTotal).toFixed(2));
    
  };
    // Manejar la selección de fotos
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
  
    // Subir nuevas fotos
    const uploadFotos = async () => {
      if (fotosSeleccionadas.length === 0) {
        Swal.fire("Error", "Debes seleccionar al menos una foto antes de subirla.", "error");
        return;
      }
  
      const formData = new FormData();
      fotosSeleccionadas.forEach((foto) => formData.append("fotos", foto));
  
      try {
        
        Swal.fire("Éxito", "Las fotos se han subido correctamente.", "success");
        const token = getToken();
        await api.post(`/api/fotosAnexo/${idanexo}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        const response = await api.get(`/api/anexoproforma/proforma/${idProforma}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchFotos(response.data.idanexo); // Refresca la lista de fotos
      } catch (error) {
        console.error("Error al subir fotos:", error);
        Swal.fire("Error", "Hubo un problema al subir las fotos.", "error");
      }
    };
  
    // Obtener fotos del vehículo
const fetchFotos = async (idanexo) => {
  try {
    const token = getToken();
    const response = await api.get(`/api/fotosAnexo/${idanexo}`, {
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
    // Eliminar una foto
    const eliminarFoto = async (idfoto) => {
      try {
        const token = getToken();
        await api.delete(`/api/fotosAnexo/${idfoto}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Eliminada", "La foto se eliminó correctamente.", "success");
        cerrarModal();
        const response = await api.get(`/api/anexoproforma/proforma/${idProforma}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchFotos(response.data.idanexo);  // Refresca la lista de fotos
      } catch (error) {
        console.error("Error al eliminar foto:", error);
        Swal.fire("Error", "No se pudo eliminar la foto.", "error");
      }
    };
  
    // Manejo del modal para mostrar la imagen seleccionada
    const handleImagenClick = (foto) => {
      setImagenSeleccionada(foto);
      setMostrarModal(true);
    };
  
    const cerrarModal = () => {
      setMostrarModal(false);
      setImagenSeleccionada(null);
    };
  

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
      fetchAnexoData();
      fetchProformaData();
    }

  }, [idProforma,navigate]);

  return (
    <div className="home-container">
      <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />
      <SideMenu user={user} handleLogout={handleLogout} isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <div className="base-anexos">
        <h1>Datos de la Proforma</h1>
        {anexoData && anexoData.proforma ? (
          <>
            <p>
              <strong>Número Proforma:</strong> {anexoData.proforma.numerop || "No disponible"}
            </p>
            <p>
              <strong>Año:</strong> {anexoData.proforma.anio || "No disponible"}
            </p>
          </>
        ) : (
          <p>Cargando datos de la proforma...</p>
        )}
        {idanexo === null ? (
          <button className="btn-crear-anexo" onClick={crearAnexo}>
            Crear Anexo
          </button>
        ) : (
          anexoData && (
            <>
              <div className="proforma-section">
                <h2>Datos del Anexo</h2>
                <p>
                  <strong>ID Anexo:</strong> {idanexo}
                </p>
                <button className="btn-detalles" onClick={handleEditarDetalles}>
                  Editar Detalles
                </button>
              </div>
              <div className="proforma-section">
  <h2>Detalles del Anexo</h2>
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
          <tr key={detalle.iddetallea}>
            <td>{detalle.detallePrecio?.detalle || "No disponible"}</td>
            <td>{detalle.precio?.detalle || "No disponible"}</td>
            <td>{detalle.precio?.precio || "No disponible"}</td>
            <td>{detalle.descuento}%</td>
            <td>{detalle.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>No hay detalles asociados al anexo.</p>
  )}
</div>

              <div className="proforma-section">
                <h2>Totales</h2>
                    <p>
              <strong>Moneda:</strong>{proformaData.seguro?.moneda?.nombre|| "No tengo"}
            </p>
                <p>
                  <strong>Subtotal:</strong> {subtotal} Bs
                </p>
                <p>
                  <strong>Descuento Total:</strong> {descuentoTotal} Bs
                </p>
                <p>
                  <strong>Total General:</strong> {total} Bs
                </p>
                <p>
                  <strong>Total Literal:</strong> {totalLiteral || "No disponible"}{". "}{proformaData.seguro?.moneda?.nombre|| "No tengo"}
                </p>
              </div>
              <div className="proforma-section">
                <h2>Estados</h2>
                <p>
                  <strong>Confirmación:</strong>{" "}
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={anexoData.confirmacion}
                      onChange={async () => {
                        await toggleConfirmacion();
                        fetchAnexoData();
                      }}
                    />
                    <span className="slider"></span>
                  </label>
                </p>
                {anexoData.confirmacion && (
                  <>
                    <p>
                      <strong>Confirmación Pago:</strong>{" "}
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={anexoData.confirmacionpago}
                          onChange={async () => {
                            await toggleConfirmacionPago();
                            fetchAnexoData();
                          }}
                        />
                        <span className="slider"></span>
                      </label>
                    </p>
                    <h2>Orden PDF</h2>
                    {anexoData.ordenpdf ? (
                      <>
                        <PdfViewer
                          pdfUrl={`${API_URL}/uploads/anexos/${
                            typeof anexoData.ordenpdf === "object"
                            ? anexoData.ordenpdf.filename || anexoData.ordenpdf.data
                            : anexoData.ordenpdf
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
                  </>
                )}
              </div>
              <div className="proforma-section">
  <h2>Lista de Repuestos</h2>
  <p>
    {Array.isArray(repuestos) && repuestos.length > 0
      ? repuestos.map((repuesto, index) => (
          <span key={index}>{repuesto.detalle || "Detalle no disponible"}</span>
        ))
      : "No hay repuestos asociados a este anexo."}
  </p>
  <button
    className="btn-repuestos"
    onClick={() =>
      navigate(
        `/proformas/${idProforma}/${anexoData.proforma.nplaca}/Anexo/${idanexo}/repuestos`
      )
    }
  >
    Editar Repuestos
  </button>

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
            onError={(e) => {
              e.target.src = "/placeholder-image.png"; // Imagen por defecto si hay error
              console.error("Error cargando imagen:", e);
            }}
          />
        ))}
      </div>

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
      </div>
            </>
          )
        )}
        <button onClick={() => navigate(`/proformas/${idProforma}/${anexoData?.proforma?.nplaca || ""}`)}>
          CONFIRMAR
          </button>
      <PdfCreateAnexo
  proformaData={proformaData}
  detalles={detalles}
  repuestos={repuestos}
  anexoData={anexoData}
  idProforma={idProforma}
  fotos={fotos}
/>
      </div>
    </div>
    
  );
};

export default BaseAnexos;