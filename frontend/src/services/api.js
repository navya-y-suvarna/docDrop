import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Request interceptor to automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("docdrop_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on protected route, clear token
      const isPublicShare = window.location.pathname.startsWith("/share/");
      if (!isPublicShare && localStorage.getItem("docdrop_token")) {
        localStorage.removeItem("docdrop_token");
        localStorage.removeItem("docdrop_user");
        window.location.href = "/login?session_expired=1";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
