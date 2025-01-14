import axios from "axios";

// Crear instancia de Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
});

// Función para verificar si el token ha expirado
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decodificar el payload del token
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    console.log("Token exp:", payload.exp, "Current time:", currentTime); // Debug
    return payload.exp && currentTime > payload.exp; // Verifica si ha expirado
  } catch (e) {
    console.error("Error verificando token:", e);
    return true; // Si ocurre un error, asume que está expirado
  }
};

// Interceptor para agregar el token a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      // Verificar si el token ha expirado
      if (isTokenExpired(token)) {
        console.warn("El token ha expirado. Redirigiendo al login...");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        throw new Error("Token expirado");
      }
      // Adjuntar el token al header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No se encontró token.");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa, la retorna
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token inválido o no autorizado
        console.warn("Token inválido o no autorizado. Redirigiendo al login...");
        localStorage.removeItem("authToken");
        alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        window.location.href = "/login"; // Redirigir al login
      } else if (error.response.status === 403) {
        console.warn("Acceso prohibido. Redirigiendo al login...");
        alert("No tienes permiso para acceder a este recurso.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;