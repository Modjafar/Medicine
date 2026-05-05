const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Email Service for sending notifications
 * Uses Gmail SMTP with Nodemailer
 */

// Initialize transporter (Gmail SMTP)
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Use App Password for Gmail (not regular password)
        },
    });
};

/**
 * Send family member invitation email
 * @param {string} familyMemberEmail - Email of the family member being invited
 * @param {string} familyMemberName - Name of the family member
 * @param {string} adminName - Name of the admin/user sending invitation
 * @param {string} adminEmail - Email of the admin (optional, for signature)
 * @returns {Promise<boolean>} - true if sent successfully, false otherwise
 */
const sendInviteEmail = async (familyMemberEmail, familyMemberName, adminName, adminEmail = '') => {
    try {
        // Validate inputs
        if (!familyMemberEmail || !familyMemberName || !adminName) {
            logger.warn('Invalid email parameters provided', {
                familyMemberEmail,
                familyMemberName,
                adminName,
            });
            return false;
        }

        // Check if email service is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            logger.warn('Email service not configured. EMAIL_USER or EMAIL_PASS not set in environment variables.');
            return false;
        }

        const transporter = createTransporter();

        // Email HTML Template
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>MediTrack - Family Member Invitation</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 600;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        font-size: 14px;
                        opacity: 0.9;
                    }
                    .content {
                        padding: 30px;
                        color: #333;
                    }
                    .content h2 {
                        color: #667eea;
                        margin-top: 0;
                    }
                    .greeting {
                        font-size: 16px;
                        margin-bottom: 20px;
                        line-height: 1.6;
                    }
                    .message-box {
                        background: #f9f9f9;
                        border-left: 4px solid #667eea;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .cta-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 14px 32px;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: 600;
                        margin: 20px 0;
                        text-align: center;
                        transition: transform 0.2s;
                    }
                    .cta-button:hover {
                        transform: translateY(-2px);
                    }
                    .details {
                        background: #f0f4ff;
                        padding: 15px;
                        border-radius: 6px;
                        margin: 15px 0;
                        font-size: 14px;
                    }
                    .details-row {
                        display: flex;
                        margin: 8px 0;
                    }
                    .details-label {
                        font-weight: 600;
                        width: 120px;
                        color: #667eea;
                    }
                    .details-value {
                        flex: 1;
                    }
                    .footer {
                        background: #f5f5f5;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #e0e0e0;
                    }
                    .footer a {
                        color: #667eea;
                        text-decoration: none;
                    }
                    .footer p {
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <h1>MediTrack</h1>
                        <p>Your Personal Medicine Reminder System</p>
                    </div>

                    <!-- Content -->
                    <div class="content">
                        <h2>You've Been Invited to MediTrack! 🎉</h2>
                        
                        <div class="greeting">
                            <p>Hi <strong>${familyMemberName}</strong>,</p>
                            <p><strong>${adminName}</strong> has invited you to join their family care circle on <strong>MediTrack</strong>.</p>
                        </div>

                        <div class="message-box">
                            <p><strong>What is MediTrack?</strong></p>
                            <p>MediTrack is a comprehensive medicine reminder and family health management system. It helps you:</p>
                            <ul>
                                <li>📱 Get timely medicine reminders</li>
                                <li>👨‍👩‍👧‍👦 Share health information with family members</li>
                                <li>📊 Track medicine history and effectiveness</li>
                                <li>⏰ Never miss a dose again</li>
                            </ul>
                        </div>

                        <!-- User Details -->
                        <div class="details">
                            <div class="details-row">
                                <span class="details-label">Your Name:</span>
                                <span class="details-value">${familyMemberName}</span>
                            </div>
                            <div class="details-row">
                                <span class="details-label">Added by:</span>
                                <span class="details-value">${adminName}</span>
                            </div>
                            ${adminEmail ? `<div class="details-row">
                                <span class="details-label">Contact:</span>
                                <span class="details-value">${adminEmail}</span>
                            </div>` : ''}
                            <div class="details-row">
                                <span class="details-label">Invitation Date:</span>
                                <span class="details-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>

                        <p><strong>Next Steps:</strong></p>
                        <ol>
                            <li>Visit the MediTrack website</li>
                            <li>Sign up or log in with your email</li>
                            <li>Accept the invitation from ${adminName}</li>
                            <li>Start managing your medicines!</li>
                        </ol>

                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/register" class="cta-button">Accept Invitation & Register</a>
                        </p>

                        <div class="message-box" style="background: #fffbeb; border-left-color: #f59e0b;">
                            <p><strong>⚠️ Note:</strong> This invitation is specifically for you. Do not share this email with others.</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p><strong>Questions?</strong> Contact your admin at ${adminEmail || 'their provided email'}</p>
                        <p>&copy; 2026 MediTrack. All rights reserved.</p>
                        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Visit MediTrack</a></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Plain text version
        const textContent = `
Hi ${familyMemberName},

${adminName} has invited you to join MediTrack - your personal medicine reminder system.

MediTrack helps you:
- Get timely medicine reminders
- Share health information with family
- Track medicine history
- Never miss a dose

Next Steps:
1. Visit: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/register
2. Sign up with your email
3. Accept the invitation from ${adminName}
4. Start managing your medicines!

If you have any questions, contact ${adminName} at ${adminEmail || 'their email'}.

Best regards,
MediTrack Team
        `;

        // Send email
        const mailOptions = {
            from: `MediTrack <${process.env.EMAIL_USER}>`,
            to: familyMemberEmail,
            subject: `${adminName} invited you to MediTrack - Medicine Reminder System`,
            text: textContent,
            html: htmlContent,
            replyTo: adminEmail || process.env.EMAIL_USER,
        };

        const info = await transporter.sendMail(mailOptions);

        logger.info('Invitation email sent successfully', {
            to: familyMemberEmail,
            messageId: info.messageId,
            response: info.response,
        });

        return true;
    } catch (error) {
        logger.error('Failed to send invitation email', {
            error: error.message,
            familyMemberEmail,
            familyMemberName,
            stack: error.stack,
        });
        return false;
    }
};

/**
 * Test email configuration (useful for debugging)
 * @returns {Promise<boolean>} - true if configuration is valid
 */
const testEmailConfiguration = async () => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            logger.error('Email not configured. EMAIL_USER or EMAIL_PASS missing.');
            return false;
        }

        const transporter = createTransporter();
        await transporter.verify();

        logger.info('Email configuration verified successfully');
        return true;
    } catch (error) {
        logger.error('Email configuration verification failed', {
            error: error.message,
            hint: 'Make sure to use Gmail App Password (not regular password). Enable "Less Secure App Access" or use 2FA with App Password.',
        });
        return false;
    }
};

module.exports = {
    sendInviteEmail,
    testEmailConfiguration,
};
