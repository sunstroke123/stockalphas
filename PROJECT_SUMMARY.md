# StockAlphas - Stocks and Finance Management System

## 📋 Project Overview

A full-stack Next.js application for AI-powered stock analysis and portfolio management with real-time data, machine learning predictions, and a sleek green/black themed UI.

## 🎨 Design System

### Color Scheme (Green/Black Theme)
- **Primary Background**: `#0A0A0A` (Near-black)
- **Card Background**: `rgb(25, 25, 25)` (Dark gray)
- **Primary Green**: `#0AFA92` (Vibrant green for positive/buy signals)
- **Secondary Red**: `#FF453A` (Clear red for negative/sell signals)
- **Text Primary**: `rgb(230, 230, 230)` (Off-white)
- **Text Secondary**: `rgb(140, 140, 140)` (Light gray)
- **Border Color**: `rgb(40, 40, 40)` (Subtle borders)

## 🏗️ Project Structure

```
stockalphas/
├── src/
│   ├── app/
│   │   ├── api/                      # Backend API Routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/    # NextAuth handler
│   │   │   │   └── register/         # User registration
│   │   │   ├── portfolio/            # Portfolio management
│   │   │   │   ├── route.js          # GET portfolio
│   │   │   │   └── transaction/      # POST transaction
│   │   │   ├── stock/
│   │   │   │   └── [ticker]/         # Dynamic stock routes
│   │   │   │       ├── details/      # Company info
│   │   │   │       ├── history/      # Historical data
│   │   │   │       ├── indicators/   # Technical indicators
│   │   │   │       └── prediction/   # ML predictions
│   │   │   └── watchlist/            # Watchlist CRUD
│   │   ├── auth/
│   │   │   └── signin/               # Authentication page
│   │   ├── dashboard/                # Main dashboard page
│   │   ├── portfolio/                # Portfolio page
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home (redirects)
│   ├── components/
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Modal.jsx
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── PortfolioSummaryCard.jsx
│   │   │   ├── Watchlist.jsx
│   │   │   └── PredictionFeed.jsx
│   │   ├── portfolio/                # Portfolio components
│   │   │   ├── AddTransactionModal.jsx
│   │   │   ├── HoldingsTable.jsx
│   │   │   └── PerformanceGraph.jsx
│   │   ├── Navigation.jsx
│   │   └── Providers.jsx
│   └── lib/
│       ├── auth.js                   # NextAuth configuration
│       ├── apiClient.js              # Axios instance
│       ├── mongodb.js                # MongoDB connection
│       └── models/                   # Mongoose schemas
│           ├── User.js
│           ├── Portfolio.js
│           └── Watchlist.js
└── .env.local                        # Environment variables
```

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript & JavaScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **HTTP Client**: Axios

