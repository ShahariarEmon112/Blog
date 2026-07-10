import { axiosPrivate } from '@/utilities/axios';

export const updateProfile = (formData) => axiosPrivate.patch('/users/me', formData).then(r => r.data);
