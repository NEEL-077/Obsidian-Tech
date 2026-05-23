import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Scroll to top and trigger top progress bar flash
    window.scrollTo(0, 0);
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 650);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Top Shimmery Progress Loader */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ width: '0%', opacity: 1 }}
            animate={{ width: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ 
              width: { duration: 0.5, ease: 'easeInOut' },
              opacity: { duration: 0.15, delay: 0.45 }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '3.5px',
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 1px 10px rgba(139, 92, 246, 0.6), 0 0 4px rgba(236, 72, 153, 0.4)',
              zIndex: 999999,
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1] // Custom premium ease-out
        }}
        style={{
          minHeight: '100vh'
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;
