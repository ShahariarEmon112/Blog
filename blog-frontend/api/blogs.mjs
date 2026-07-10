import { publicAxios } from '@/utilities/axios';

export const getBlogs = (params) => publicAxios.get('/blogs', { params }).then(r => r.data);

export const getBlog = (id) => publicAxios.get(`/blogs/${id}`).then(r => r.data);

export const getFeaturedBlogs = () => publicAxios.get('/blogs/featured').then(r => r.data);

export const getPopularBlogs = () => publicAxios.get('/blogs/popular').then(r => r.data);
