import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { verifyShopifyAuth, verifyShopifyAuthSimple } from './middleware/auth.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import shopifyRoutes from './routes/shopifyRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Auth Routes (no auth middleware - handles installation)
app.use('/api', authRoutes);

// Choose authentication middleware based on environment
// In production: always use session token validation
// In development: can use simple auth for easier testing
const authMiddleware = process.env.NODE_ENV === 'production' 
  ? verifyShopifyAuth 
  : verifyShopifyAuthSimple;

// API Routes (all protected with Shopify auth)
app.use('/api/courses', authMiddleware, courseRoutes);
app.use('/api/students', authMiddleware, studentRoutes);
app.use('/api/enrollments', authMiddleware, enrollmentRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/shop', authMiddleware, shopifyRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
