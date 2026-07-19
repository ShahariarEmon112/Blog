import { publicAxios, axiosPrivate } from '@/utilities/axios';

// list of blog requests the current user submitted
export const getMyRequests = () => axiosPrivate.get('/blog-requests/mine').then(r => r.data);
// submit a new blog idea for admin approval (multipart for image)
export const createRequest = (formData) => axiosPrivate.post('/blog-requests', formData).then(r => r.data);
