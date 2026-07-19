import { axiosPrivate } from '@/utilities/axios';

// toggles like on for a blog
export const addLike = (blogId) => axiosPrivate.post(`/blogs/${blogId}/like`).then(r => r.data);
// toggles like off for a blog
export const removeLike = (blogId) => axiosPrivate.delete(`/blogs/${blogId}/like`).then(r => r.data);
