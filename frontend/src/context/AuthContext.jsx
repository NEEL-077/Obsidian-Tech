import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginCall, registerCall, getUserProfile } from '../api/userApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let lastUserJson = null;

        const checkUserInfo = () => {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                // Only update if data changed
                if (userInfo !== lastUserJson) {
                    lastUserJson = userInfo;
                    try {
                        setUser(JSON.parse(userInfo));
                    } catch (e) {
                        console.error('Error parsing userInfo:', e);
                    }
                }
            }

            const adminInfo = localStorage.getItem('adminInfo');
            if (adminInfo) {
                try {
                    setAdminUser(JSON.parse(adminInfo));
                } catch (e) {
                    console.error('Error parsing adminInfo:', e);
                }
            }
        };

        // Check immediately on mount
        checkUserInfo();
        setLoading(false);

        // Listen for storage changes (for Google OAuth redirect)
        const handleStorageChange = (e) => {
            if (e.key === 'userInfo') {
                checkUserInfo();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Check periodically for changes (backup mechanism) - every 3 seconds
        const interval = setInterval(checkUserInfo, 3000);

        // Check when window gains focus (after redirect)
        const handleFocus = () => {
            checkUserInfo();
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const data = await loginCall(email, password);

            // Handle 2FA Challenge
            if (data.twoFactorRequired) {
                return { success: true, twoFactorRequired: true, userId: data._id, twoFactorType: data.twoFactorType };
            }

            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    };

    const verify2FA = async (userId, code) => {
        try {
            const { login2FA } = require('../api/userApi');
            const data = await login2FA(userId, code);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    };

    const adminLogin = async (email, password) => {
        try {
            const data = await loginCall(email, password);
            if (!data.isAdmin) return { success: false, error: 'Not an admin account' };
            setAdminUser(data);
            localStorage.setItem('adminInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    };

    const register = async (name, email, password) => {
        try {
            const data = await registerCall(name, email, password);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const adminLogout = () => {
        localStorage.removeItem('adminInfo');
        setAdminUser(null);
    };

    const updateUser = async () => {
        try {
            if (user) {
                const updatedUser = await getUserProfile();
                // Important: Preserve the token from the existing user object
                const userWithToken = { ...updatedUser, token: user.token };
                setUser(userWithToken);
                localStorage.setItem('userInfo', JSON.stringify(userWithToken));
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, adminUser, login, adminLogin, register, logout, adminLogout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
