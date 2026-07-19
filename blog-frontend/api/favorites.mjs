import { publicAxios, axiosPrivate } from '@/utilities/axios';

// list of blogs the current user bookmarked
export const getFavorites = () => axiosPrivate.get('/favorites').then(r => r.data);
// add a blog to bookmarks
export const addFavorite = (blogId) => axiosPrivate.post(`/favorites/${blogId}`).then(r => r.data);
// remove a blog from bookmarks
export const removeFavorite = (blogId) => axiosPrivate.delete(`/favorites/${blogId}`).then(r => r.data);
// check if current user has this blog bookmarked
export const checkFavorite = (blogId) => axiosPrivate.get(`/favorites/check/${blogId}`).then(r => r.data);
// public count (no auth needed)
export const getFavoriteCount = (blogId) => publicAxios.get(`/favorites/count/${blogId}`).then(r => r.data);
