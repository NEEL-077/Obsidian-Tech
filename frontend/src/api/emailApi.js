import api from './axiosConfig';

// Newsletter
export const subscribeNewsletter = (data) => api.post('/email/subscribe', data);
export const unsubscribeNewsletter = (email) => api.get(`/email/unsubscribe/${email}`);

// Subscribers (Admin)
export const getSubscribers = (params) => api.get('/email/subscribers', { params });

// Campaigns (Admin)
export const getCampaigns = (params) => api.get('/email/campaigns', { params });
export const createCampaign = (data) => api.post('/email/campaigns', data);
export const sendCampaign = (id) => api.post(`/email/campaigns/${id}/send`);
export const getCampaignAnalytics = (id) => api.get(`/email/campaigns/${id}/analytics`);

// Segments (Admin)
export const getSegments = () => api.get('/email/segments');
export const createSegment = (data) => api.post('/email/segments', data);
export const getSegmentUsers = (id) => api.get(`/email/segments/${id}/users`);

// Recommendations (Admin)
export const sendRecommendationEmail = (userId) => api.post(`/email/recommendations/${userId}/send`);

// Analytics (Admin)
export const getEmailAnalytics = (params) => api.get('/email/analytics', { params });
