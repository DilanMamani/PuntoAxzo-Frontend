import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../../components/Header';
import SideMenu from '../../components/SideMenu';
import api from '../../services/axiosConfig';
import '../../styles/SideMenu.css';
import '../../styles/Header.css';
import './Proformas.css';

const Proformas = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [proformas, setProformas] = useState([]); // Todas las proformas
  const [filteredProformas, setFilteredProformas] = useState([]); // Proformas filtradas
  const [searchText, setSearchText] = useState(''); // Texto de búsqueda
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [allProformas, setAllProformas] = useState([]); // Datos originales// Datos filtrados/paginados
  const navigate = useNavigate();
  const totalPages = Math.ceil(allProformas.length / limit);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
    const fetchProformas = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/proformas', {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log('Datos obtenidos:', response.data); // Verifica que contiene todos los datos
        setAllProformas(response.data); // Guardar todos los datos
        setProformas(response.data.slice(0, limit)); // Mostrar los primeros elementos
      } catch (error) {
        console.error('Error al cargar las proformas:', error);
        Swal.fire('Error', 'No se pudieron cargar las proformas.', 'error');
      }
    };
  
    fetchProformas();
  }, [limit]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de cerrar sesión',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Swal.fire({
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/login');
      }
    });
  };

  const handleDeleteProforma = async (idProforma) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará la proforma de forma permanente.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        const confirmResult = await Swal.fire({
          title: '¿Realmente quieres eliminar?',
          text: 'Esta acción no se puede deshacer.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar definitivamente',
          cancelButtonText: 'Cancelar',
        });

        if (confirmResult.isConfirmed) {
          const token = localStorage.getItem('token');
          await api.delete(`/api/proformas/${idProforma}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          Swal.fire('Eliminado', 'La proforma ha sido eliminada.', 'success');
          setProformas(proformas.filter((proforma) => proforma.idproforma !== idProforma));
          setFilteredProformas(
            filteredProformas.filter((proforma) => proforma.idproforma !== idProforma)
          );
        }
      }
    } catch (error) {
      console.error('Error al eliminar la proforma:', error);
      Swal.fire('Error', 'No se pudo eliminar la proforma.', 'error');
    }
  };
  const fetchProformas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/proformas', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllProformas(response.data); // Guardar datos originales
      setProformas(response.data.slice(0, limit)); // Mostrar los primeros elementos
    } catch (error) {
      console.error('Error al cargar las proformas:', error);
      Swal.fire('Error', 'No se pudieron cargar las proformas.', 'error');
    }
  };
  useEffect(() => {
    fetchProformas();
  }, []);

  // Búsqueda dinámica
  const handleSearch = (query) => {
    setSearchText(query);
    const filteredProformas = allProformas.filter((proforma) =>
      proforma.nplaca.toLowerCase().includes(query.toLowerCase())
    );
    setProformas(filteredProformas.slice(0, limit));
    setCurrentPage(1); // Reiniciar a la primera página
  };

  // Cambiar el límite de elementos mostrados
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    const startIndex = (currentPage - 1) * newLimit;
    const endIndex = startIndex + newLimit;
    setProformas(allProformas.slice(startIndex, endIndex));
  };

  // Cambiar la página actual
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Calcular el índice inicial y final en función de la página actual y el límite
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
  
    // Actualizar el estado con el segmento de proformas correspondiente
    setProformas(allProformas.slice(startIndex, endIndex));
  };
  return (
    <>
      <Header user={user} handleLogout={handleLogout} toggleMenu={toggleMenu} />
  
      {/* Menú lateral */}
      <SideMenu
        user={user}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
      />
  
      <div className="home-container">
        {/* Botones superiores */}
        <div className="button-container">
          <button
            className="main-button"
            onClick={() => navigate('/proformas/nuevaproforma')}
          >
            Nueva Proforma
          </button>
          <button
            className="main-button"
            onClick={() => navigate('/proformas/pendientes')}
          >
            Ordenes Pendientes
          </button>
        </div>
  
        {/* Barra de búsqueda */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por placa"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              handleSearch(e.target.value); // Realizar la búsqueda
            }}
          />
        </div>
  
        {/* Tabla de proformas */}
        <div className="proformas-table-container">
          <h2>Lista de Proformas</h2>
  
          {/* Selector de límite */}
          <div className="limit-selector">
            <label htmlFor="limit">Mostrar:</label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                handleLimitChange(Number(e.target.value)); // Cambiar el límite
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
  
          {/* Tabla */}
          <table className="proformas-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Número</th>
                <th>Cliente</th>
                <th>Placa</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proformas.map((proforma) => (
                <tr key={proforma.idproforma}>
                  <td>{proforma.fecha}</td>
                  <td>{`${proforma.numerop}/${proforma.anio}`}</td>
                  <td>{proforma.cliente?.nombre || 'Sin cliente'}</td>
                  <td>{proforma.nplaca}</td>
                  <td>{proforma.total}</td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() =>
                        navigate(`/proformas/${proforma.idproforma}/${proforma.nplaca}`)
                      }
                    >
                      Editar
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteProforma(proforma.idproforma)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
  
          {/* Paginación */}
          <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={index + 1 === currentPage ? 'active' : ''}
            >
              {index + 1}
            </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
export default Proformas;