const jwt = require('jsonwebtoken');


const supabase = require('../config/supabase');

// @desc    Protect routes - verify JWT
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Check for custom mock or locally generated JWT tokens
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // 1. Admin bypass check
                if (decoded.id === 'admin_bypass_001') {
                    req.user = {
                        _id: 'admin_bypass_001',
                        name: 'Super Admin',
                        email: 'admin@obsidian.com',
                        isAdmin: true
                    };
                    return next();
                }
                
                // 2. Normal locally generated JWT token check
                const { data: publicUser } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', decoded.id)
                    .single();
                
                if (publicUser) {
                    req.user = {
                        _id: publicUser.id,
                        name: publicUser.name,
                        email: publicUser.email,
                        isAdmin: publicUser.role === 'admin'
                    };
                    return next();
                }
            } catch (jwtError) {
                // Not a custom local JWT, likely a Supabase JWT. Proceed to Supabase check.
            }

            // Verify with Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);
            
            if (error || !user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Fetch user role from public.users
            const { data: publicUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            req.user = {
                _id: user.id,
                name: publicUser?.name || user.user_metadata?.full_name || 'User',
                email: user.email,
                isAdmin: publicUser?.role === 'admin'
            };
            
            next();
        } catch (error) {
            console.error('JWT verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// @desc    Admin check
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        // BUG #5 FIX: Use 403 Forbidden (not 401 Unauthorized) for authenticated non-admin users
        res.status(403);
        next(new Error('Not authorized as an admin'));
    }
};

module.exports = { protect, admin };
