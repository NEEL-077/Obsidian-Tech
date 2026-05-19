# Obsidian Tech - Project Analysis & Quick Reference

## 📊 Project Overview
**Obsidian Tech** is an AI-integrated mobile e-commerce platform with intelligent recommendations, chatbot support, and smart search capabilities.

---

## 🏗️ Architecture

```
obsidian-tech/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express + MongoDB
├── ai-service/        # Python Flask AI microservice
└── [Brand Photos]/    # Product images (Apple, Samsung, Google, etc.)
```

---

## 🚀 Quick Start Commands

```bash
# Start Backend (Port 5001)
cd backend && npm start

# Start Frontend (Port 5000)
cd frontend && npm run dev

# Start AI Service (Port 8000)
cd ai-service && python app.py
```

---

## 📁 Frontend Structure (`/frontend/src/`)

### Pages (`/pages/`)
| File | Route | Purpose |
|------|-------|---------|
| `AuthPage.jsx` | `/auth` | Login/Register with WebGL shader background |
| `HomePage` (in App.jsx) | `/` | Landing with CircularGallery hero |
| `ProductsPage.jsx` | `/products` | Product listing with filters |
| `ProductDetailPage.jsx` | `/product/:id` | Single product view |
| `BrandPage.jsx` | `/brand/:brandName` | Brand-specific products |
| `CartPage.jsx` | `/cart` | Shopping cart |
| `CheckoutPage.jsx` | `/checkout` | Payment & order placement |
| `ProfilePage.jsx` | `/profile` | User dashboard |
| `OrderTrackingPage.jsx` | `/order-tracking/:orderId` | Track orders |
| `AdminPage.jsx` | `/admin` | Admin dashboard |

### Components (`/components/`)
| Component | Purpose |
|-----------|---------|
| `Navbar.jsx` | Top navigation |
| `HoverFooter.jsx` | Animated footer |
| `Categories.jsx` | Category cards grid |
| `FeaturedProducts.jsx` | Product showcase |
| `ProductCard.jsx` | Reusable product card |
| `CircularGallery.jsx` | 3D rotating hero gallery |
| `NewsletterSignup.jsx` | Email subscription |
| `SpotlightSearch.jsx` | AI-powered search |
| `PaymentGateway.jsx` | Payment processing |
| `SEO.jsx` | Meta tags & structured data |

### Context (`/context/`)
- `AuthContext.jsx` - User authentication state
- `CartContext.jsx` - Shopping cart state
- `ProductContext.jsx` - Product data state

### API (`/api/`)
- `axiosConfig.js` - Axios instance with interceptors
- `userApi.js` - User-related API calls
- `productApi.js` - Product-related API calls
- `orderApi.js` - Order-related API calls
- `emailApi.js` - Email system API calls

---

## 📁 Backend Structure (`/backend/`)

### Routes (`/routes/`)
| Route | Endpoint | Purpose |
|-------|----------|---------|
| `userRoutes.js` | `/api/users` | Auth, profile, users |
| `productRoutes.js` | `/api/products` | CRUD products |
| `orderRoutes.js` | `/api/orders` | Orders, tracking |
| `adminRoutes.js` | `/api/admin` | Admin operations |
| `couponRoutes.js` | `/api/coupons` | Discount codes |
| `emailRoutes.js` | `/api/email` | Email campaigns |
| `uploadRoutes.js` | `/api/upload` | File uploads |

### Controllers (`/controllers/`)
- `userController.js` - User auth & management
- `productController.js` - Product CRUD
- `orderController.js` - Order processing
- `adminController.js` - Admin functions
- `couponController.js` - Coupon management
- `emailController.js` - Email system

### Models (`/models/`)
- `userModel.js` - User schema
- `productModel.js` - Product schema
- `orderModel.js` - Order schema
- `couponModel.js` - Coupon schema
- `emailModel.js` - Email campaign schemas

### Utils (`/utils/`)
- `emailService.js` - Nodemailer email sending
- `emailDiagnostics.js` - Email testing tools
- `generateToken.js` - JWT token generation

### Middleware (`/middleware/`)
- `authMiddleware.js` - JWT verification
- `errorMiddleware.js` - Error handling

---

## 🎨 Styling System

### Tailwind CSS Configuration
- Main config: `frontend/tailwind.config.js`
- Global styles: `frontend/src/index.css`
- Component styles: Individual `.css` files

### Color Scheme (Premium Theme)
```css
/* Gold Accent */
--gold: #C9A24A;
--gold-light: #D4AF37;

/* Blue Accent */
--blue: #5B8DEF;
--blue-dark: #3B6FC9;

/* Dark Theme Base */
--bg-dark: #0A0A0A;
--card-bg: #1A1A1A;
```

