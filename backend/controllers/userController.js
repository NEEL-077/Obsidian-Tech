const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const supabase = require('../config/supabase');

const { sendWelcomeEmail } = require('../utils/emailService');

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Generate a real Supabase signup confirmation link (bypasses Supabase's broken internal SMTP)
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'signup',
            email: email,
            password: password,
            options: {
                data: { full_name: name }
            }
        });

        if (linkError) {
            return res.status(400).json({ message: linkError.message });
        }

        // Insert into public.users
        if (linkData.user) {
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ id: linkData.user.id, name, email, role: 'user' }]);
            
            if (insertError) console.error('Error inserting into public.users:', insertError);
        }

        // Send the real confirmation email using our LOCAL NodeMailer (Gmail)
        try {
            const { sendEmail } = require('../utils/emailService');
            const confirmationHtml = `
                <h2 style="color: #102C57;">Welcome to OBSIDIAN TECH! 🎉</h2>
                <p>Hi ${name},</p>
                <p>Thank you for signing up! Please confirm your email address by clicking the secure link below:</p>
                <div style="margin: 30px 0;">
                    <a href="${linkData.properties.action_link}" style="background: #102C57; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify My Email</a>
                </div>
                <p style="color: #6c757d; font-size: 14px;">If you did not request this, please ignore this email.</p>
            `;
            await sendEmail(email, 'Verify your OBSIDIAN TECH account', confirmationHtml);
            console.log(`✅ Confirmation email sent to ${email} via Local SMTP`);
        } catch (emailError) {
            console.error('❌ Failed to send confirmation email:', emailError.message);
            return res.status(500).json({ message: 'Failed to send confirmation email. Check backend SMTP settings.' });
        }

        res.status(201).json({
            _id: linkData.user?.id || 'temp_id',
            name: name,
            email: email,
            isAdmin: false,
            twoFactorEnabled: false,
            token: 'verification_required', // Frontend should handle this or just redirect to login
            message: 'Verification email sent. Please check your inbox.'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Hardcoded admin bypass since MongoDB models are currently missing
        if ((email === 'admin' || email === 'admin@obsidian.com') && password === 'admin123') {
            return res.json({
                _id: 'admin_bypass_001',
                name: 'Super Admin',
                email: email,
                isAdmin: true,
                twoFactorEnabled: false,
                token: generateToken('admin_bypass_001'),
            });
        }

        // Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Fetch user from public.users to get role/name
        const { data: publicUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        res.status(200).json({
            _id: data.user.id,
            name: publicUser?.name || data.user.user_metadata?.full_name || 'User',
            email: data.user.email,
            isAdmin: publicUser?.role === 'admin',
            twoFactorEnabled: false,
            token: data.session.access_token,
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, password, phone, addresses, preferences } = req.body;

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone !== undefined ? phone : user.phone;
        user.addresses = addresses || user.addresses;
        user.preferences = preferences ? { ...user.preferences, ...preferences } : user.preferences;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            phone: updatedUser.phone,
            addresses: updatedUser.addresses,
            preferences: updatedUser.preferences,
            twoFactorEnabled: updatedUser.twoFactorEnabled,
            twoFactorType: updatedUser.twoFactorType,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add user address
// @route   POST /api/users/addresses
// @access  Private
const addUserAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, phone, address, city, state, pincode, isDefault } = req.body;

        if (!user.addresses) user.addresses = [];

        if (isDefault) {
            user.addresses = user.addresses.map(addr => ({ ...addr, isDefault: false }));
        }

        const newAddress = {
            _id: `addr_${Date.now()}`,
            name,
            phone,
            address,
            city,
            state,
            pincode,
            isDefault: isDefault || user.addresses.length === 0,
            createdAt: new Date().toISOString()
        };

        user.addresses.push(newAddress);
        user.markModified('addresses');
        await user.save();

        res.status(201).json(newAddress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update user address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateUserAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.addresses) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id === req.params.addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const { name, phone, address, city, state, pincode, isDefault } = req.body;

        if (isDefault) {
            user.addresses = user.addresses.map(addr => ({ ...addr, isDefault: false }));
        }

        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex],
            name: name || user.addresses[addressIndex].name,
            phone: phone || user.addresses[addressIndex].phone,
            address: address || user.addresses[addressIndex].address,
            city: city || user.addresses[addressIndex].city,
            state: state || user.addresses[addressIndex].state,
            pincode: pincode || user.addresses[addressIndex].pincode,
            isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault,
            updatedAt: new Date().toISOString()
        };

        user.markModified('addresses');
        await user.save();

        res.json(user.addresses[addressIndex]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete user address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteUserAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.addresses) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id === req.params.addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const deletedAddress = user.addresses[addressIndex];
        user.addresses.splice(addressIndex, 1);

        if (deletedAddress.isDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        user.markModified('addresses');
        await user.save();
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Stubbing out wishlist + recently viewed because they rely on arrays inside user Model that weren't rigorously formalized in schema. We map to preferences.
// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (!user.preferences) user.preferences = {};
        if (!user.preferences.wishlist) user.preferences.wishlist = [];

        const existingIndex = user.preferences.wishlist.findIndex(item => String(item.productId) === req.params.productId);
        if (existingIndex !== -1) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        user.preferences.wishlist.push({
            productId: req.params.productId,
            addedAt: new Date().toISOString()
        });

        user.markModified('preferences');
        await user.save();
        res.status(201).json({ message: 'Product added to wishlist' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.preferences || !user.preferences.wishlist) {
            return res.status(404).json({ message: 'Product not in wishlist' });
        }

        const itemIndex = user.preferences.wishlist.findIndex(item => String(item.productId) === req.params.productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not in wishlist' });
        }

        user.preferences.wishlist.splice(itemIndex, 1);
        user.markModified('preferences');
        await user.save();
        res.json({ message: 'Product removed from wishlist' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getUserWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.preferences || !user.preferences.wishlist || user.preferences.wishlist.length === 0) {
            return res.json([]);
        }

        const productIds = user.preferences.wishlist.map(w => w.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        const wishlistWithProducts = user.preferences.wishlist.map(item => {
            const product = products.find(p => String(p._id) === String(item.productId));
            return {
                ...item,
                product: product || null
            };
        }).filter(item => item.product !== null);

        res.json(wishlistWithProducts);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Track recently viewed product
// @route   POST /api/users/recently-viewed/:productId
// @access  Private
const addRecentlyViewed = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.preferences) user.preferences = {};
        if (!user.preferences.recentlyViewed) user.preferences.recentlyViewed = [];

        user.preferences.recentlyViewed = user.preferences.recentlyViewed.filter(item => String(item.productId) !== req.params.productId);

        user.preferences.recentlyViewed.unshift({
            productId: req.params.productId,
            viewedAt: new Date().toISOString()
        });

        user.preferences.recentlyViewed = user.preferences.recentlyViewed.slice(0, 20);
        user.markModified('preferences');
        await user.save();

        res.json({ message: 'Product added to recently viewed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get recently viewed products
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || !user.preferences || !user.preferences.recentlyViewed) {
            return res.json([]);
        }

        const productIds = user.preferences.recentlyViewed.map(r => r.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        const recentlyViewedWithProducts = user.preferences.recentlyViewed.map(item => {
            const product = products.find(p => String(p._id) === String(item.productId));
            return {
                ...item,
                product: product || null
            };
        }).filter(item => item.product !== null);

        res.json(recentlyViewedWithProducts);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Verify 2FA at login
// @route   POST /api/users/login/2fa
// @access  Public
const verifyLogin2FA = async (req, res) => {
    try {
        const { userId, code } = req.body;
        const user = await User.findById(userId);

        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ message: '2FA not enabled for this user' });
        }

        const { verify2FACode } = require('./twoFactorController');
        const isValid = verify2FACode(user, code);

        if (isValid) {
            // Clear email code if it was used
            if (user.twoFactorType === 'email') {
                user.twoFactorCode = undefined;
                user.twoFactorCodeExpires = undefined;
                await user.save();
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                twoFactorEnabled: user.twoFactorEnabled,
                twoFactorType: user.twoFactorType,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid security code' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    addToWishlist,
    removeFromWishlist,
    getUserWishlist,
    addRecentlyViewed,
    getRecentlyViewed,
    verifyLogin2FA
};
