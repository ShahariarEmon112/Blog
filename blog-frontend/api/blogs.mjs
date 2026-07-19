import { publicAxios } from '@/utilities/axios';

// paginated listing - params can have per_page, sort, order, search, category
export const getBlogs = (params) => publicAxios.get('/blogs', { params }).then(r => r.data);

// single blog with comments and author loaded
export const getBlog = (id) => publicAxios.get(`/blogs/${id}`).then(r => r.data);

// used on homepage hero section
export const getFeaturedBlogs = () => publicAxios.get('/blogs/featured').then(r => r.data);

// sorted by favorite count, shown in sidebar
export const getPopularBlogs = () => publicAxios.get('/blogs/popular').then(r => r.data);
