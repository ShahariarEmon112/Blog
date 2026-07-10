import { axiosPrivate } from '@/utilities/axios';

export const addLike = (blogId) => axiosPrivate.post(`/blogs/${blogId}/like`).then(r => r.data);

export const removeLike = (blogId) => axiosPrivate.delete(`/blogs/${blogId}/like`).then(r => r.data);
