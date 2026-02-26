import axios from 'axios';
import { logout } from '../store/slices/authSlice';

let store;
export const injectStore = (_store) => {
  store = _store;
};

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request Interceptor - Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Invalid/expired token - logout user
      console.log('🚨 Invalid token detected - logging out');
      localStorage.removeItem('token');
      
      if (store) {
        store.dispatch(logout());
      }
      
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;