### Key CSS Classes
```css
/* Glassmorphism */
.glass { @apply backdrop-blur-xl bg-white/10 border border-white/20; }

/* Gradient Text */
.gradient-text { @apply text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600; }

/* Premium Card */
.premium-card { @apply bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl; }
```

---

## 🔧 Environment Variables

### Backend `.env`
```env
PORT=5001
JWT_SECRET=your_secret
MONGO_URI=mongodb://127.0.0.1:27017/obsidian-tech

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ObsidianTech.001@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:5000
```

---

## 🔄 Data Flow

### Authentication Flow
1. User registers/logs in → `POST /api/users` or `/api/users/login`
2. Backend validates → Returns JWT token
3. Frontend stores token in localStorage
4. Token sent with every request via Axios interceptors

### Order Flow
1. Add to cart (localStorage + context)
2. Checkout → `POST /api/orders`
3. Payment processing
4. Email confirmation sent
5. Order tracking updates

### Email Flow
1. Trigger event (order, signup, etc.)
2. Call `sendEmail()` from `emailService.js`
3. Nodemailer sends via Gmail SMTP
4. Track opens/clicks via pixel tracking

---

## 🛠️ Common Tasks

### Add New Page
1. Create `PageName.jsx` in `/pages/`
2. Add route in `App.jsx`
3. Wrap with `PageTransition` for animations

### Add New API Endpoint
1. Create function in `backend/controllers/`
2. Add route in `backend/routes/`
3. Mount route in `backend/server.js`
4. Create API function in `frontend/src/api/`

### Add New Component
1. Create `ComponentName.jsx` in `/components/` or `/components/ui/`
2. Import in parent file
3. Add to `tailwind.config.js` if custom styles needed

### Modify Email Templates
1. Edit templates in `backend/utils/emailService.js`
2. Functions: `getWelcomeTemplate()`, `getOrderConfirmationTemplate()`, etc.
3. Test via `/api/email/test` endpoint

---

## 🐛 Debugging Tips

### Check Server Logs
```bash
# Backend logs show email sending status
# Look for: ✅ Email sent successfully
# Or: ❌ Email sending failed
```

### Test Email
```bash
POST http://localhost:5001/api/email/test
{
  "email": "test@example.com",
  "template": "welcome"
}
```

### Check Database
```bash
# MongoDB connection string
mongodb://127.0.0.1:27017/obsidian-tech
```

---

## 📦 Key Dependencies

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `three` - 3D graphics
- `lucide-react` - Icons
- `react-helmet-async` - SEO

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - Authentication
- `nodemailer` - Email sending
- `bcryptjs` - Password hashing
- `multer` - File uploads

---

## 🎯 AI Features Integration

### AI Service Endpoints (`ai-service/app.py`)
- `/recommend` - Product recommendations
- `/chat` - Chatbot responses
- `/search` - Smart search
- `/sentiment` - Review analysis
- `/visual-search` - Image-based search

### Frontend AI Components
- `SpotlightSearch.jsx` - AI search bar
- `FeaturedProducts.jsx` - AI recommendations
- Chatbot (integrated in UI)

---

## 📱 Brand Assets Structure

```
/Apple Photos/        - iPhone images
/Samsung Photos/      - Galaxy images  
/Google/              - Pixel images
/One Pluse/           - OnePlus images
/Motorolla/           - Motorola images
/Xiaomi/              - Xiaomi images
/logo/                - Brand logos
/logos/               - Additional logos
```

---

## ⚡ Performance Tips

1. **Images**: Use `/public/images/` for static assets
2. **API Calls**: Use React Query or SWR for caching
3. **Bundle Size**: Lazy load heavy components
4. **SEO**: Use `SEO.jsx` component on every page
5. **Animations**: Use CSS transforms, not layout properties

---

## 🔐 Security Notes

- JWT tokens expire (check `generateToken.js`)
- Passwords hashed with bcrypt
- File uploads restricted to images
- CORS configured for frontend URL
- Admin routes protected with `protect` + `admin` middleware

---

## 📞 Quick Reference

| Task | File/Location |
|------|---------------|
| Change hero products | `App.jsx` - `heroItems` array |
| Modify footer | `HoverFooter.jsx` |
| Update navbar | `Navbar.jsx` |
| Change colors | `tailwind.config.js` + `index.css` |
| Add new product field | `productModel.js` + `ProductCard.jsx` |
| Modify email content | `emailService.js` - template functions |
| Add payment method | `PaymentGateway.jsx` + `orderController.js` |
| Update SEO meta | `SEO.jsx` component |

---

*Last Updated: Project Analysis for Obsidian Tech E-commerce Platform*
