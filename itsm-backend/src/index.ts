import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import serviceRoutes from './routes/services';
import inquiryRoutes from './routes/inquiries';
import faqRoutes from './routes/faqs';
import faqIconRoutes from './routes/faqIcons';
import reportRoutes from './routes/reports';
import departmentRoutes from './routes/departments';
import serviceRequestRoutes from './routes/serviceRequests';
import currentStatusRoutes from './routes/currentStatuses';
import permissionRoutes from './routes/permissions';
import positionRoutes from './routes/positions';
import serviceTypeRoutes from './routes/serviceTypes';
import roleRoutes from './routes/roles';
import stageRoutes from './routes/stages';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ITSM Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/faq-icons', faqIconRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/current-statuses', currentStatusRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/service-types', serviceTypeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/stages', stageRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await db.connect();
    
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 ITSM Backend API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

startServer();
