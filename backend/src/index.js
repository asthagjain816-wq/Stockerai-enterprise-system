const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const dns = require('dns');
const MongoStore = require('connect-mongo');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
dns.setDefaultResultOrder('ipv4first');
require('dotenv').config();

// Debug - Check if Google OAuth is configured
console.log('🔍 Google CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not Set');
console.log('🔍 Google SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not Set');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const supplierRoutes = require('./routes/suppliers');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Dynamic CORS origin configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'https://stockerai-enterprise-system.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
].filter(Boolean).flatMap(url => url.split(',').map(s => s.trim()));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ MongoDB Connected');
    try {
      await mongoose.connection.collection('users').dropIndex('googleId_1');
      console.log('🧹 Cleaned up legacy googleId_1 index');
    } catch (e) {
      // Index already dropped or doesn't exist
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  });

// Trust proxy (required for secure cookies behind reverse proxies like Render)
app.set('trust proxy', 1);

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'my_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // 14 days session lifespan
  }),
  cookie: { 
    httpOnly: true, 
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction
  },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server running' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use by another process.`);
    console.error(`👉 Solution: Please close the existing backend process running on port ${PORT} or run 'Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force' in PowerShell.`);
    process.exit(1);
  } else {
    console.error('❌ Server Error:', err);
  }
});

module.exports = app;