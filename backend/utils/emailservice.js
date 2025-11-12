// Email service placeholder
// To enable emails, install nodemailer and configure SMTP

const sendEmail = async (options) => {
    console.log('Email would be sent to:', options.email);
    console.log('Subject:', options.subject);
    // Implement nodemailer here when needed
    return true;
};

const emailTemplates = {
    welcome: (name, companyName) => `Welcome ${name} to ${companyName}!`,
    leaveApproved: (name, startDate, endDate) => `Leave approved for ${name}`,
    payslipGenerated: (name, month, salary) => `Payslip for ${month} ready`
};

module.exports = {
    sendEmail,
    emailTemplates
};