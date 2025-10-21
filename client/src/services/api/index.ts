import { API_URL } from '@/config';
import Storage from '@/utils/storage';
import axios from 'axios';

const baseURL = `${API_URL}`;

const apiHandler = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  },
});

apiHandler.interceptors.request.use((config) => {
  const token = Storage.getCookie('authSession');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiHandler;
