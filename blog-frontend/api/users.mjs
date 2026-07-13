import { axiosPrivate } from '@/utilities/axios';

export const updateProfile = (formData) => axiosPrivate.post('/users/me', formData).then(r => r.data);
