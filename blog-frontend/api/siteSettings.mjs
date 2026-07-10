import { publicAxios } from '@/utilities/axios';

export const getSiteSettings = () => publicAxios.get('/admin/site-settings').then(r => r.data);
