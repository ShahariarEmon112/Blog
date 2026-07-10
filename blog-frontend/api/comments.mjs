import { axiosPrivate } from '@/utilities/axios';

export const addComment = (blogId, data) => axiosPrivate.post(`/blogs/${blogId}/comments`, data).then(r => r.data);

export const updateComment = (commentId, data) => axiosPrivate.patch(`/comments/${commentId}`, data).then(r => r.data);

export const deleteComment = (commentId) => axiosPrivate.delete(`/comments/${commentId}`).then(r => r.data);

export const reportComment = (data) => axiosPrivate.post('/comment-reports', data).then(r => r.data);
