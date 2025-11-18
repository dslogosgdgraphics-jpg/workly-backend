const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        if (req.user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Your account is inactive. Please contact admin.'
            });
        }
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

exports.checkSubscription = async (req, res, next) => {
    try {
        const Company = require('../models/Company');
        const company = await Company.findById(req.user.company);
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }
        
        if (company.subscriptionStatus !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your subscription is inactive. Please renew to continue.'
            });
        }
        
        if (company.subscriptionEndDate && new Date() > company.subscriptionEndDate) {
            company.subscriptionStatus = 'inactive';
            await company.save();
            
            return res.status(403).json({
                success: false,
                message: 'Your subscription has expired. Please renew to continue.'
            });
        }
        
        req.company = company;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking subscription status'
        });
    }
};