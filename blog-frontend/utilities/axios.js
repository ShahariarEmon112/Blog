import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const publicAxios = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });
export const axiosPrivate = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

axiosPrivate.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = JSON.parse(localStorage.getItem('token') || 'null');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleError = (error) => {
  if (typeof window === 'undefined') return Promise.reject(error);
  const status = error?.response?.status;
  const message = error?.response?.data?.message;
  const onLogin = typeof window !== 'undefined' && window.location.pathname === '/login';
  if (status === 401 || (status === 403 && !onLogin)) {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    toast.error(message || 'Session expired');
    if (typeof window !== 'undefined') window.location.href = '/login';
  } else if (status >= 500) toast.error(message || 'Server error');
  else if (status >= 400) toast.error(message || 'Something went wrong');
  return Promise.reject(error);
};

publicAxios.interceptors.response.use(r => r, handleError);
axiosPrivate.interceptors.response.use(r => r, handleError);

export default publicAxios;
