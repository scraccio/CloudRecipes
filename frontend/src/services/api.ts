import axios from "axios";
import { getStoredToken, clearStoredToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const requiresAuth = config.requiresAuth === true
  const token = getStoredToken()

  if (requiresAuth && token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requiresAuth = error.config?.requiresAuth === true
    if (error.response?.status === 401 && requiresAuth) {
      clearStoredToken()

      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)

export default api;
