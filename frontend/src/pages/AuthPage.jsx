import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import './AuthPage.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WebGLShader } from '../components/ui/web-gl-shader';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const { login, register, setUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Handle Google OAuth callback (from hash fragment)
    useEffect(() => {
        const hash = window.location.hash;
        const error = searchParams.get('error');
        
        if (error) {
            console.error('Google OAuth error:', error);
            setErrorMsg('Google sign-in failed. Please try again.');
            return;
        }
        
        // Handle hash-based token from Google OAuth
        if (hash && hash.includes('token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('token');
            const userEncoded = params.get('user');
            
            if (token && userEncoded) {
                try {
                    // Decode user data
                    const userJson = atob(userEncoded);
                    const userData = JSON.parse(userJson);
                    
                    // Store in localStorage
                    localStorage.setItem('token', token);
                    localStorage.setItem('userInfo', userJson);
                    
                    // Update auth context
                    setUser(userData);
                    
                    // Clear hash and redirect to home
                    window.location.hash = '';
                    navigate('/');
                } catch (e) {
                    console.error('Error processing Google login:', e);
                    setErrorMsg('Error processing login. Please try again.');
                }
            }
        }
    }, [searchParams, navigate, setUser]);
    
    // Handle Google login
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5001/api/users/auth/google';
    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [show2FA, setShow2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorData, setTwoFactorData] = useState(null); // { userId, type }
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            if (isLogin) {
                const res = await login(formData.email, formData.password);
                if (res.success) {
                    if (res.twoFactorRequired) {
                        setShow2FA(true);
                        setTwoFactorData({ userId: res.userId, type: res.twoFactorType });
                    } else {
                        navigate('/');
                    }
                } else {
                    setErrorMsg(res.error);
                }
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setErrorMsg('Passwords do not match!');
                    setLoading(false);
                    return;
                }
                const res = await register(formData.name, formData.email, formData.password);
                if (res.success) {
                    navigate('/');
                } else {
                    setErrorMsg(res.error);
                }
            }
        } catch (err) {
            setErrorMsg('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const { verify2FA } = require('../context/AuthContext'); // This is wrong, should use from useAuth
        // Correction: verify2FA is already in useAuth() but I need to destructure it
    };

    // Correcting the verify function by re-destructuring useAuth
    const { login: loginCore, register: registerCore, setUser: setUserCore, verify2FA } = useAuth();

    const onVerify2FA = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);
        const res = await verify2FA(twoFactorData.userId, twoFactorCode);
        if (res.success) {
            navigate('/');
        } else {
            setErrorMsg(res.error);
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            <SEO
                title={show2FA ? 'Security Verification' : (isLogin ? 'Sign In' : 'Create Account')}
                description="Sign in to your OBSIDIAN TECH account to access your orders, wishlist, and exclusive offers."
                url="/auth"
                noIndex={true}
            />
            
            <WebGLShader />
            
            <div className="fixed inset-0 bg-black/40 -z-10 pointer-events-none" />
            
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="relative border border-[#27272a] p-2 w-full mx-auto">
                        <main className="relative z-10 border border-[#27272a] py-10 px-8 bg-black/50 backdrop-blur-sm">
                            
                            {/* 2FA UI */}
                            {show2FA ? (
                                <>
                                    <div className="text-center mb-8">
                                        <h1 className="mb-3 text-white text-center text-4xl font-extrabold tracking-tighter md:text-5xl">
                                            Verify Identity
                                        </h1>
                                        <p className="text-white/60 px-6 text-center text-sm md:text-base">
                                            Enter the 6-digit code from your {twoFactorData.type === 'email' ? 'email' : 'authenticator app'}.
                                        </p>
                                    </div>

                                    {errorMsg && (
                                        <div className="mb-6 p-3 rounded bg-red-500/20 border border-red-500/30 text-red-200 text-sm text-center">
                                            {errorMsg}
                                        </div>
                                    )}

                                    <form onSubmit={onVerify2FA} className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-2">Verification Code</label>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                                required
                                                placeholder="000000"
                                                className="w-full px-4 py-3 bg-transparent border border-[#27272a] text-white text-center text-2xl tracking-[0.5em] placeholder-white/20 focus:outline-none focus:border-white/50 transition-colors"
                                            />
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full py-3 px-4 bg-white text-black font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                                        </button>
                                        
                                        <button 
                                            type="button"
                                            onClick={() => setShow2FA(false)}
                                            className="w-full text-white/50 text-sm hover:text-white transition-colors"
                                        >
                                            Back to Login
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    {/* Standard Login/Register UI */}
                                    <div className="text-center mb-8">
                                        <h1 className="mb-3 text-white text-center text-4xl font-extrabold tracking-tighter md:text-5xl">
                                            {isLogin ? 'Welcome Back' : 'Create Account'}
                                        </h1>
                                        <p className="text-white/60 px-6 text-center text-sm md:text-base">
                                            {isLogin ? 'Sign in to continue to OBSIDIAN TECH' : 'Join OBSIDIAN TECH today'}
                                        </p>
                                    </div>

                                    {errorMsg && (
                                        <div className="mb-6 p-3 rounded bg-red-500/20 border border-red-500/30 text-red-200 text-sm text-center">
                                            {errorMsg}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {!isLogin && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Enter your Name"
                                                    className="w-full px-4 py-3 bg-transparent border border-[#27272a] text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-colors"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="name@company.com"
                                                className="w-full px-4 py-3 bg-transparent border border-[#27272a] text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-colors"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                placeholder="••••••••"
                                                className="w-full px-4 py-3 bg-transparent border border-[#27272a] text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-colors"
                                            />
                                        </div>

                                        {!isLogin && (
                                            <div>
                                                <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-3 bg-transparent border border-[#27272a] text-white placeholder-white/40 focus:outline-none focus:border-white/50 transition-colors"
                                                />
                                            </div>
                                        )}

                                        {isLogin && (
                                            <div className="flex items-center justify-between text-sm">
                                                <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                                                    <input type="checkbox" className="rounded border-[#27272a] bg-transparent" />
                                                    <span>Remember me</span>
                                                </label>
                                                <a href="#" className="text-white/70 hover:text-white transition-colors">Forgot password?</a>
                                            </div>
                                        )}

                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full py-3 px-4 bg-white text-black font-semibold hover:bg-white/90 transition-colors"
                                        >
                                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                                        </button>
                                    </form>

                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-[#27272a]"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-black/50 text-white/50">or continue with</span>
                                        </div>
                                    </div>

                                    <a 
                                        href="http://localhost:5001/api/users/auth/google"
                                        className="relative z-50 w-full flex items-center justify-center gap-3 py-3 px-4 border border-[#27272a] text-white hover:border-white/50 hover:bg-white/5 transition-all no-underline"
                                    >
                                        <svg className="w-5 h-5 pointer-events-none" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        <span className="pointer-events-none">Continue with Google</span>
                                    </a>

                                    <p className="mt-6 text-center text-white/70 text-sm">
                                        {isLogin ? "Don't have an account?" : 'Already have an account?'}
                                        <button 
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="ml-1 text-white hover:text-white/80 font-semibold transition-colors"
                                        >
                                            {isLogin ? 'Sign Up' : 'Sign In'}
                                        </button>
                                    </p>
                                </>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
