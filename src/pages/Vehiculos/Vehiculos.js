import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/axiosConfig";
import "./Vehiculo.css";
import Swal from "sweetalert2";
import Header from "../../components/Header";
import SideMenu from "../../components/SideMenu";
import "../../styles/SideMenu.css";
import "../../styles/Header.css";
import AddModal from "./AddModal";
import AddModeloModal from "./AddModeloModal";
import EditModeloModal from "./EditModeloModal"; // Importación del modal de edición

const Vehiculos = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [tiposVehiculos, setTiposVehiculos] = useState([]); // Estado para tipos de vehículos
  const [selectedMarca, setSelectedMarca] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [addModeloModalOpen, setAddModeloModalOpen] = useState(false);
  const [editModeloModalOpen, setEditModeloModalOpen] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

  const fetchMarcas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/marcas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarcas(response.data);
      if (response.data.length > 0) {
        setSelectedMarca(response.data[0].idMarca);
        fetchModelos(response.data[0].idMarca);
      }
    } catch (error) {
      console.error("Error al obtener las marcas:", error);
    }
  };
  const handleDeleteClick = (modelo) => {
    Swal.fire({
      title: `¿Estás seguro de eliminar el modelo "${modelo.nombre}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
  
          // Llamada para marcar el modelo como eliminado
          await api.put(
            `/api/modelos/${modelo.idModelo}/delete`,
            { isdeleted: true }, // Borrado lógico
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
  
          Swal.fire(
            "Eliminado",
            `El modelo "${modelo.nombre}" ha sido eliminado.`,
            "success"
          );
  
          // Refrescar la lista de modelos
          fetchModelos(selectedMarca);
        } catch (error) {
          console.error("Error al eliminar el modelo:", error);
  
          // Manejo del error
          Swal.fire(
            "Error",
            error.response?.data?.message || "No se pudo eliminar el modelo. Inténtalo nuevamente.",
            "error"
          );
        }
      }
    });
  };

  const fetchModelos = async (idMarca) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/api/modelos?marca=${idMarca}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModelos(response.data);
    } catch (error) {
      console.error("Error al obtener los modelos:", error);
    }
  };

  const fetchTiposVehiculos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/tipos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTiposVehiculos(response.data);
    } catch (error) {
      console.error("Error al obtener los tipos de vehículos:", error);
    }
  };

  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  const handleModalClose = () => {
    setAddModalOpen(false);
    fetchMarcas();
  };

  const handleEditClick = (modelo) => {
    setSelectedModelo(modelo);
    setEditModeloModalOpen(true);
  };

  useEffect(() => {
    fetchMarcas();
    fetchTiposVehiculos();
  }, []);

  return (
    <div className="home-container">
      <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />
      <SideMenu isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <div className="vehiculos-container">
        <button className="add-marca-button" onClick={handleAddClick}>
          Agregar/Editar Marca
        </button>
        <div className="vehiculos-content">
          <div className="marcas-list">
            <ul>
              {marcas.map((marca) => (
                <li key={marca.idMarca}>
                  <button
                    className={`marca-button ${
                      selectedMarca === marca.idMarca ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedMarca(marca.idMarca);
                      fetchModelos(marca.idMarca);
                    }}
                  >
                    {marca.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="modelos-list">
            {selectedMarca && (
              <button
                className="add-modelo-button"
                onClick={() => setAddModeloModalOpen(true)}
              >
                Nuevo Modelo
              </button>
            )}
            {modelos.length > 0 ? (
              <table className="modelos-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {modelos.map((modelo) => (
                    <tr key={modelo.idModelo}>
                      <td>{modelo.nombre}</td>
                      <td>{modelo.tipoVehiculo.tipo}</td>
                      <td>
  <button
    className="btn-modify"
    onClick={() => handleEditClick(modelo)}
  >
    Editar
  </button>
  <button
    className="btn-delete"
    onClick={() => handleDeleteClick(modelo)}
  >
    Eliminar
  </button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-modelos">No hay modelos disponibles.</div>
            )}
          </div>
        </div>
        {addModalOpen && (
          <AddModal
            onClose={handleModalClose}
            onAddSuccess={fetchMarcas}
            onDeleteSuccess={fetchMarcas}
          />
        )}
      </div>
      {addModeloModalOpen && (
        <AddModeloModal
          onClose={() => setAddModeloModalOpen(false)}
          onAddSuccess={() => fetchModelos(selectedMarca)}
          idMarca={selectedMarca}
          nombreMarca={marcas.find((marca) => marca.idMarca === selectedMarca)?.nombre}
        />
      )}
      {editModeloModalOpen && (
        <EditModeloModal
          onClose={() => setEditModeloModalOpen(false)}
          onEditSuccess={() => fetchModelos(selectedMarca)}
          modelo={selectedModelo}
          tiposVehiculos={tiposVehiculos}
        />
      )}
    </div>
  );
};

export default Vehiculos;