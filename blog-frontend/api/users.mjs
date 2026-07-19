import { axiosPrivate } from '@/utilities/axios';

// uses POST not PATCH because PHP doesn't populate $_FILES on PATCH
export const updateProfile = (formData) => axiosPrivate.post('/users/me', formData).then(r => r.data);
