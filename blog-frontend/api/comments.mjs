import { axiosPrivate } from '@/utilities/axios';

// post a new comment (or reply if parent_id is set)
export const addComment = (blogId, data) => axiosPrivate.post(`/blogs/${blogId}/comments`, data).then(r => r.data);
// edit your own comment text
export const updateComment = (commentId, data) => axiosPrivate.patch(`/comments/${commentId}`, data).then(r => r.data);
// delete your own comment
export const deleteComment = (commentId) => axiosPrivate.delete(`/comments/${commentId}`).then(r => r.data);
// report a comment as spam/harassment/etc
export const reportComment = (data) => axiosPrivate.post('/comment-reports', data).then(r => r.data);
