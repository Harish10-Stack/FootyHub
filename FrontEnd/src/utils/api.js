import axios from "axios";

const api = axios.create({
  baseURL: "https://footyhub-backend-hrqm.onrender.com",
  withCredentials: true, // ✅ REQUIRED for cookies
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("footyhubToken");
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


