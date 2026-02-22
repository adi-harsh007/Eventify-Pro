const logger = require('./logger');

/**
 * Send email via HTTP API.
 * Priority:  Brevo (free, any recipient) → Resend → SMTP (local dev).
 */
const sendEmail = async (to, subject, html) => {

    // ── 1. Brevo HTTP API (recommended – no recipient restrictions) ──
    if (process.env.BREVO_API_KEY) {
        try {
            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender: {
                        name: 'Eventify Pro',
                        email: process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@eventifypro.com'
                    },
                    to: [{ email: to }],
                    subject,
                    htmlContent: html
                })
            });

            const data = await res.json();

            if (!res.ok) {
                logger.error('Brevo API error:', JSON.stringify(data));
                return false;
            }

            logger.info(`Email sent via Brevo: messageId=${data.messageId}`);
            return true;
        } catch (error) {
            logger.error('Brevo send error:', error.message);
            return false;
        }
    }

    // ── 2. Resend HTTP API (needs verified domain for arbitrary recipients) ──
    if (process.env.RESEND_API_KEY) {
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Eventify Pro <onboarding@resend.dev>',
                    to: [to],
                    subject,
                    html
                })
            });

            const data = await res.json();

            if (!res.ok) {
                logger.error('Resend API error:', JSON.stringify(data));
                return false;
            }

            logger.info(`Email sent via Resend: ${data.id}`);
            return true;
        } catch (error) {
            logger.error('Resend send error:', error.message);
            return false;
        }
    }

    // ── 3. SMTP fallback (local dev only – blocked on Render free tier) ──
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('No email provider configured (set BREVO_API_KEY, RESEND_API_KEY, or SMTP creds)');
        return false;
    }

    try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 10000
        });

        const info = await transporter.sendMail({
            from: `Eventify Pro <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to, subject, html
        });
        logger.info(`Email sent via SMTP: ${info.messageId}`);
        return true;
    } catch (error) {
        logger.error('SMTP send error:', error.message);
        return false;
    }
};

module.exports = { sendEmail };
