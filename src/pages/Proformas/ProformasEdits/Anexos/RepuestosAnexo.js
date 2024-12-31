import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../services/axiosConfig";
import "./Repuestos.css";
import Swal from "sweetalert2";
import Header from "../../../../components/Header";
import SideMenu from "../../../../components/SideMenu";
import "../../../../styles/SideMenu.css";
import "../../../../styles/Header.css";

const Repuestos = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { idProforma, nplaca, idanexo } = useParams();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const navigate = useNavigate();
  const [repuestos, setRepuestos] = useState("");
  const [idRepuesto, setIdRepuesto] = useState(null);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    if (idanexo) {
      cargarRepuestos();
    }
  }, [idanexo]);
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
  // Cargar repuestos por idanexo
  const cargarRepuestos = async () => {
    try {
      const token = getToken();
      const response = await api.get(`/api/repuestosanexo/proforma/${idanexo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.repuestos && response.data.repuestos.length > 0) {
        const repuesto = response.data.repuestos[0]; // Asumimos que solo hay un repuesto por anexo
        setRepuestos(repuesto.detalle);
        setIdRepuesto(repuesto.iditem);
      } else {
        setRepuestos("");
        setIdRepuesto(null);
      }
    } catch (error) {
      console.error("Error al cargar los repuestos:", error);
    }
  };

  // Guardar o actualizar los repuestos
  const guardarRepuestos = async () => {
    try {
      const token = getToken();
      const payload = {
        detalle: repuestos,
        idanexo, // Asociar repuestos al anexo
      };

      if (idRepuesto) {
        await api.put(`/api/repuestosanexo/${idRepuesto}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Repuestos actualizados correctamente.");
      } else {
        await api.post(`/api/repuestosanexo`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Repuestos creados correctamente.");
        
      }

      cargarRepuestos();
      handleVolver();
    } catch (error) {
      console.error("Error al guardar los repuestos:", error);
      alert("Error al guardar los repuestos.");
    }
  };

  // Manejar la acción de "Volver"
  const handleVolver = () => {
    navigate(`/proformas/${idProforma}/${nplaca}/Anexo/${idProforma}`);
  };

  return (
    <div className="home-container">
      <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />
      <SideMenu user={user} handleLogout={handleLogout} isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
    <div className="repuestos-container">
      <h2>Editar Repuestos</h2>
      <div className="repuestos-form">
        <label>Lista de Repuestos:</label>
        <textarea
          rows="10"
          cols="50"
          value={repuestos}
          onChange={(e) => setRepuestos(e.target.value)}
          placeholder="Escribe aquí la lista de repuestos, un repuesto por línea..."
        ></textarea>
      </div>
      <div className="buttons-container">
        <button onClick={handleVolver}>Volver</button>
        <button onClick={guardarRepuestos}>
          {idRepuesto ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </div>
    </div>
  );
};

export default Repuestos;