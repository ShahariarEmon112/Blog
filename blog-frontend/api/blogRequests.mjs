import { publicAxios, axiosPrivate } from '@/utilities/axios';

export const getMyRequests = () => axiosPrivate.get('/blog-requests/mine').then(r => r.data);

export const createRequest = (formData) => axiosPrivate.post('/blog-requests', formData).then(r => r.data);
