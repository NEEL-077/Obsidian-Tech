import API from './axiosConfig';

export const getDashboardStats = async () => {
    const { data } = await API.get('/admin/stats');
    return data;
};
