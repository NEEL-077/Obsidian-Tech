import API from './axiosConfig';

export const fetchProducts = async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add all filter parameters
    Object.keys(filters).forEach(key => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
            params.append(key, filters[key]);
        }
    });
    
    const { data } = await API.get(`/products?${params.toString()}`);
    return data;
};

export const fetchProductById = async (id) => {
    const { data } = await API.get(`/products/${id}`);
    return data;
};

export const createProductReview = async (productId, review) => {
    const { data } = await API.post(`/products/${productId}/reviews`, review);
    return data;
};

export const searchProducts = async (query) => {
    const { data } = await API.get(`/products?keyword=${encodeURIComponent(query)}`);
    return data;
};
