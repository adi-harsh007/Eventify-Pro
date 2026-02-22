const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    connectionTimeout: 8000,  // 8s to connect
    greetingTimeout: 8000,    // 8s for SMTP greeting
    socketTimeout: 10000      // 10s total socket timeout
});

const sendEmail = async (to, subject, html) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('SMTP credentials not configured — skipping email send');
        return false;
    }
    try {
        const info = await transporter.sendMail({
            from: `Eventify Pro <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        logger.info(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendEmail };
