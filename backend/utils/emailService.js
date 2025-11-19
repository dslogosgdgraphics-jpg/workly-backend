const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    
    // Development: Use Ethereal (fake SMTP)
    // Or just log emails
    return null;
};

// Send email
exports.sendEmail = async (options) => {
    try {
        const transporter = createTransporter();
        
        if (!transporter) {
            console.log('📧 Email (not sent - no SMTP config):');
            console.log('To:', options.email);
            console.log('Subject:', options.subject);
            console.log('Message:', options.message);
            return true;
        }
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'EmplyStack <noreply@emplystack.com>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || options.message
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${options.email}`);
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

// Email templates
exports.templates = {
    welcome: (name, companyName, loginUrl) => ({
        subject: `Welcome to ${companyName}!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3B82F6;">Welcome to ${companyName}! 🎉</h1>
                <p>Hi ${name},</p>
                <p>Your account has been created successfully. You can now access the EmplyStack platform.</p>
                <a href="${loginUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Login to Your Account</a>
                <p>If you have any questions, feel free to reach out to your HR team.</p>
                <p>Best regards,<br>${companyName} Team</p>
            </div>
        `
    }),
    
    leaveApproved: (name, startDate, endDate) => ({
        subject: 'Leave Request Approved ✅',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10B981;">Leave Request Approved</h2>
                <p>Hi ${name},</p>
                <p>Good news! Your leave request has been approved.</p>
                <div style="background: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <strong>Duration:</strong> ${startDate} to ${endDate}
                </div>
                <p>Enjoy your time off!</p>
            </div>
        `
    }),
    
    leaveRejected: (name, reason) => ({
        subject: 'Leave Request Update',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #EF4444;">Leave Request Not Approved</h2>
                <p>Hi ${name},</p>
                <p>Unfortunately, your leave request could not be approved at this time.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>Please contact your manager for more details.</p>
            </div>
        `
    }),
    
    payslip: (name, month, amount, downloadUrl) => ({
        subject: `Payslip for ${month}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3B82F6;">Payslip Generated</h2>
                <p>Hi ${name},</p>
                <p>Your payslip for ${month} is now available.</p>
                <div style="background: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <strong>Net Salary:</strong> ${amount}
                </div>
                <a href="${downloadUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Download Payslip</a>
            </div>
        `
    })
};
