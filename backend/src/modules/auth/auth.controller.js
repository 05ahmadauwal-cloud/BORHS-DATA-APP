const authService = require('./auth.service');
const ApiResponse = require('../../utils/apiResponse');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = async (req, res) => {
  const { firstName, lastName, email, phone, password, referralCode } = req.body;
  const result = await authService.register({ firstName, lastName, email, phone, password, referralCode });

  res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);
  res.cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

  return ApiResponse.created(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Account created successfully. Please verify your email.');
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const result = await authService.login(email, password, ipAddress);

  res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);
  res.cookie('refreshToken', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 30 * 24 * 60 * 60 * 1000 });

  return ApiResponse.success(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Login successful');
};

const logout = async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return ApiResponse.success(res, {}, 'Logged out successfully');
};

const verifyEmail = async (req, res) => {
  await authService.verifyEmail(req.params.token);
  return ApiResponse.success(res, {}, 'Email verified successfully');
};

const sendPhoneOTP = async (req, res) => {
  await authService.sendPhoneOTP(req.user._id);
  return ApiResponse.success(res, {}, 'OTP sent to your phone number');
};

const verifyPhoneOTP = async (req, res) => {
  await authService.verifyPhoneOTP(req.user._id, req.body.otp);
  return ApiResponse.success(res, {}, 'Phone number verified successfully');
};

const forgotPassword = async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return ApiResponse.success(res, {}, 'If an account exists with that email, a reset link has been sent.');
};

const resetPassword = async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  return ApiResponse.success(res, {}, 'Password reset successfully. Please log in.');
};

const changePassword = async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  return ApiResponse.success(res, {}, 'Password changed successfully');
};

const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) return ApiResponse.unauthorized(res, 'Refresh token required');
  const result = await authService.refreshAccessToken(token);
  res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);
  return ApiResponse.success(res, result, 'Token refreshed');
};

const getMe = async (req, res) => {
  return ApiResponse.success(res, { user: req.user.toPublicJSON() });
};

module.exports = { register, login, logout, verifyEmail, sendPhoneOTP, verifyPhoneOTP, forgotPassword, resetPassword, changePassword, refreshToken, getMe };
