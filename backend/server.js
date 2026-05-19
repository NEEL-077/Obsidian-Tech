const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');

// Load environment variables FIRST (before any other imports that use env vars)
dotenv.config();

const http = require('http'); // Import http for Socket.io
const passport = require('passport');
const { initSocket } = require('./utils/socket'); // Import Socket.io init
require('./config/passport'); // Initialize passport config

// Startup function
const startServer = async () => {
  try {
    const app = express();
    const server = http.createServer(app); // Create HTTP server
    const PORT = process.env.PORT || 5001;

    // Initialize Socket.io
    initSocket(server);

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Session middleware (required for Passport OAuth)
    app.use(session({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());

    // Import routes
    const userRoutes = require('./routes/userRoutes');
    const productRoutes = require('./routes/productRoutes');
    const orderRoutes = require('./routes/orderRoutes');
    const adminRoutes = require('./routes/adminRoutes');
    const uploadRoutes = require('./routes/uploadRoutes');
    const couponRoutes = require('./routes/couponRoutes');
    const emailRoutes = require('./routes/emailRoutes');
    const chatRoutes = require('./routes/chatRoutes');

    // Import middleware
    const { notFound, errorHandler } = require('./middleware/errorMiddleware');

    // Basic route removed as frontend static files handles '/'

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Mount routes
    app.use('/api/users', userRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/coupons', couponRoutes);
    app.use('/api/email', emailRoutes);
    app.use('/api/chat', chatRoutes);

    // Serve uploaded files statically
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Serve frontend public images and logos from the backend
    // This allows email clients to resolve local image links during development
    app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));
    app.use('/logos', express.static(path.join(__dirname, '../frontend/public/logos')));

    // Serve Static Frontend Support

    // Make the frontend dist folder static
    const frontendPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(frontendPath));

    // Catch-all route to serve index.html for React Router
    // We only want to serve index.html if it's NOT an /api route
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next(); // Let the notFound middleware handle it
      }

      const resolvedPath = path.join(__dirname, '../frontend/dist/index.html');
      res.sendFile(resolvedPath, (err) => {
        if (err) {
          console.error(`[DEBUG] Error serving index.html:`, err);
          return next(err);
        }
      });
    });

    // Error Middleware
    app.use(notFound);
    app.use(errorHandler);

    // Start server (use server.listen instead of app.listen)
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`🔌 Socket.io ready for connections`);
    });
  } catch (error) {
    console.error(`💥 Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();

