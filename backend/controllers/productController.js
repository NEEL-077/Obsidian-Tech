const supabase = require('../config/supabase');

// @desc    Fetch all products with advanced filtering
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const {
            keyword = '',
            brand = '',
            category = '',
            sortBy = 'name',
            sortOrder = 'asc',
            pageNumber = 1,
            pageSize = 12,
            // BUG #9 FIX: Accept minPrice and maxPrice from query and apply them to the query
            minPrice,
            maxPrice,
        } = req.query;

        let query = supabase.from('products').select('*', { count: 'exact' });

        if (keyword) {
            query = query.ilike('name', `%${keyword}%`);
        }
        if (brand) {
            query = query.ilike('brand', `%${brand}%`);
        }
        if (category) {
            query = query.ilike('category', `%${category}%`);
        }

        // BUG #9 FIX: Apply price range filters
        if (minPrice !== undefined && minPrice !== '') {
            query = query.gte('price', Number(minPrice));
        }
        if (maxPrice !== undefined && maxPrice !== '') {
            query = query.lte('price', Number(maxPrice));
        }

        // Sorting
        const ascending = sortOrder === 'asc';
        if (sortBy === 'price') query = query.order('price', { ascending });
        else if (sortBy === 'rating') query = query.order('rating', { ascending });
        else query = query.order('name', { ascending });

        // Pagination
        const page = Number(pageNumber);
        const limit = Number(pageSize);
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: products, count, error } = await query;
        if (error) throw error;

        // Fetch distinct values for filters (naive approach for now)
        const { data: allProducts } = await supabase.from('products').select('brand, category, price');

        let brands = [];
        let categories = [];
        let minPriceVal = 0;
        let maxPriceVal = 9999;

        if (allProducts) {
            brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
            categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();
            const prices = allProducts.map(p => p.price);
            if (prices.length > 0) {
                minPriceVal = Math.min(...prices);
                maxPriceVal = Math.max(...prices);
            }
        }

        // Map id to _id for frontend compatibility, and snake_case to camelCase
        const mappedProducts = products ? products.map(p => ({
            ...p,
            _id: p.id,
            image: p.image_url,
            countInStock: p.count_in_stock,
            numReviews: p.num_reviews
        })) : [];

        res.json({
            products: mappedProducts,
            page,
            pages: Math.ceil((count || 0) / limit) || 1,
            total: count || 0,
            filters: {
                brands,
                categories,
                subcategories: [],
                priceRange: { min: minPriceVal, max: maxPriceVal }
            }
        });
    } catch (error) {
        console.error('Supabase getProducts Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        if (product) {
            // Frontend expects _id and camelCase
            res.json({
                ...product,
                _id: product.id,
                image: product.image_url,
                countInStock: product.count_in_stock,
                numReviews: product.num_reviews
            });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
// NOTE: Requires a 'reviews' table in Supabase. Not yet implemented.
const createProductReview = async (req, res) => {
    res.status(501).json({ message: 'Product reviews require a reviews table in Supabase. Not yet implemented.' });
};

// @desc    Vote on review helpfulness
// @route   POST /api/products/:id/reviews/:reviewId/vote
// @access  Private
// NOTE: Requires a 'reviews' table in Supabase. Not yet implemented.
const voteOnReview = async (req, res) => {
    res.status(501).json({ message: 'Review voting requires a reviews table in Supabase. Not yet implemented.' });
};

// @desc    Get product reviews with filtering and sorting
// @route   GET /api/products/:id/reviews
// @access  Public
// NOTE: Requires a 'reviews' table in Supabase. Not yet implemented.
const getProductReviews = async (req, res) => {
    res.status(501).json({ message: 'Product reviews require a reviews table in Supabase. Not yet implemented.' });
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { 
            name, brand, price, description, category, image, countInStock, inStock,
            originalPrice, series, discountPeriod, baseStorage, ram
        } = req.body;

        const { data, error } = await supabase
            .from('products')
            .insert([{
                name: name || 'Sample name',
                price: price || 0,
                original_price: originalPrice || null,
                image_url: image || '/images/sample.jpg',
                brand: brand || 'Sample brand',
                category: category || 'Sample category',
                series: series || null,
                discount_period: discountPeriod || null,
                base_storage: baseStorage || null,
                ram: ram || null,
                count_in_stock: countInStock || 0,
                description: description || 'Sample description',
                rating: 0,
                num_reviews: 0
            }])
            .select();

        if (error) throw error;
        const createdProduct = data[0];
        res.status(201).json({ ...createdProduct, _id: createdProduct.id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { 
            name, price, description, image, brand, category, countInStock,
            originalPrice, series, discountPeriod, baseStorage, ram
        } = req.body;
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = price;
        if (originalPrice !== undefined) updateData.original_price = originalPrice;
        if (description !== undefined) updateData.description = description;
        if (image !== undefined) updateData.image_url = image;
        if (brand !== undefined) updateData.brand = brand;
        if (category !== undefined) updateData.category = category;
        if (series !== undefined) updateData.series = series;
        if (discountPeriod !== undefined) updateData.discount_period = discountPeriod;
        if (baseStorage !== undefined) updateData.base_storage = baseStorage;
        if (ram !== undefined) updateData.ram = ram;
        if (countInStock !== undefined) updateData.count_in_stock = countInStock;

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ message: 'Product not found' });

        const updatedProduct = data[0];
        res.json({ ...updatedProduct, _id: updatedProduct.id });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Product removed' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Update product inventory
// @route   PUT /api/products/:id/inventory
// @access  Private/Admin
const updateProductInventory = async (req, res) => {
    try {
        const { countInStock, lowStockThreshold = 5 } = req.body;
        const newCount = Number(countInStock);

        const { data, error } = await supabase
            .from('products')
            .update({ count_in_stock: newCount })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            ...data,
            _id: data.id,
            countInStock: data.count_in_stock,
            lowStock: data.count_in_stock <= Number(lowStockThreshold) && data.count_in_stock > 0,
            outOfStock: data.count_in_stock === 0,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin
const getLowStockProducts = async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .lte('count_in_stock', 5);

        if (error) throw error;

        res.json((products || []).map(p => ({
            ...p,
            _id: p.id,
            countInStock: p.count_in_stock,
            image: p.image_url,
        })));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get inventory report
// @route   GET /api/products/inventory-report
// @access  Private/Admin
const getInventoryReport = async (req, res) => {
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*');

        if (error) throw error;

        const report = {
            totalProducts: products.length,
            inStock: products.filter(p => p.count_in_stock > 5).length,
            lowStock: products.filter(p => p.count_in_stock <= 5 && p.count_in_stock > 0).length,
            outOfStock: products.filter(p => p.count_in_stock === 0).length,
            totalInventoryValue: products.reduce((sum, p) => sum + (p.price * p.count_in_stock), 0),
            lowStockProducts: products.filter(p => p.count_in_stock <= 5).map(p => ({
                ...p,
                _id: p.id,
                countInStock: p.count_in_stock,
            })),
            categories: {}
        };

        products.forEach(product => {
            if (!report.categories[product.category]) {
                report.categories[product.category] = { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, value: 0 };
            }
            const cat = report.categories[product.category];
            cat.total++;
            cat.value += product.price * product.count_in_stock;

            if (product.count_in_stock === 0) cat.outOfStock++;
            else if (product.count_in_stock <= 5) cat.lowStock++;
            else cat.inStock++;
        });

        res.json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductInventory,
    getLowStockProducts,
    getInventoryReport,
    createProductReview,
    voteOnReview,
    getProductReviews
};
