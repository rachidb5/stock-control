import axios from 'axios';

const api = axios.create({
   baseURL: import.meta.env.VITE_API_URL || 'https://estoque-api.fly.dev',
  //  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    const isAuthRoute =
      url?.includes("/auth/login") || url?.includes("/auth/register");

    if (status === 401 && !isAuthRoute) {
      localStorage.removeItem("accessToken");
      window.location.href = "/auth";
    }

    return Promise.reject(error);
  }
);


export default api;