### Backend
- **Runtime**: Next.js Route Handlers (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Stock Data**: yahoo-finance2
- **Password Hashing**: bcryptjs

## 📦 Installed Dependencies

```json
{
  "dependencies": {
    "axios": "latest",
    "framer-motion": "latest",
    "lucide-react": "latest",
    "next-auth": "beta",
    "mongoose": "latest",
    "yahoo-finance2": "latest",
    "bcryptjs": "latest",
    "recharts": "latest",
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "next": "16.0.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "latest",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
```

## 🔐 Environment Configuration

Create a `.env.local` file with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/stockalphas

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# External ML API Configuration
ML_API_URL=http://localhost:5000/api/ml
ML_API_KEY=your-ml-api-key-here

# Application Configuration
NODE_ENV=development
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MongoDB
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in `.env.local`

### 3. Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Update `NEXTAUTH_SECRET` in `.env.local`

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📄 Implemented Pages

### 1. **Authentication** (`/auth/signin`)
- Login/Sign-up toggle
- Email/password authentication
- Form validation
- Error handling
- Auto-redirect after auth

### 2. **Dashboard** (`/dashboard`)
- Portfolio summary card with total value and P/L
- Watchlist with real-time price updates
- AI prediction feed from ML model
- Quick actions (add to watchlist, view details)

### 3. **Portfolio** (`/portfolio`)
- Performance graph (line chart)
- Holdings table with gain/loss tracking
- Add transaction modal (Buy/Sell)
- Click-through to stock details

### 4. **Home** (`/`)
- Auto-redirect to dashboard or sign-in
- Loading state

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
- `POST /api/auth/[...nextauth]` - NextAuth handler

### Stock Data (Public)
- `GET /api/stock/[ticker]/details` - Company information
- `GET /api/stock/[ticker]/history?period=1mo` - Historical OHLCV data
- `GET /api/stock/[ticker]/indicators` - Technical indicators (MA, RSI, MACD)
- `GET /api/stock/[ticker]/prediction` - ML predictions (Buy/Sell/Hold)

### Portfolio (Protected)
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio/transaction` - Add transaction

### Watchlist (Protected)
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist?ticker=AAPL` - Remove from watchlist

## 🎯 Key Features Implemented

### ✅ Completed
1. ✅ Full authentication system with NextAuth
2. ✅ Green/black themed UI with CSS variables
3. ✅ Centralized Axios client with interceptors
4. ✅ MongoDB models (User, Portfolio, Watchlist)
5. ✅ All API routes with mock data
6. ✅ Reusable UI components (Button, Card, Modal, LoadingSpinner)
7. ✅ Dashboard with portfolio summary
8. ✅ Watchlist management
9. ✅ AI prediction feed
10. ✅ Portfolio page with performance graph
11. ✅ Holdings table
12. ✅ Add transaction modal
13. ✅ Framer Motion animations throughout
14. ✅ Responsive navigation
15. ✅ Protected routes with middleware

### 🚧 To Be Implemented

1. **Stock Detail Page** (`/stock/[ticker]`)
   - Stock header with live price
   - Main candlestick chart
   - Prediction module (prominent)
   - Technical indicators display

2. **Real Data Integration**
   - Replace mock data with yahoo-finance2
   - Integrate with external ML API
   - Connect MongoDB for real user data
   - Implement real-time price updates

3. **Additional Features**
   - Search functionality
   - Stock screener
   - News feed
   - Alerts and notifications
   - Export portfolio reports
   - Dark/light theme toggle (currently only dark)

## 🎨 UI Components

### Reusable Components
- **Button**: 4 variants (primary, secondary, danger, ghost), 3 sizes
- **Card**: Animated container with hover effects
- **Modal**: Backdrop + centered modal with animations
- **LoadingSpinner**: 3 sizes + skeleton loader
- **Navigation**: Fixed top nav with active states

### Page-Specific Components
- **PortfolioSummaryCard**: Shows total value, P/L, stats
- **Watchlist**: Add/remove stocks, price changes
- **PredictionFeed**: ML predictions with confidence bars
- **PerformanceGraph**: Line chart using Recharts
- **HoldingsTable**: Sortable table with click-through
- **AddTransactionModal**: Form for Buy/Sell transactions

## 🎭 Animations

All animations use Framer Motion:
- **Page transitions**: Fade + slide in
- **Loading states**: Skeleton loaders with shimmer effect
- **List stagger**: Sequential item animations
- **Hover effects**: Scale and translate transforms
- **Modal animations**: Scale + opacity
- **Button interactions**: whileTap and whileHover

## 🔒 Security

- Password hashing with bcrypt (12 rounds)
- JWT-based sessions
- Protected API routes with session validation
- CSRF protection via NextAuth
- HTTP-only cookies
- Environment variable management

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Flexible grid layouts
- Touch-friendly interactions
- Optimized table scrolling

## 🧪 Testing the Application

### 1. Create a Test User
```bash
# POST to /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 2. Login
- Visit `/auth/signin`
- Enter credentials
- Auto-redirect to `/dashboard`

### 3. Explore Features
- View portfolio summary
- Add stocks to watchlist
- Check AI predictions
- Navigate to portfolio
- Add a transaction

## 🛠️ Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Format code
npx prettier --write .
```

## 📝 Notes

### Current State
- **Frontend**: Fully functional with mock data
- **Backend**: All routes created with mock responses
- **Authentication**: Working with NextAuth v5
- **Database**: Models created, connection ready
- **Styling**: Complete green/black theme applied

### Next Steps
1. Replace mock data with real API calls
2. Integrate yahoo-finance2 for stock data
3. Connect external ML API for predictions
4. Build stock detail page
5. Add search functionality
6. Implement real-time updates with WebSockets

### Known Issues
- NextAuth session endpoint shows errors in terminal (functionality works)
- Stock detail page not yet created
- No real-time price updates yet
- ML predictions are mocked

## 🤝 Contributing

To add a new feature:

1. Create the API route in `src/app/api/`
2. Create the page in `src/app/[feature]/`
3. Build components in `src/components/[feature]/`
4. Use the existing UI components
5. Follow the green/black color scheme
6. Add Framer Motion animations
7. Ensure mobile responsiveness

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth Docs](https://authjs.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Mongoose](https://mongoosejs.com/)
- [Recharts](https://recharts.org/)
- [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2)

## 🎉 Success!

The application is now ready for development and testing. The foundation is solid with:
- ✅ Authentication system
- ✅ Database models
- ✅ API structure
- ✅ UI components
- ✅ Dashboard and Portfolio pages
- ✅ Animations and styling

**Next**: Implement the stock detail page and connect real data sources!
