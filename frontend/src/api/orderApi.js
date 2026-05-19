import API from './axiosConfig';

export const createOrder = async (orderData) => {
    const { data } = await API.post('/orders', orderData);
    return data;
};

export const getOrderById = async (id) => {
    const { data } = await API.get(`/orders/${id}`);
    return data;
};

export const payOrder = async (orderId, paymentResult) => {
    const { data } = await API.put(`/orders/${orderId}/pay`, paymentResult);
    return data;
};

export const getMyOrders = async () => {
    const { data } = await API.get('/orders/myorders');
    return data;
};
