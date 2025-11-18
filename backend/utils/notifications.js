const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

// Create notification for single or multiple users
exports.createNotification = async ({
    company,
    recipient,
    targetAudience,
    departments,
    specificEmployees,
    type,
    title,
    message,
    link,
    icon,
    priority = 'medium',
    relatedModel,
    relatedId,
    sendEmailNotification = false
}) => {
    try {
        let recipients = [];
        
        if (recipient) {
            // Single recipient
            recipients = [recipient];
        } else if (targetAudience) {
            // Multiple recipients based on target
            let query = { company, status: 'active' };
            
            if (targetAudience === 'department' && departments && departments.length > 0) {
                query.department = { $in: departments };
            } else if (targetAudience === 'specific' && specificEmployees && specificEmployees.length > 0) {
                query._id = { $in: specificEmployees };
            }
            // For 'all', no additional filter needed
            
            const users = await User.find(query).select('_id email name');
            recipients = users.map(u => u._id);
            
            // Optional: Send email notifications
            if (sendEmailNotification) {
                for (const user of users) {
                    await sendEmail({
                        email: user.email,
                        subject: title,
                        message: message,
                        html: `
                            <div style="font-family: Arial, sans-serif; padding: 20px;">
                                <h2>${title}</h2>
                                <p>${message}</p>
                                ${link ? `<a href="${process.env.FRONTEND_URL}${link}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Details</a>` : ''}
                            </div>
                        `
                    });
                }
            }
        }
        
        // Create notifications
        const notifications = recipients.map(recipientId => ({
            company,
            recipient: recipientId,
            type,
            title,
            message,
            link,
            icon,
            priority,
            relatedModel,
            relatedId
        }));
        
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
        
        return notifications;
    } catch (error) {
        console.error('Create notification error:', error);
        return [];
    }
};

// Send notification to specific user
exports.notifyUser = async (userId, type, title, message, link = null) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;
        
        return await exports.createNotification({
            company: user.company,
            recipient: userId,
            type,
            title,
            message,
            link
        });
    } catch (error) {
        console.error('Notify user error:', error);
        return null;
    }
};

// Birthday & Anniversary checker (run daily via cron)
exports.checkBirthdaysAndAnniversaries = async () => {
    try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        
        // Find birthdays (you'd need to add birthdate field to User model)
        // const birthdayUsers = await User.find({ ... });
        
        // Find work anniversaries
        const users = await User.find({
            status: 'active',
            $expr: {
                $and: [
                    { $eq: [{ $month: '$joinDate' }, month] },
                    { $eq: [{ $dayOfMonth: '$joinDate' }, day] }
                ]
            }
        }).populate('company');
        
        for (const user of users) {
            const yearsOfService = today.getFullYear() - new Date(user.joinDate).getFullYear();
            
            // Notify the user
            await exports.createNotification({
                company: user.company._id,
                recipient: user._id,
                type: 'work-anniversary',
                title: `🎉 Work Anniversary!`,
                message: `Congratulations on completing ${yearsOfService} years with ${user.company.name}!`,
                priority: 'high'
            });
            
            // Notify all employees
            await exports.createNotification({
                company: user.company._id,
                targetAudience: 'all',
                type: 'work-anniversary',
                title: `🎉 Celebrate ${user.name}!`,
                message: `${user.name} is celebrating ${yearsOfService} years with us today!`,
                priority: 'low'
            });
        }
    } catch (error) {
        console.error('Birthday/Anniversary check error:', error);
    }
};