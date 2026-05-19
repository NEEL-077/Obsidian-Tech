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
            pageSize = 12
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
        let minPrice = 0;
        let maxPrice = 9999;

        if (allProducts) {
            brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();
            categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))].sort();
            const prices = allProducts.map(p => p.price);
            if (prices.length > 0) {
                minPrice = Math.min(...prices);
                maxPrice = Math.max(...prices);
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
                priceRange: { min: minPrice, max: maxPrice }
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
    } catch(err) {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    try {
        const { rating, comment, images } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ message: 'Product not found' });

        const alreadyReviewed = product.reviews.find(r => String(r.user) === String(req.user._id));
        if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            images: images || [],
            user: req.user._id,
            verified: false,
            status: 'pending'
        };

        const userOrders = await Order.find({ user: req.user._id, isPaid: true });
        const hasPurchased = userOrders.some(order => 
            order.orderItems.some(item => String(item.product) === String(req.params.id))
        );
        
        if (hasPurchased) {
            review.verified = true;
            review.status = 'approved';
        }

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, r) => r.rating + acc, 0) / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added successfully', review });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Vote on review helpfulness
// @route   POST /api/products/:id/reviews/:reviewId/vote
// @access  Private
const voteOnReview = async (req, res) => {
    try {
        const { helpful } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        const review = product.reviews.id(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        
        const existingVoteIndex = review.helpfulVotes.findIndex(vote => String(vote.user) === String(req.user._id));
        
        if (existingVoteIndex !== -1) {
            const oldVote = review.helpfulVotes[existingVoteIndex];
            if (oldVote.helpful) review.helpful--;
            else review.notHelpful--;
            
            review.helpfulVotes[existingVoteIndex] = {
                user: req.user._id,
                helpful: helpful,
                votedAt: new Date()
            };
        } else {
            review.helpfulVotes.push({
                user: req.user._id,
                helpful: helpful,
                votedAt: new Date()
            });
        }
        
        if (helpful) review.helpful++;
        else review.notHelpful++;
        
        await product.save();
        res.json({ message: 'Vote recorded successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get product reviews with filtering and sorting
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const { rating, sortBy = 'newest', page = 1, limit = 10 } = req.query;
        const product = await Product.findById(req.params.id);
        
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        let reviews = product.reviews.filter(review => review.status === 'approved');
        
        if (rating) {
            reviews = reviews.filter(review => review.rating === Number(rating));
        }
        
        switch (sortBy) {
            case 'helpful': reviews.sort((a, b) => b.helpful - a.helpful); break;
            case 'rating-high': reviews.sort((a, b) => b.rating - a.rating); break;
            case 'rating-low': reviews.sort((a, b) => a.rating - b.rating); break;
            case 'oldest': reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
            case 'newest':
            default: reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + Number(limit);
        const paginatedReviews = reviews.slice(startIndex, endIndex);
        
        const ratingDistribution = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length
        };
        
        res.json({
            reviews: paginatedReviews,
            totalReviews: reviews.length,
            currentPage: Number(page),
            totalPages: Math.ceil(reviews.length / limit),
            ratingDistribution,
            averageRating: product.rating
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, brand, price, description, category, image, countInStock, inStock } = req.body;
        
        const { data, error } = await supabase
            .from('products')
            .insert([{
                name: name || 'Sample name',
                price: price || 0,
                image_url: image || '/images/sample.jpg',
                brand: brand || 'Sample brand',
                category: category || 'Sample category',
                count_in_stock: countInStock || 0,
                description: description || 'Sample description',
                rating: 0,
                num_reviews: 0
            }])
            .select();

        if (error) throw error;
        const createdProduct = data[0];
        res.status(201).json({ ...createdProduct, _id: createdProduct.id });
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, image, brand, category, countInStock } = req.body;
        const updateData = {};
        
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = price;
        if (description !== undefined) updateData.description = description;
        if (image !== undefined) updateData.image_url = image;
        if (brand !== undefined) updateData.brand = brand;
        if (category !== undefined) updateData.category = category;
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
    } catch(err) {
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
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Update product inventory
// @route   PUT /api/products/:id/inventory
// @access  Private/Admin
const updateProductInventory = async (req, res) => {
    try {
        const { countInStock, lowStockThreshold = 5 } = req.body;
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.countInStock = Number(countInStock);
        product.lowStockThreshold = Number(lowStockThreshold);
        product.lowStock = product.countInStock <= product.lowStockThreshold && product.countInStock > 0;
        product.outOfStock = product.countInStock === 0;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin
const getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            $or: [
                { lowStock: true },
                { outOfStock: true },
                { countInStock: { $lte: 5 } }
            ]
        });
        res.json(products);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get inventory report
// @route   GET /api/products/inventory-report
// @access  Private/Admin
const getInventoryReport = async (req, res) => {
    try {
        const products = await Product.find({});
        
        const report = {
            totalProducts: products.length,
            inStock: products.filter(p => p.countInStock > 5).length,
            lowStock: products.filter(p => (p.lowStock || p.countInStock <= 5) && p.countInStock > 0).length,
            outOfStock: products.filter(p => p.countInStock === 0).length,
            totalInventoryValue: products.reduce((sum, p) => sum + (p.price * p.countInStock), 0),
            lowStockProducts: products.filter(p => p.lowStock || p.countInStock <= 5),
            categories: {}
        };

        products.forEach(product => {
            if (!report.categories[product.category]) {
                report.categories[product.category] = { total: 0, inStock: 0, lowStock: 0, outOfStock: 0, value: 0 };
            }
            const cat = report.categories[product.category];
            cat.total++;
            cat.value += product.price * product.countInStock;
            
            if (product.countInStock === 0) cat.outOfStock++;
            else if (product.countInStock <= 5) cat.lowStock++;
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
