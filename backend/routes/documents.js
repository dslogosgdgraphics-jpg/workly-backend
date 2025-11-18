const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const Document = require('../models/Document');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadFile, deleteFile } = require('../utils/fileUpload');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|xls|xlsx/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX'));
        }
    }
});

// Get all documents
router.get('/', protect, checkSubscription, async (req, res) => {
    try {
        const { category, employeeId } = req.query;
        
        let query = { company: req.user.company };
        
        if (req.user.role === 'employee') {
            query.$or = [
                { employee: req.user._id },
                { isConfidential: false, employee: null }
            ];
        } else {
            if (employeeId) {
                query.employee = employeeId;
            }
        }
        
        if (category) {
            query.category = category;
        }
        
        const documents = await Document.find(query)
            .populate('employee', 'name email designation')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching documents'
        });
    }
});

// Upload document
router.post('/upload', protect, checkSubscription, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }
        
        const { title, category, description, employeeId, expiryDate, isConfidential, tags } = req.body;
        
        // Upload file to cloud storage
        const fileUrl = await uploadFile(req.file);
        
        const document = await Document.create({
            company: req.user.company,
            employee: employeeId || null,
            title,
            category,
            fileName: req.file.originalname,
            fileUrl,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            description,
            uploadedBy: req.user._id,
            expiryDate,
            isConfidential: isConfidential === 'true',
            tags: tags ? JSON.parse(tags) : []
        });
        
        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error uploading document'
        });
    }
});

// Delete document
router.delete('/:id', protect, checkSubscription, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        
        // Check permission
        if (req.user.role === 'employee' && document.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this document'
            });
        }
        
        // Delete file from storage
        await deleteFile(document.fileUrl);
        
        await document.deleteOne();
        
        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting document'
        });
    }
});

// Acknowledge document
router.post('/:id/acknowledge', protect, checkSubscription, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        
        const alreadyAcknowledged = document.acknowledgments.some(
            ack => ack.employee.toString() === req.user._id.toString()
        );
        
        if (alreadyAcknowledged) {
            return res.status(400).json({
                success: false,
                message: 'Document already acknowledged'
            });
        }
        
        document.acknowledgments.push({
            employee: req.user._id,
            acknowledgedAt: new Date(),
            signature: req.body.signature
        });
        
        await document.save();
        
        res.json({
            success: true,
            message: 'Document acknowledged successfully',
            data: document
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error acknowledging document'
        });
    }
});

module.exports = router;