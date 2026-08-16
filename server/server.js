import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { verifyShopifyAuthSimple } from './middleware/auth.js';

// Routes
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

// API Routes (all protected with Shopify auth)
app.use('/api/courses', verifyShopifyAuthSimple, courseRoutes);
app.use('/api/students', verifyShopifyAuthSimple, studentRoutes);
app.use('/api/enrollments', verifyShopifyAuthSimple, enrollmentRoutes);
app.use('/api/dashboard', verifyShopifyAuthSimple, dashboardRoutes);
app.use('/api/shop', verifyShopifyAuthSimple, shopifyRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
