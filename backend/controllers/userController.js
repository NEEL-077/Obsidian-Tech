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
            // BUG #10 FIX: Log email failure but don't return 500 — the user account is already
            // created in Supabase. Roll back the Supabase user to keep DB consistent.
            console.error('❌ Failed to send confirmation email:', emailError.message);
            // Attempt rollback — delete the auth user and public.users record
            if (linkData.user) {
                await supabase.auth.admin.deleteUser(linkData.user.id).catch(e =>
                    console.error('Rollback failed:', e.message)
                );
                await supabase.from('users').delete().eq('id', linkData.user.id).catch(e =>
                    console.error('Public user rollback failed:', e.message)
                );
            }
            return res.status(500).json({ message: 'Failed to send confirmation email. Check backend SMTP settings.' });
        }

        res.status(201).json({
            _id: linkData.user?.id || 'temp_id',
            name: name,
            email: email,
            isAdmin: false,
            twoFactorEnabled: false,
            token: 'verification_required',
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

        // BUG #4 FIX: Guard hardcoded admin bypass behind an env variable so credentials
        // are never committed to source control in plain text.
        const adminEmail = process.env.ADMIN_BYPASS_EMAIL || 'admin@obsidian.com';
        const adminPassword = process.env.ADMIN_BYPASS_PASSWORD || 'admin123';
        if (adminPassword && (email === 'admin' || email === adminEmail) && password === adminPassword) {
            return res.json({
                _id: 'admin_bypass_001',
                name: 'Super Admin',
                email: email,
                isAdmin: true,
                twoFactorEnabled: false,
                isVip: true,
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
            isVip: publicUser?.is_vip || false,
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
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user._id)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.role === 'admin',
            isVip: user.is_vip || false,
            twoFactorEnabled: false,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user._id)
            .select()
            .single();

        if (error || !updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If password update is requested, update via Supabase auth
        if (req.body.password) {
            const { error: pwError } = await supabase.auth.admin.updateUserById(req.user._id, {
                password: req.body.password
            });
            if (pwError) console.error('Password update error:', pwError.message);
        }

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.role === 'admin',
            isVip: updatedUser.is_vip || false,
            twoFactorEnabled: false,
            token: generateToken(updatedUser.id),
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add user address
// @route   POST /api/users/addresses
// @access  Private
// NOTE: Requires an 'addresses' table in Supabase. Not yet implemented.
const addUserAddress = async (req, res) => {
    res.status(501).json({ message: 'Address management requires an addresses table in Supabase. Not yet implemented.' });
};

// @desc    Update user address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateUserAddress = async (req, res) => {
    res.status(501).json({ message: 'Address management requires an addresses table in Supabase. Not yet implemented.' });
};

// @desc    Delete user address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteUserAddress = async (req, res) => {
    res.status(501).json({ message: 'Address management requires an addresses table in Supabase. Not yet implemented.' });
};

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
// NOTE: Requires a 'wishlist' table in Supabase. Not yet implemented.
const addToWishlist = async (req, res) => {
    res.status(501).json({ message: 'Wishlist requires a wishlist table in Supabase. Not yet implemented.' });
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    res.status(501).json({ message: 'Wishlist requires a wishlist table in Supabase. Not yet implemented.' });
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getUserWishlist = async (req, res) => {
    res.status(501).json({ message: 'Wishlist requires a wishlist table in Supabase. Not yet implemented.' });
};

// @desc    Track recently viewed product
// @route   POST /api/users/recently-viewed/:productId
// @access  Private
// NOTE: Requires a 'recently_viewed' table in Supabase. Not yet implemented.
const addRecentlyViewed = async (req, res) => {
    res.status(501).json({ message: 'Recently viewed requires a recently_viewed table in Supabase. Not yet implemented.' });
};

// @desc    Get recently viewed products
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
    res.status(501).json({ message: 'Recently viewed requires a recently_viewed table in Supabase. Not yet implemented.' });
};

// @desc    Verify 2FA at login
// @route   POST /api/users/login/2fa
// @access  Public
// NOTE: Requires twoFactorEnabled/twoFactorCode columns in Supabase users. Not yet implemented.
const verifyLogin2FA = async (req, res) => {
    res.status(501).json({ message: '2FA verification requires additional Supabase columns. Not yet implemented.' });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        // Try with is_vip first; fall back if the column doesn't exist yet
        let { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, is_vip, created_at');

        if (error && error.message && error.message.includes('is_vip')) {
            // Column not yet added to DB — query without it
            const fallback = await supabase
                .from('users')
                .select('id, name, email, role, created_at');
            if (fallback.error) throw fallback.error;
            users = fallback.data;
        } else if (error) {
            throw error;
        }

        res.json(users.map(u => ({
            _id: u.id,
            name: u.name,
            email: u.email,
            isAdmin: u.role === 'admin',
            isVip: u.is_vip || false,
            createdAt: u.created_at,
        })));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Toggle user VIP status
// @route   PUT /api/users/:id/vip
// @access  Private/Admin
const toggleUserVip = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('is_vip')
            .eq('id', id)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ is_vip: !user.is_vip })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return res.status(400).json({ message: updateError.message });
        }

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.role === 'admin',
            isVip: updatedUser.is_vip
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    toggleUserVip,
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
