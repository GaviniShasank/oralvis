import axios from "axios";

export const api = axios.create({
  baseURL: "https://oralvis-g0qh.onrender.com", 
  withCredentials: true,
});
export default api;