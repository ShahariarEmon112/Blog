import { publicAxios } from '@/utilities/axios';

export const getCategories = () => publicAxios.get('/categories').then(r => r.data);
