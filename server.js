const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const leaveRoutes = require('./routes/leaves');
const reportRoutes = require('./routes/reports');

const app = express();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ==================== DATABASE CONNECTION ====================

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB Connected Successfully');
    initializeDefaultData();
})
.catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
});

// ==================== ROUTES ====================

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Workly API v2.0 - Production Ready',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            employees: '/api/employees',
            attendance: '/api/attendance',
            payroll: '/api/payroll',
            leaves: '/api/leaves',
            reports: '/api/reports'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/reports', reportRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ==================== INITIALIZE DEFAULT DATA ====================

async function initializeDefaultData() {
    const Company = require('./models/Company');
    const User = require('./models/User');
    
    try {
        const companyCount = await Company.countDocuments();
        
        if (companyCount === 0) {
            // Create default company
            const defaultCompany = await Company.create({
                name: 'Demo Company',
                email: 'demo@workly.com',
                phone: '+92-300-0000000',
                address: 'Karachi, Pakistan',
                subscriptionPlan: 'trial',
                subscriptionStatus: 'active',
                maxEmployees: 999999
            });
            
            // Create default admin user
            const defaultAdmin = await User.create({
                company: defaultCompany._id,
                name: 'Admin User',
                email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@workly.com',
                password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
                phone: '+92-300-1234567',
                designation: 'System Administrator',
                salary: 100000,
                role: 'admin',
                joinDate: new Date()
            });
            
            console.log('✅ Default company and admin user created');
            console.log(`📧 Admin Email: ${defaultAdmin.email}`);
            console.log(`🔑 Admin Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`);
        }
    } catch (error) {
        console.error('Error initializing default data:', error.message);
    }
}

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Workly Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});