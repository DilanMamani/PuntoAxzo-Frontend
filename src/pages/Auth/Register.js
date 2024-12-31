import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axiosConfig';
import './Register.css';
import Header from '../../components/Header';
import SideMenu from '../../components/SideMenu';
import Swal from 'sweetalert2';
import '../../styles/SideMenu.css';
import '../../styles/Header.css';

const Register = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const [formData, setFormData] = useState({
    ci: '',
    nombre: '',
    mail: '',
    telefono: '',
    password: '',
    isMaster: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ci || !formData.nombre || !formData.mail || !formData.telefono || !formData.password) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    try {
      const response = await api.post('/auth/register', formData);
      setSuccess('Usuario registrado exitosamente.');
      setError('');
      setFormData({
        ci: '',
        nombre: '',
        mail: '',
        telefono: '',
        password: '',
        isMaster: false,
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error.');
      setSuccess('');
    }
  };

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
    <div className="register-page">
      <div className="register-card">
        <h2 className="register-title">Registrar Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>CI:</label>
            <input
              type="text"
              name="ci"
              value={formData.ci}
              onChange={handleChange}
              placeholder="Ingresa el CI"
              required
            />
          </div>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa el nombre"
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              placeholder="Ingresa el email"
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono:</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ingresa el teléfono"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa la contraseña"
              required
            />
          </div>
                <div className="form-group">
        <label className="toggle-label">
            Es Master:
            <div className="toggle-switch">
            <input
                type="checkbox"
                name="isMaster"
                checked={formData.isMaster}
                onChange={handleChange}
                className="toggle-input"
            />
            <span className="toggle-slider"></span>
            </div>
        </label>
        </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          <button type="submit" className="btn-primary">Registrar</button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Register;