import { publicAxios } from '@/utilities/axios';

// used in sidebar filter, blog form dropdown, and category pages
export const getCategories = () => publicAxios.get('/categories').then(r => r.data);
