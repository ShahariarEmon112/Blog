import { axiosPrivate } from '@/utilities/axios';

// all users with search/status filters
export const getAdminUsers = (params) => axiosPrivate.get('/admin/users', { params }).then(r => r.data);
// users waiting for admin approval
export const getPendingUsers = () => axiosPrivate.get('/admin/users/pending').then(r => r.data);
// activates a pending user
export const approveUser = (id) => axiosPrivate.post(`/admin/users/${id}/approve`).then(r => r.data);
// sets user status to banned
export const banUser = (id) => axiosPrivate.patch(`/admin/users/${id}/ban`).then(r => r.data);
// hard delete a user
export const deleteUser = (id) => axiosPrivate.delete(`/admin/users/${id}`).then(r => r.data);
// admin blog listing with search
export const getAdminBlogs = (params) => axiosPrivate.get('/admin/blogs', { params }).then(r => r.data);
