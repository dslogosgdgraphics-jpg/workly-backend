const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// ============ MIDDLEWARE ============
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later'
});
app.use('/api/', limiter);

// ============ ROUTES ============
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/onboarding', require('./routes/onboarding'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/shifts', require('./routes/shifts'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/holidays', require('./routes/holidays'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'EmplyStack API is running',
        version: '2.0.0',
        timestamp: new Date()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to EmplyStack API',
        version: '2.0.0',
        docs: '/api/health'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`
🚀 EmplyStack API Server Running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Database: Connected
🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
        `);
    });
}).catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});