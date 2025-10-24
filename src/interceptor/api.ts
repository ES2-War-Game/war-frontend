import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  config => {
    // Get the token from the store
    const token = useAuthStore.getState().token;
    
    // Only add authorization header if token exists AND it's not an auth endpoint
    const isAuthEndpoint = config.url?.includes('/api/v1/players/login') || 
                          config.url?.includes('/api/v1/players/register');
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle unauthorized errors (expired token)
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized access - token may be expired');
      // Clear the token if it's expired
      const { clearToken } = useAuthStore.getState();
      clearToken();
      
      // Redirect to login if not already on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;