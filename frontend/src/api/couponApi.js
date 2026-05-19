import API from './axiosConfig';

// Validate coupon
export const validateCoupon = async (couponData) => {
    const { data } = await API.post('/coupons/validate', couponData);
    return data;
};

// Apply coupon to order
export const applyCoupon = async (couponData) => {
    const { data } = await API.post('/coupons/apply', couponData);
    return data;
};

// Admin: Get all coupons
export const getCoupons = async () => {
    const { data } = await API.get('/coupons');
    return data;
};

// Admin: Create coupon
export const createCoupon = async (couponData) => {
    const { data } = await API.post('/coupons', couponData);
    return data;
};

// Admin: Update coupon
export const updateCoupon = async (id, couponData) => {
    const { data } = await API.put(`/coupons/${id}`, couponData);
    return data;
};

// Admin: Delete coupon
export const deleteCoupon = async (id) => {
    const { data } = await API.delete(`/coupons/${id}`);
    return data;
};