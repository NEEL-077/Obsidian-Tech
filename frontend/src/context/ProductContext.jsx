import React, { createContext, useContext, useState } from 'react';
import { fetchProducts, fetchProductById } from '../api/productApi';

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [productDetails, setProductDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getProducts = async (filters = {}) => {
        try {
            setLoading(true);
            const data = await fetchProducts(filters);
            setProducts(data.products || []);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const getProductDetails = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchProductById(id);
            setProductDetails(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <ProductContext.Provider value={{ products, productDetails, loading, error, getProducts, getProductDetails }}>
            {children}
        </ProductContext.Provider>
    );
};
