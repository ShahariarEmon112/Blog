import { publicAxios, axiosPrivate } from '@/utilities/axios';

// login accepts { login: email_or_id, password }
export const loginUser = (data) => publicAxios.post('/auth/login', data).then(r => r.data);

// new users go to pending status - no auto-login
export const registerUser = (data) => publicAxios.post('/auth/register', data).then(r => r.data);

// revokes the current sanctum token on the server
export const logoutUser = () => axiosPrivate.post('/auth/logout').then(r => r.data);
