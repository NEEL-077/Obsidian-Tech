# Obsidian Tech - Single Port Deployment Guide

## 🚀 QUICK START

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation & Deployment

```bash
# 1. Install all dependencies
npm install

# 2. Build the frontend
npm run build

# 3. Start the application
npm start
```

**The entire application will be available at: http://localhost:5000**

## 📁 Project Structure

```
obsidian-tech/
├── package.json              # Root package.json for easy management
├── backend/
│   ├── server.js             # Express server (serves frontend + API)
│   ├── package.json          # Backend dependencies & scripts
│   ├── .env                  # Environment variables (PORT=5000)
│   ├── routes/               # API routes
│   ├── controllers/          # Business logic
│   ├── middleware/           # Express middleware
│   ├── data/                 # JSON database files
│   └── uploads/              # File uploads directory
└── frontend/
    ├── dist/                 # Built frontend (served by backend)
    ├── src/                  # React source code
    ├── vite.config.js        # Build configuration
    └── package.json          # Frontend dependencies
```

## 🔧 Configuration Details

### Backend Server (server.js)
- **Port**: 5000
- **Static Files**: Serves frontend/dist
- **API Routes**: /api/*
- **File Uploads**: /uploads/*
- **SPA Support**: Catch-all route for React Router

### Frontend Build (vite.config.js)
- **Output**: dist/ directory
- **Minification**: esbuild (fast)
- **Assets**: Optimized and bundled

### Environment Variables (.env)
```
PORT=5000
JWT_SECRET=ObsidianTech_super_secret_jwt_key_2024
NODE_ENV=development
```

## 🌐 Available Routes

### Frontend Routes (React Router)
- `/` - Homepage
- `/products` - Product catalog
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/auth` - Login/Register
- `/admin` - Admin panel
- `/profile` - User profile
- `/deals` - Smart deals page

### API Routes (Express)
- `/api/users/*` - User management
- `/api/products/*` - Product management
- `/api/orders/*` - Order management
- `/api/admin/*` - Admin operations
- `/api/upload/*` - File uploads
- `/uploads/*` - Static file serving

## 👤 Admin Access

**Admin Panel**: http://localhost:5000/admin

*Note: Admin credentials are configured in the database. Contact system administrator for access.*

## 🛠️ Development vs Production

### Development Mode
```bash
# Run frontend and backend separately (for development)
npm run dev
```

### Production Mode
```bash
# Build and serve from single port (current setup)
npm run build
npm start
```

## 📦 Package.json Scripts

### Root Level
- `npm install` - Install all dependencies
- `npm run build` - Build frontend for production
- `npm start` - Start production server
- `npm run dev` - Start development servers

### Backend Level
- `npm start` - Start Express server
- `npm run dev` - Start with nodemon (development)
- `npm run build` - Build frontend from backend

### Frontend Level
- `npm run build` - Build for production
- `npm run dev` - Start Vite dev server

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf frontend/node_modules/.vite
```

### API Connection Issues
- Ensure backend is running on port 5000
- Check that frontend build is in `frontend/dist/`
- Verify API calls use relative URLs (`/api/...`)

## 🚀 Deployment Checklist

- [ ] All dependencies installed
- [ ] Frontend built successfully
- [ ] Backend serves static files
- [ ] Environment variables configured
- [ ] Port 5000 available
- [ ] Admin credentials working
- [ ] API routes functional
- [ ] File uploads working

## 📊 Performance Notes

- Frontend bundle size: ~503KB (gzipped: ~162KB)
- CSS bundle size: ~72KB (gzipped: ~14KB)
- Consider code splitting for larger applications
- Static files served with Express.static for optimal performance

## 🔐 Security Considerations

- JWT tokens for authentication
- CORS configured for security
- File upload restrictions in place
- Admin routes protected
- Environment variables for sensitive data

---

**Success Criteria**: 
✅ Single command deployment: `npm install && npm run build && npm start`
✅ Full application accessible at: http://localhost:5000
✅ All features functional from one port