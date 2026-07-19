import { publicAxios, axiosPrivate } from '@/utilities/axios';

// hero text, about page, contact page, social links, footer
export const getSiteSettings = () => publicAxios.get('/site-settings').then(r => r.data);
// admin only - updates any of the site settings
export const updateSiteSettings = (data) => axiosPrivate.put('/admin/site-settings', data).then(r => r.data);
