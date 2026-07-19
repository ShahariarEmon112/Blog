import { axiosPrivate } from '@/utilities/axios';

// list of accepted friend connections
export const getFriends = () => axiosPrivate.get('/friends').then(r => r.data);
// people who sent you a request
export const getIncomingRequests = () => axiosPrivate.get('/friend-requests/incoming').then(r => r.data);
// requests you sent that are still pending
export const getOutgoingRequests = () => axiosPrivate.get('/friend-requests/outgoing').then(r => r.data);
// all active users (for "discover" page) with is_friend / has_pending_request flags
export const getAllUsers = () => axiosPrivate.get('/users/all').then(r => r.data);
// sends a pending friend request to someone
export const sendFriendRequest = (receiverId) => axiosPrivate.post('/friend-requests', { receiver_id: receiverId }).then(r => r.data);
// accept an incoming request
export const acceptFriendRequest = (id) => axiosPrivate.patch(`/friend-requests/${id}/accept`).then(r => r.data);
// reject an incoming request
export const rejectFriendRequest = (id) => axiosPrivate.patch(`/friend-requests/${id}/reject`).then(r => r.data);
// unfriend someone (deletes the accepted record)
export const removeFriend = (userId) => axiosPrivate.delete(`/friends/${userId}`).then(r => r.data);
