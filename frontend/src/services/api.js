import axios from "axios";

const backendHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "localhost"
    : window.location.hostname;

const api = axios.create({
  baseURL: `http://${backendHost}:5000/api`,
});

export default api;