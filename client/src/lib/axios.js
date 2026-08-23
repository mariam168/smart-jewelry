
import axios from "axios";

const api = axios.create({
  
  baseURL: "http://localhost:5000/api" || "https://jevorya.com/api",
  withCredentials: true,
});

export default api;

