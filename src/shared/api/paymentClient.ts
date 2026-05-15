import axios from 'axios';
import { useAuthStore } from '@store/authStore';

// Dedicated client for the Payment Service (runs on port 8088)
const paymentClient = axios.create({
  baseURL: 'http://localhost:8083',
  headers: {
    'Content-Type': 'application/json',
  },
});

paymentClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

paymentClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[PaymentClient] Session expired. Logging out...');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    console.error('[PaymentClient] API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default paymentClient;
