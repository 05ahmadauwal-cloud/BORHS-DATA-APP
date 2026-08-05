const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Notification = require('../../models/Notification');
const { generateOTP, generateReferralCode, sanitizePhone } = require('../../utils/helpers');
const { sendEmail } = require('../../services/emailService');
const { sendSMS, SMS_TEMPLATES } = require('../../services/smsService');
const logger = require('../../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

const register = async (data) => {
  const { firstName, lastName, email, phone, password, referralCode, username } = data;

  const normalizedPhone = sanitizePhone(phone);

  const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone: normalizedPhone }] });
  if (existingUser) {
    const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone number';
    throw Object.assign(new Error(`An account with this ${field} already exists`), { statusCode: 409 });
  }

  if (username) {
    const taken = await User.findOne({ username: username.toLowerCase() });
    if (taken) throw Object.assign(new Error('Username is already taken'), { statusCode: 409 });
  }

  let referrer = null;
  if (referralCode) {
    referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
  }

  const newReferralCode = generateReferralCode(firstName);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone: normalizedPhone,
    password,
    username: username ? username.toLowerCase() : undefined,
    referralCode: newReferralCode,
    referredBy: referrer?._id || null,
    kycStatus: 'tier1',
    emailVerificationToken: hashedToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  if (referrer) {
    const { processReferral } = require('../referral/referral.service');
    await processReferral(user._id, referrer._id).catch((e) =>
      logger.error('Referral process error:', e)
    );
  }

  // Create Monnify virtual account (non-blocking — doesn't fail registration)
  if (process.env.MONNIFY_API_KEY && process.env.MONNIFY_CONTRACT_CODE) {
    const { createReservedAccount } = require('../../services/monnify');
    createReservedAccount(user)
      .then((va) => User.findByIdAndUpdate(user._id, { monnifyVirtualAccount: va }))
      .catch((e) => logger.error('Monnify reserved account creation failed:', e.response?.data || e.message));
  }

  const clientUrl = process.env.NODE_ENV === 'production'
    ? (process.env.PRODUCTION_URL || process.env.CLIENT_URL)
    : process.env.CLIENT_URL;
  const verificationLink = `${clientUrl}/verify-email/${verificationToken}`;
  await sendEmail(user.email, 'welcome', {
    firstName: user.firstName,
    verificationLink,
  });

  const { accessToken, refreshToken } = generateTokens(user._id);
  return { user: user.toPublicJSON(), accessToken, refreshToken };
};

const login = async (identifier, password, ipAddress) => {
  const isEmail = identifier.includes('@');
  const user = await User.findOne(
    isEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier.toLowerCase() }
  ).select('+password');

  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  if (user.isLocked) {
    throw Object.assign(new Error('Account locked due to too many failed attempts. Try again in 2 hours.'), { statusCode: 423 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Your account has been suspended. Contact support.'), { statusCode: 403 });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  await User.findByIdAndUpdate(user._id, {
    $set: { loginAttempts: 0, lastLogin: Date.now(), lastLoginIP: ipAddress },
    $unset: { lockUntil: 1 },
  });

  const { accessToken, refreshToken } = generateTokens(user._id);
  return { user: user.toPublicJSON(), accessToken, refreshToken };
};

const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid or expired verification link'), { statusCode: 400 });
  }

  await User.findByIdAndUpdate(user._id, {
    isEmailVerified: true,
    $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
  });

  return user;
};

const sendPhoneOTP = async (userId) => {
  const otp = generateOTP();
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findByIdAndUpdate(userId, {
    phoneOTP: hashedOTP,
    phoneOTPExpires: Date.now() + 10 * 60 * 1000,
  }).select('phone firstName');

  await sendSMS(user.phone, SMS_TEMPLATES.otp(otp));
  return true;
};

const verifyPhoneOTP = async (userId, otp) => {
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  const user = await User.findOne({
    _id: userId,
    phoneOTP: hashedOTP,
    phoneOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });
  }

  await User.findByIdAndUpdate(userId, {
    isPhoneVerified: true,
    $unset: { phoneOTP: 1, phoneOTPExpires: 1 },
  });

  return true;
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return true; // Silently succeed to prevent email enumeration

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  await User.findByIdAndUpdate(user._id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: Date.now() + 60 * 60 * 1000,
  });

  const clientUrl = process.env.NODE_ENV === 'production'
    ? (process.env.PRODUCTION_URL || process.env.CLIENT_URL)
    : process.env.CLIENT_URL;
  const resetLink = `${clientUrl}/reset-password/${resetToken}`;
  try {
    await sendEmail(user.email, 'passwordReset', {
      firstName: user.firstName,
      resetLink,
    });
  } catch (e) {
    logger.error('Password reset email failed:', e.message || e);
    // Intentionally do not rethrow to keep the forgot-password endpoint opaque
  }

  return true;
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid or expired reset link'), { statusCode: 400 });
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return true;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!await user.comparePassword(currentPassword)) {
    throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  }
  user.password = newPassword;
  await user.save();
  return true;
};

const refreshAccessToken = async (refreshToken) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }
  const { accessToken } = generateTokens(user._id);
  return { accessToken };
};

module.exports = {
  register,
  login,
  verifyEmail,
  sendPhoneOTP,
  verifyPhoneOTP,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshAccessToken,
  generateTokens,
};
