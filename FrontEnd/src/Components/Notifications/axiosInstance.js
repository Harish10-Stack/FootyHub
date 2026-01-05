import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000", // change if your backend uses different port
  withCredentials: true
});

export default axiosInstance;
