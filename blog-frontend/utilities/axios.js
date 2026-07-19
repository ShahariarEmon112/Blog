import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// no auth headers - for blogs, categories, site-settings, contact, etc
export const publicAxios = axios.create({ baseURL: BASE_URL });
// automatically injects the sanctum token from localStorage
export const axiosPrivate = axios.create({ baseURL: BASE_URL });

axiosPrivate.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem('token') || 'null');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// if the server rejects our token, log out immediately
// only 401 triggers auto-logout - 403 is handled per-component
axiosPrivate.interceptors.response.use(
  r => r,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default publicAxios;
