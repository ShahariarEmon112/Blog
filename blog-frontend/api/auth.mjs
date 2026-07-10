import { publicAxios, axiosPrivate } from '@/utilities/axios';

export const loginUser = (data) => publicAxios.post('/auth/login', data).then(r => r.data);

export const registerUser = (data) => publicAxios.post('/auth/register', data).then(r => r.data);

export const logoutUser = () => axiosPrivate.post('/auth/logout').then(r => r.data);
