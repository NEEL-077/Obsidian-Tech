import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import HeroSection from './components/ui/hero-section';

import StickyFooter from './components/ui/sticky-footer';
import ProductsPage from './pages/ProductsPage';
import BrandPage from './pages/BrandPage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PageTransition from './components/PageTransition';

import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { SocketProvider } from './context/SocketContext'; // Import SocketProvider
import { ToastProvider } from './context/ToastContext'; // Import ToastProvider
import ScrollToTop from './components/ScrollToTop';
import Chatbot from './components/Chatbot';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';


const HomePage = () => (
  <PageTransition>
    <SEO
      title={null}
      description="Shop the latest iPhones, Samsung Galaxy, OnePlus, Google Pixel and more at OBSIDIAN TECH. AI-powered recommendations, 500+ phones, free shipping on orders above ₹50,000."
      url="/"
      type="website"
      jsonLd={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            name: 'OBSIDIAN TECH',
            url: import.meta.env.VITE_SITE_URL || 'http://localhost:5001',

            sameAs: [
              '#',
              '#',
              '#',
            ],
          },
          {
            '@type': 'WebSite',
            name: 'OBSIDIAN TECH',
            url: import.meta.env.VITE_SITE_URL || 'http://localhost:5001',
            potentialAction: {
              '@type': 'SearchAction',
              target: `${import.meta.env.VITE_SITE_URL || 'http://localhost:5001'}/products?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      }}
    />
    {/* ── Hero Section ── */}
    <HeroSection />

  </PageTransition>
);

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <ProductProvider>
              <CartProvider>
                <Router>
                  <div className="App">
                    <Routes>
                      {/* Admin Route (no navbar/footer) */}
                      <Route path="/admin" element={<AdminPage />} />

                      {/* Auth Route (no navbar/footer) */}
                      <Route path="/auth" element={<AuthPage />} />

                      {/* Main Routes (with navbar/footer) */}
                      <Route
                        path="/*"
                        element={
                          <>
                            <Navbar />
                            <main>
                              <Routes>
                                {/* BUG #3 FIX: Removed outer <PageTransition> wrapper — HomePage already
                                    defines its own <PageTransition> internally, causing double animation. */}
                                <Route path="/" element={<HomePage />} />
                                <Route path="/products" element={<PageTransition><ProductsPage /></PageTransition>} />
                                <Route path="/brand/:brandName" element={<PageTransition><BrandPage /></PageTransition>} />
                                <Route path="/category/:categoryName" element={<PageTransition><CategoryPage /></PageTransition>} />
                                <Route path="/product/:id" element={<PageTransition><ProductDetailPage /></PageTransition>} />
                                <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
                                <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
                                <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
                                <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
                                <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
                                <Route path="/order-tracking/:orderId" element={<PageTransition><OrderTrackingPage /></PageTransition>} />
                              </Routes>
                            </main>
                            <StickyFooter />
                            <ScrollToTop />
                            <Chatbot />
                          </>
                        }
                      />
                    </Routes>
                  </div>
                </Router>
              </CartProvider>
            </ProductProvider>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
