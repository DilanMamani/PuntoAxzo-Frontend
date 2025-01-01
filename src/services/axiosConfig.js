import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000', // Cambia según el entorno
});

// Agregar token de autorización automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // O donde estés almacenando el token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
