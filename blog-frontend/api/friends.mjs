import { axiosPrivate } from '@/utilities/axios';

export const getFriends = () => axiosPrivate.get('/friends').then(r => r.data);

export const getIncomingRequests = () => axiosPrivate.get('/friend-requests/incoming').then(r => r.data);

export const getOutgoingRequests = () => axiosPrivate.get('/friend-requests/outgoing').then(r => r.data);

export const getAllUsers = () => axiosPrivate.get('/users/all').then(r => r.data);

export const sendFriendRequest = (receiverId) => axiosPrivate.post('/friend-requests', { receiver_id: receiverId }).then(r => r.data);

export const acceptFriendRequest = (id) => axiosPrivate.patch(`/friend-requests/${id}/accept`).then(r => r.data);

export const rejectFriendRequest = (id) => axiosPrivate.patch(`/friend-requests/${id}/reject`).then(r => r.data);

export const removeFriend = (userId) => axiosPrivate.delete(`/friends/${userId}`).then(r => r.data);
