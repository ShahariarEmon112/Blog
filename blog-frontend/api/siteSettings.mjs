import { publicAxios, axiosPrivate } from '@/utilities/axios';

export const getSiteSettings = () => publicAxios.get('/site-settings').then(r => r.data);

export const updateSiteSettings = (data) => axiosPrivate.put('/admin/site-settings', data).then(r => r.data);
