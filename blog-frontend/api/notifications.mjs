import { axiosPrivate } from '@/utilities/axios';

export const getNotifications = () => axiosPrivate.get('/notifications').then(r => r.data);

export const getUnreadCount = () => axiosPrivate.get('/notifications/unread-count').then(r => r.data);

export const markRead = (id) => axiosPrivate.patch(`/notifications/${id}/read`).then(r => r.data);

export const markAllRead = () => axiosPrivate.patch('/notifications/mark-all-read').then(r => r.data);

export const deleteNotification = (id) => axiosPrivate.delete(`/notifications/${id}`).then(r => r.data);
