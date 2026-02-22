const logger = require('./logger');

/**
 * Send email via Resend HTTP API (works on Render free tier where SMTP is blocked).
 * Falls back to nodemailer SMTP if RESEND_API_KEY is not configured (local dev).
 */
const sendEmail = async (to, subject, html) => {
    // ── Primary: Resend HTTP API ──────────────────────
    if (process.env.RESEND_API_KEY) {
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: `Eventify Pro <onboarding@resend.dev>`,
                    to: [to],
                    subject,
                    html
                })
            });

            const data = await res.json();

            if (!res.ok) {
                logger.error('Resend API error:', data);
                return false;
            }

            logger.info(`Email sent via Resend: ${data.id}`);
            return true;
        } catch (error) {
            logger.error('Resend send error:', error);
            return false;
        }
    }

    // ── Fallback: SMTP (local dev) ────────────────────
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('No email provider configured (set RESEND_API_KEY or SMTP_USER/SMTP_PASS)');
        return false;
    }

    try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 10000
        });

        const info = await transporter.sendMail({
            from: `Eventify Pro <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        logger.info(`Email sent via SMTP: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error('SMTP send error:', error);
        return false;
    }
};

module.exports = { sendEmail };
