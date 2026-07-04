const logger = require('../utils/logger');
let resendClient = null;
const getResendClient = () => {
  if (resendClient) return resendClient;
  try {
    const Resend = require('resend');
    // Resend constructor accepts the API key directly
    resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
  } catch (e) {
    logger.error('Resend client init failed:', e.message);
    return null;
  }
};

const testConnection = async () => {
  const client = getResendClient();
  if (!client) throw new Error('RESEND_API_KEY not configured or invalid');
  // Resend doesn't expose a lightweight verify; return basic config info instead
  return {
    ok: true,
    provider: 'resend',
    from: process.env.RESEND_FROM || process.env.EMAIL_FROM || null,
  };
};

const emailTemplates = {
  welcome: (data) => ({
    subject: `Welcome to ${process.env.APP_NAME || 'BORHS Data'}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #fff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2563EB; font-size: 28px; margin: 0;">BORHS Data</h1>
        </div>
        <h2 style="color: #10B981;">Welcome, ${data.firstName}!</h2>
        <p style="color: #94a3b8;">Your account has been created successfully. You can now purchase data, airtime, pay bills and more at the best rates.</p>
        ${data.verificationLink ? `
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.verificationLink}" style="background: #2563EB; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">Or copy this link: ${data.verificationLink}</p>
        ` : ''}
        <p style="color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px;">
          If you didn't create this account, please ignore this email or contact ${process.env.SUPPORT_EMAIL}.
        </p>
      </div>
    `,
  }),

  emailVerification: (data) => ({
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #2563EB;">Email Verification</h1>
        <p style="color: #94a3b8;">Hi ${data.firstName}, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.verificationLink}" style="background: #2563EB; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link expires in 24 hours.</p>
      </div>
    `,
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #2563EB;">Reset Your Password</h1>
        <p style="color: #94a3b8;">Hi ${data.firstName}, you requested a password reset. Click below to set a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.resetLink}" style="background: #EF4444; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore.</p>
      </div>
    `,
  }),

  otp: (data) => ({
    subject: `Your OTP: ${data.otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #2563EB;">Verification Code</h1>
        <p style="color: #94a3b8;">Hi ${data.firstName}, your one-time password is:</p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 48px; font-weight: bold; color: #10B981; letter-spacing: 12px;">${data.otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes. Do not share this code with anyone.</p>
      </div>
    `,
  }),

  transactionAlert: (data) => ({
    subject: `Transaction Alert: ${data.type} - ₦${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="color: #2563EB;">Transaction Alert</h1>
        <p style="color: #94a3b8;">Hi ${data.firstName},</p>
        <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; color: #94a3b8;">
            <tr><td>Type:</td><td style="color: #fff; text-align: right;">${data.type}</td></tr>
            <tr><td>Amount:</td><td style="color: #10B981; text-align: right; font-weight: bold;">₦${data.amount}</td></tr>
            <tr><td>Reference:</td><td style="color: #fff; text-align: right; font-family: monospace;">${data.reference}</td></tr>
            <tr><td>Status:</td><td style="color: ${data.status === 'success' ? '#10B981' : '#EF4444'}; text-align: right;">${data.status.toUpperCase()}</td></tr>
            <tr><td>Balance:</td><td style="color: #fff; text-align: right;">₦${data.balance}</td></tr>
            <tr><td>Date:</td><td style="color: #fff; text-align: right;">${data.date}</td></tr>
          </table>
        </div>
        <p style="color: #64748b; font-size: 12px;">If you did not authorize this transaction, contact ${process.env.SUPPORT_EMAIL} immediately.</p>
      </div>
    `,
  }),
};

const sendEmail = async (to, templateName, data) => {
  try {
    const client = getResendClient();
    const template = emailTemplates[templateName]?.(data);
    if (!template) {
      logger.error(`Email template '${templateName}' not found`);
      return false;
    }
    if (!client) {
      logger.error('Resend client not configured');
      return false;
    }

    const from = process.env.RESEND_FROM || `${process.env.EMAIL_FROM_NAME || process.env.APP_NAME || 'BORHS Data'} <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`;

    await client.emails.send({
      from,
      to,
      subject: template.subject,
      html: template.html,
    });

    logger.info(`Email sent to ${to} - template: ${templateName}`);
    return true;
  } catch (error) {
    logger.error(`Email send failed to ${to}: ${error.message}`);
    return false;
  }
};

module.exports = { sendEmail, testConnection };
