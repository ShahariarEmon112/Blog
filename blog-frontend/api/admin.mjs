import { axiosPrivate } from '@/utilities/axios';

export const getAdminUsers = (params) => axiosPrivate.get('/admin/users', { params }).then(r => r.data);

export const getPendingUsers = () => axiosPrivate.get('/admin/users/pending').then(r => r.data);

export const approveUser = (id) => axiosPrivate.post(`/admin/users/${id}/approve`).then(r => r.data);

export const banUser = (id) => axiosPrivate.patch(`/admin/users/${id}/ban`).then(r => r.data);

export const deleteUser = (id) => axiosPrivate.delete(`/admin/users/${id}`).then(r => r.data);

export const getAdminBlogs = (params) => axiosPrivate.get('/admin/blogs', { params }).then(r => r.data);
