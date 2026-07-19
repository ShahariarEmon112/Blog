import { axiosPrivate } from '@/utilities/axios';

// messages the current user received
export const getInbox = () => axiosPrivate.get('/messages/inbox').then(r => r.data);
// messages the current user sent
export const getSent = () => axiosPrivate.get('/messages/sent').then(r => r.data);
// full thread for a single conversation (includes replies)
export const getConversation = (id) => axiosPrivate.get(`/messages/${id}`).then(r => r.data);
// start a new conversation
export const sendMessage = (data) => axiosPrivate.post('/messages', data).then(r => r.data);
// reply inside an existing thread
export const replyMessage = (id, data) => axiosPrivate.post(`/messages/${id}/reply`, data).then(r => r.data);
// mark single message as read
export const markMessageRead = (id) => axiosPrivate.patch(`/messages/${id}/read`).then(r => r.data);
// used by the bell/notification badge to show unread count
export const getMessageUnreadCount = () => axiosPrivate.get('/messages/unread-count').then(r => r.data);
// list of users you can message (friends first)
export const getMessageUsers = () => axiosPrivate.get('/message-users').then(r => r.data);
// admin only - reply to a contact form submission
export const replyContact = (id, body) => axiosPrivate.post(`/admin/contact/${id}/reply`, { body }).then(r => r.data);
