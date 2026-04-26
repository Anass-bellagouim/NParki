import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nparki_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getApiError = (error) => {
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join(' ');
  }

  return error.response?.data?.message || error.message || 'Something went wrong.';
};

export default api;
