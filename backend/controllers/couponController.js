

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            description,
            discountType, // 'percentage' or 'fixed'
            discountValue,
            minOrderAmount,
            maxDiscountAmount,
            usageLimit,
            validFrom,
            validUntil,
            applicableCategories,
            applicableBrands,
            isActive
        } = req.body;

        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue: Number(discountValue),
            minOrderAmount: Number(minOrderAmount) || 0,
            maxDiscountAmount: discountType === 'percentage' ? Number(maxDiscountAmount) : null,
            usageLimit: Number(usageLimit) || null,
            usedCount: 0,
            validFrom: validFrom ? new Date(validFrom) : Date.now(),
            validUntil: validUntil ? new Date(validUntil) : null,
            applicableCategories: applicableCategories || [],
            applicableBrands: applicableBrands || [],
            isActive: isActive !== false,
            createdBy: req.user._id
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.json(coupons);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount, cartItems } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ message: 'Coupon is not active' });
        }

        const now = new Date();
        if ((coupon.validFrom && now < coupon.validFrom) || (coupon.validUntil && now > coupon.validUntil)) {
            return res.status(400).json({ message: 'Coupon has expired or not yet valid' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit exceeded' });
        }

        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({ 
                message: `Minimum order amount of ₹${coupon.minOrderAmount} required` 
            });
        }

        if (coupon.applicableCategories.length > 0 || coupon.applicableBrands.length > 0) {
            const applicableItems = cartItems.filter(item => {
                const categoryMatch = coupon.applicableCategories.length === 0 || 
                    coupon.applicableCategories.includes(item.category);
                const brandMatch = coupon.applicableBrands.length === 0 || 
                    coupon.applicableBrands.includes(item.brand);
                return categoryMatch && brandMatch;
            });

            if (applicableItems.length === 0) {
                return res.status(400).json({ message: 'Coupon not applicable to items in your cart' });
            }
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        discountAmount = Math.min(discountAmount, orderAmount);

        res.json({
            valid: true,
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            },
            discountAmount: Math.round(discountAmount),
            finalAmount: orderAmount - Math.round(discountAmount)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Apply coupon to order
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = async (req, res) => {
    try {
        const { code, orderId } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        coupon.usedCount += 1;
        await coupon.save();

        res.json({ message: 'Coupon applied successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createCoupon,
    getCoupons,
    validateCoupon,
    applyCoupon,
    updateCoupon,
    deleteCoupon
};
