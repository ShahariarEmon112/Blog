import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const publicAxios = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });
export const axiosPrivate = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

axiosPrivate.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('token') || 'null');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosPrivate.interceptors.response.use(
  r => r,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default publicAxios;
