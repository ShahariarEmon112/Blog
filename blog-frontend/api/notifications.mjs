import { axiosPrivate } from '@/utilities/axios';

// latest 50, with action_by + blog + friend_request relations loaded
export const getNotifications = () => axiosPrivate.get('/notifications').then(r => r.data);
// used by the bell icon badge
export const getUnreadCount = () => axiosPrivate.get('/notifications/unread-count').then(r => r.data);
// mark single notification as read
export const markRead = (id) => axiosPrivate.patch(`/notifications/${id}/read`).then(r => r.data);
// mark everything as read in one go
export const markAllRead = () => axiosPrivate.patch('/notifications/mark-all-read').then(r => r.data);
// remove a single notification
export const deleteNotification = (id) => axiosPrivate.delete(`/notifications/${id}`).then(r => r.data);
