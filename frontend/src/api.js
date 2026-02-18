import axios from 'axios';

// Production detection: use hostname check for reliability
const isProduction = typeof window !== 'undefined'
  ? !window.location.hostname.includes('localhost')
  : import.meta.env.MODE === 'production';

const baseURL = isProduction
  ? 'https://backend.teskilat.com.tr/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
