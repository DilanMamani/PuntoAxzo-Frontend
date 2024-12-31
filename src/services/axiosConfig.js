import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.20.10.2:3000', // Cambia si la baseURL es diferente
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
