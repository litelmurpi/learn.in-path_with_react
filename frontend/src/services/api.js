import axios from "axios";
import { cacheManager } from "../utils/cacheManager";

const API_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.DEV) {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(
        `API ${response.config.method.toUpperCase()} ${
          response.config.url
        }: ${duration}ms`
      );
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      cacheManager.clear(); // Clear cache on logout

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Cached GET request wrapper
api.cachedGet = async (url, options = {}) => {
  const cacheKey = `GET:${url}:${JSON.stringify(options)}`;
  const ttl = options.cacheTTL || 5 * 60 * 1000; // 5 minutes default

  // Check cache first
  if (!options.forceRefresh && cacheManager.has(cacheKey)) {
    return { data: cacheManager.get(cacheKey), fromCache: true };
  }

  try {
    const response = await api.get(url, options);
    cacheManager.set(cacheKey, response.data, ttl);
    return response;
  } catch (error) {
    // If offline, try to return cached data even if expired
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData && !navigator.onLine) {
      return { data: cachedData, fromCache: true, offline: true };
    }
    throw error;
  }
};

export default api;
