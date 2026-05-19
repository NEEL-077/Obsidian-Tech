# Obsidian Tech - AI-Integrated Mobile Store

An intelligent e-commerce platform for mobile devices with AI-powered recommendations, chatbot support, and smart search capabilities.

## 🏗️ Project Structure

```
obsidian-tech/
├── frontend/          # React.js frontend (Vite)
├── backend/           # Node.js + Express API server
├── ai-service/        # Python Flask AI microservice
└── README.md
```

## 🚀 Tech Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling

### Backend
- **Node.js + Express** - API server
- **MongoDB** - Database
- **JWT** - Authentication
- **Mongoose** - ODM

### AI Service
- **Python + Flask** - AI microservice
- **scikit-learn** - Machine learning
- **pandas/numpy** - Data processing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Instructions

#### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`

#### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run in development mode
npm run dev
```
The backend will run on `http://localhost:5000`

#### 3. AI Service Setup
```bash
cd ai-service

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the service
python app.py
```
The AI service will run on `http://localhost:8000`

## 🎯 Features

### Core E-commerce
- ✅ User authentication and profiles
- ✅ Product catalog with search and filters
- ✅ Shopping cart and checkout
- ✅ Payment integration
- ✅ Order management
- ✅ Admin dashboard

### AI-Powered Features
- 🤖 Personalized product recommendations
- 🤖 AI chatbot for customer support
- 🤖 Smart search with NLP
- 🤖 Visual search (image-based)
- 🤖 Price prediction and alerts
- 🤖 Review sentiment analysis

## 📝 Development Status

See [task.md](task.md) for detailed progress tracking.

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

### AI Service
- `python app.py` - Start Flask development server

## 📚 Documentation

See the [roadmap](roadmap.md) for detailed implementation plan.

## 🤝 Contributing

This is a personal project. Feel free to fork and modify for your own use.

## 📄 License

MIT
