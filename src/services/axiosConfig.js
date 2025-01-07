import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
});

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    return payload.exp && currentTime > payload.exp; // Verifica si ha expirado
  } catch (e) {
    console.error("Error verificando token:", e);
    return true; // Si ocurre un error, asume que está expirado
  }
};

// Agregar token de autorización automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        throw new Error("Token expirado");
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;