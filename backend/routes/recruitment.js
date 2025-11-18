const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const Applicant = require('../models/Applicant');
const JobPosting = require('../models/JobPosting');
const { protect, authorize, checkSubscription } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { uploadFile } = require('../utils/fileUpload');
const { sendEmail, templates } = require('../utils/emailService');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        if (extname) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOC files allowed'));
        }
    }
});

// ========== JOB POSTINGS ==========

// Get all job postings
router.get('/jobs', protect, checkSubscription, async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = { company: req.user.company };
        if (status) query.status = status;
        
        const jobs = await JobPosting.find(query)
            .populate('department', 'name')
            .populate('hiringManager', 'name email')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching job postings'
        });
    }
});

// Get public job postings (no auth required)
router.get('/jobs/public', async (req, res) => {
    try {
        const jobs = await JobPosting.find({
            status: 'open',
            isPublic: true
        })
        .select('-company -__v')
        .sort({ publishedDate: -1 });
        
        res.json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching job postings'
        });
    }
});

// Get single job posting by slug (public)
router.get('/jobs/public/:slug', async (req, res) => {
    try {
        const job = await JobPosting.findOne({
            slug: req.params.slug,
            status: 'open',
            isPublic: true
        });
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }
        
        // Increment view count
        job.viewCount += 1;
        await job.save();
        
        res.json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching job posting'
        });
    }
});

// Create job posting
router.post('/jobs', protect, authorize('admin'), checkSubscription, [
    body('title').notEmpty().withMessage('Job title is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('employmentType').isIn(['full-time', 'part-time', 'contract', 'internship', 'temporary']).withMessage('Invalid employment type'),
    body('experienceLevel').isIn(['entry', 'mid', 'senior', 'lead', 'executive']).withMessage('Invalid experience level'),
    body('description').notEmpty().withMessage('Job description is required'),
    validate
], async (req, res) => {
    try {
        const job = await JobPosting.create({
            company: req.user.company,
            ...req.body
        });
        
        res.status(201).json({
            success: true,
            message: 'Job posting created successfully',
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating job posting'
        });
    }
});

// Update job posting
router.put('/jobs/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const job = await JobPosting.findOneAndUpdate(
            { _id: req.params.id, company: req.user.company },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Job posting updated successfully',
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating job posting'
        });
    }
});

// Publish job posting
router.put('/jobs/:id/publish', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const job = await JobPosting.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }
        
        job.status = 'open';
        job.publishedDate = new Date();
        await job.save();
        
        res.json({
            success: true,
            message: 'Job posting published successfully',
            data: job
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error publishing job posting'
        });
    }
});

// Delete job posting
router.delete('/jobs/:id', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const job = await JobPosting.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }
        
        await job.deleteOne();
        
        res.json({
            success: true,
            message: 'Job posting deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting job posting'
        });
    }
});

// ========== APPLICANTS ==========

// Get all applicants
router.get('/applicants', protect, checkSubscription, async (req, res) => {
    try {
        const { jobId, stage, status } = req.query;
        
        let query = { company: req.user.company };
        if (jobId) query.jobPosting = jobId;
        if (stage) query.stage = stage;
        if (status) query.status = status;
        
        const applicants = await Applicant.find(query)
            .populate('jobPosting', 'title location')
            .populate('referredBy', 'name')
            .populate('interviews.interviewer', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: applicants.length,
            data: applicants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching applicants'
        });
    }
});

// Submit application (public - no auth)
router.post('/apply/:jobSlug', upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 }
]), async (req, res) => {
    try {
        const job = await JobPosting.findOne({
            slug: req.params.jobSlug,
            status: 'open'
        });
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found or closed'
            });
        }
        
        if (!req.files || !req.files.resume) {
            return res.status(400).json({
                success: false,
                message: 'Resume is required'
            });
        }
        
        // Check if already applied
        const existing = await Applicant.findOne({
            company: job.company,
            jobPosting: job._id,
            email: req.body.email.toLowerCase()
        });
        
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this position'
            });
        }
        
        // Upload resume
        const resumeUrl = await uploadFile(req.files.resume[0]);
        
        // Upload cover letter if provided
        let coverLetterUrl = null;
        if (req.files.coverLetter) {
            coverLetterUrl = await uploadFile(req.files.coverLetter[0]);
        }
        
        // Create applicant
        const applicant = await Applicant.create({
            company: job.company,
            jobPosting: job._id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email.toLowerCase(),
            phone: req.body.phone,
            resumeUrl,
            coverLetterUrl,
            linkedIn: req.body.linkedIn,
            portfolio: req.body.portfolio,
            source: req.body.source || 'website',
            skills: req.body.skills ? JSON.parse(req.body.skills) : [],
            experience: req.body.experience,
            expectedSalary: req.body.expectedSalary,
            currentCompany: req.body.currentCompany,
            currentDesignation: req.body.currentDesignation,
            stage: 'applied',
            status: 'active'
        });
        
        // Update job application count
        job.applicationCount += 1;
        await job.save();
        
        // Send confirmation email
        await sendEmail({
            email: applicant.email,
            subject: `Application Received - ${job.title}`,
            html: `
                <h2>Thank you for applying!</h2>
                <p>Hi ${applicant.firstName},</p>
                <p>We have received your application for the position of <strong>${job.title}</strong>.</p>
                <p>Our team will review your application and get back to you soon.</p>
                <p>Best regards,<br>Hiring Team</p>
            `
        });
        
        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: applicant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error submitting application'
        });
    }
});

