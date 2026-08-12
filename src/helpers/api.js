import axios from "axios";

const baseURL = `${(import.meta.env.VITE_API_URL || "").replace(/\/+$/, "")}/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes("/login");
    if (error.response?.status === 401 && !esLogin) {
      clearToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const clearToken = () => {
  localStorage.removeItem("token");
};

export default api;
