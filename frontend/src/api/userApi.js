import API from './axiosConfig';

export const loginCall = async (email, password) => {
    const { data } = await API.post('/users/login', { email, password });
    return data;
};

export const registerCall = async (name, email, password) => {
    const { data } = await API.post('/users', { name, email, password });
    return data;
};

export const getUserProfile = async () => {
    const { data } = await API.get('/users/profile');
    return data;
};

export const updateUserProfile = async (userData) => {
    const { data } = await API.put('/users/profile', userData);
    return data;
};

// Address Management
export const addUserAddress = async (addressData) => {
    const { data } = await API.post('/users/addresses', addressData);
    return data;
};

export const updateUserAddress = async (addressId, addressData) => {
    const { data } = await API.put(`/users/addresses/${addressId}`, addressData);
    return data;
};

export const deleteUserAddress = async (addressId) => {
    const { data } = await API.delete(`/users/addresses/${addressId}`);
    return data;
};

// Wishlist Management
export const getUserWishlist = async () => {
    const { data } = await API.get('/users/wishlist');
    return data;
};

export const addToWishlist = async (productId) => {
    const { data } = await API.post(`/users/wishlist/${productId}`);
    return data;
};

export const removeFromWishlist = async (productId) => {
    const { data } = await API.delete(`/users/wishlist/${productId}`);
    return data;
};

// Recently Viewed
export const getRecentlyViewed = async () => {
    const { data } = await API.get('/users/recently-viewed');
    return data;
};

export const addRecentlyViewed = async (productId) => {
    const { data } = await API.post(`/users/recently-viewed/${productId}`);
    return data;
};

// Two-Factor Authentication
export const setup2FA = async (type) => {
    const { data } = await API.post('/users/2fa/setup', { type });
    return data;
};

export const verifyAndEnable2FA = async (code) => {
    const { data } = await API.post('/users/2fa/verify', { code });
    return data;
};

export const disable2FA = async () => {
    const { data } = await API.post('/users/2fa/disable');
    return data;
};

export const login2FA = async (userId, code) => {
    const { data } = await API.post('/users/login/2fa', { userId, code });
    return data;
};