// Update applicant stage
router.put('/applicants/:id/stage', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const { stage, notes } = req.body;
        
        const applicant = await Applicant.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }
        
        applicant.stage = stage;
        
        if (notes) {
            applicant.notes.push({
                author: req.user._id,
                content: notes,
                createdAt: new Date()
            });
        }
        
        await applicant.save();
        
        res.json({
            success: true,
            message: 'Applicant stage updated',
            data: applicant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating applicant stage'
        });
    }
});

// Schedule interview
router.post('/applicants/:id/interview', protect, authorize('admin'), checkSubscription, [
    body('round').isIn(['screening', 'technical', 'hr', 'final', 'other']).withMessage('Invalid interview round'),
    body('scheduledDate').isISO8601().withMessage('Valid date is required'),
    body('interviewer').notEmpty().withMessage('Interviewer is required'),
    validate
], async (req, res) => {
    try {
        const applicant = await Applicant.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }
        
        applicant.interviews.push({
            round: req.body.round,
            scheduledDate: req.body.scheduledDate,
            interviewer: req.body.interviewer,
            meetingLink: req.body.meetingLink,
            notes: req.body.notes,
            status: 'scheduled'
        });
        
        applicant.stage = 'interview';
        await applicant.save();
        
        // Send email to applicant
        await sendEmail({
            email: applicant.email,
            subject: `Interview Scheduled - ${req.body.round}`,
            html: `
                <h2>Interview Scheduled</h2>
                <p>Hi ${applicant.firstName},</p>
                <p>Your interview has been scheduled:</p>
                <ul>
                    <li><strong>Round:</strong> ${req.body.round}</li>
                    <li><strong>Date:</strong> ${new Date(req.body.scheduledDate).toLocaleString()}</li>
                    ${req.body.meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${req.body.meetingLink}">${req.body.meetingLink}</a></li>` : ''}
                </ul>
                <p>Good luck!</p>
            `
        });
        
        res.json({
            success: true,
            message: 'Interview scheduled successfully',
            data: applicant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error scheduling interview'
        });
    }
});

// Reject applicant
router.put('/applicants/:id/reject', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const applicant = await Applicant.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }
        
        applicant.stage = 'rejected';
        applicant.status = 'rejected';
        applicant.rejectionReason = req.body.reason;
        applicant.rejectedAt = new Date();
        applicant.rejectedBy = req.user._id;
        
        await applicant.save();
        
        // Send rejection email
        if (req.body.sendEmail !== false) {
            await sendEmail({
                email: applicant.email,
                subject: 'Application Status Update',
                html: `
                    <p>Hi ${applicant.firstName},</p>
                    <p>Thank you for your interest in our company. After careful consideration, we have decided to move forward with other candidates for this position.</p>
                    <p>We appreciate the time you invested in the application process and wish you the best in your job search.</p>
                    <p>Best regards,<br>Hiring Team</p>
                `
            });
        }
        
        res.json({
            success: true,
            message: 'Applicant rejected',
            data: applicant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting applicant'
        });
    }
});

// Make offer
router.put('/applicants/:id/offer', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const applicant = await Applicant.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }
        
        applicant.stage = 'offer';
        applicant.offerDetails = {
            offeredSalary: req.body.offeredSalary,
            joiningDate: req.body.joiningDate,
            offerSentDate: new Date()
        };
        
        await applicant.save();
        
        res.json({
            success: true,
            message: 'Offer sent successfully',
            data: applicant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending offer'
        });
    }
});

// Add notes
router.post('/applicants/:id/notes', protect, authorize('admin'), checkSubscription, async (req, res) => {
    try {
        const applicant = await Applicant.findOne({
            _id: req.params.id,
            company: req.user.company
        });
        
        if (!applicant) {
            return res.status(404).json({
                success: false,
                message: 'Applicant not found'
            });
        }
        
        applicant.notes.push({
            author: req.user._id,
            content: req.body.content,
            isPrivate: req.body.isPrivate || false,
            createdAt: new Date()
        });
        
        await applicant.save();
        
        res.json({
            success: true,
            message: 'Note added successfully',
            data: applicant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding note'
        });
    }
});

module.exports = router;