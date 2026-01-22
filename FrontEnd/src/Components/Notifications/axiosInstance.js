import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://footyhub-backend-cqir.onrender.com", // change if your backend uses different port
  withCredentials: true
});

export default axiosInstance;
