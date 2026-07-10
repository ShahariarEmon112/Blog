import { publicAxios, axiosPrivate } from '@/utilities/axios';

export const getFavorites = () => axiosPrivate.get('/favorites').then(r => r.data);

export const addFavorite = (blogId) => axiosPrivate.post(`/favorites/${blogId}`).then(r => r.data);

export const removeFavorite = (blogId) => axiosPrivate.delete(`/favorites/${blogId}`).then(r => r.data);

export const checkFavorite = (blogId) => axiosPrivate.get(`/favorites/check/${blogId}`).then(r => r.data);

export const getFavoriteCount = (blogId) => publicAxios.get(`/favorites/count/${blogId}`).then(r => r.data);
