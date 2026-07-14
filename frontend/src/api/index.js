import api from './axios';

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendEmailVerification: () => api.post('/auth/resend-email-verification'),
  sendPhoneOTP: () => api.post('/auth/send-phone-otp'),
  verifyPhoneOTP: (otp) => api.post('/auth/verify-phone-otp', { otp }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.post('/auth/change-password', data),
  updateUsername: (username) => api.patch('/auth/username', { username }),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Wallet
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  transfer: (data) => api.post('/wallet/transfer', data),
  setPin: (pin) => api.post('/wallet/set-pin', { pin }),
  resetPin: (password, newPin) => api.post('/wallet/reset-pin', { password, newPin }),
};

// Payment
export const paymentAPI = {
  initializePaystack: (amount) => api.post('/payment/paystack/initialize', { amount }),
  verifyPaystack: (reference) => api.get(`/payment/paystack/verify/${reference}`),
  initializeFlutterwave: (amount) => api.post('/payment/flutterwave/initialize', { amount }),
  verifyFlutterwave: (transactionId) => api.get(`/payment/flutterwave/verify/${transactionId}`),
  getVirtualAccount: () => api.get('/payment/virtual-account'),
};

// Data
export const dataAPI = {
  getPlans: (params) => api.get('/data/plans', { params }),
  purchase: (data) => api.post('/data/purchase', data),
  getHistory: (params) => api.get('/data/history', { params }),
};

// Airtime
export const airtimeAPI = {
  purchase: (data) => api.post('/airtime/purchase', data),
  purchaseBulk: (recipients) => api.post('/airtime/purchase/bulk', { recipients }),
  getHistory: (params) => api.get('/airtime/history', { params }),
};

// Electricity
export const electricityAPI = {
  verifyMeter: (data) => api.post('/electricity/verify-meter', data),
  purchase: (data) => api.post('/electricity/purchase', data),
  getHistory: (params) => api.get('/electricity/history', { params }),
};

// Cable
export const cableAPI = {
  getPackages: (provider) => api.get('/cable/packages', { params: { provider } }),
  verifySmartCard: (data) => api.post('/cable/verify', data),
  purchase: (data) => api.post('/cable/purchase', data),
  getHistory: (params) => api.get('/cable/history', { params }),
};

// Education
export const educationAPI = {
  getPrices: () => api.get('/education/prices'),
  purchase: (data) => api.post('/education/purchase', data),
  getHistory: (params) => api.get('/education/history', { params }),
};

// Agent
export const agentAPI = {
  getStats: () => api.get('/agent/stats'),
  getDownlines: (params) => api.get('/agent/downlines', { params }),
  getCommissions: (params) => api.get('/agent/commissions', { params }),
  getFee: () => api.get('/agent/fee'),
  getMyApplication: () => api.get('/agent/application'),
  apply: () => api.post('/agent/apply'),
};

// Referral
export const referralAPI = {
  getStats: () => api.get('/referral/stats'),
  getTree: () => api.get('/referral/tree'),
};

// KYC
export const kycAPI = {
  getStatus: () => api.get('/kyc/status'),
  submitTier1: () => api.post('/kyc/tier1'),
  submitTier2: (formData) => api.post('/kyc/tier2', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submitTier3: (formData) => api.post('/kyc/tier3', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (ids) => api.patch('/notifications/read', { ids }),
};

// Banner
export const bannerAPI = {
  get: () => api.get('/banner'),
};

// Public settings
export const publicAPI = {
  getDepositCharge: () => api.get('/deposit-charge'),
  getFundingMethods: () => api.get('/funding-methods'),
  getFeaturedPlans: () => api.get('/featured-plans'),
  getPublicStats: () => api.get('/public-stats'),
};

// Admin
export const adminAPI = {
  getAnalytics: (period) => api.get('/admin/analytics', { params: { period } }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  suspendUser: (id, reason) => api.patch(`/admin/users/${id}/suspend`, { reason }),
  activateUser: (id) => api.patch(`/admin/users/${id}/activate`),
  adjustWallet: (id, data) => api.post(`/admin/users/${id}/adjust-wallet`, data),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  reverseTransaction: (id, reason) => api.patch(`/admin/transactions/${id}/reverse`, { reason }),
  getDataPlans: (params) => api.get('/admin/data-plans', { params }),
  createDataPlan: (data) => api.post('/admin/data-plans', data),
  updateDataPlan: (id, data) => api.patch(`/admin/data-plans/${id}`, data),
  deleteDataPlan: (id) => api.delete(`/admin/data-plans/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.patch('/admin/settings', data),
  getPendingKYC: (params) => api.get('/kyc/pending', { params }),
  getAllKYC: (params) => api.get('/kyc/submissions', { params }),
  getKYCById: (id) => api.get(`/kyc/${id}`),
  reviewKYC: (id, action, reason) => api.patch(`/kyc/${id}/review`, { action, rejectionReason: reason }),
  getKYCCounts: () => api.get('/kyc/counts'),
  getAgentApplications: (params) => api.get('/admin/agent-applications', { params }),
  getAgentApplicationCounts: () => api.get('/admin/agent-applications/counts'),
  reviewAgentApplication: (id, action, reason) => api.patch(`/admin/agent-applications/${id}/review`, { action, rejectionReason: reason }),
  testMonnify: () => api.get('/admin/test/monnify'),
  createVirtualAccount: (userId) => api.post(`/admin/users/${userId}/create-virtual-account`),
  broadcast: (data) => api.post('/admin/broadcast', data),
  broadcastHistory: () => api.get('/admin/broadcast/history'),
};

// Coupons
export const couponAPI = {
  list: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.patch(`/coupons/${id}`, data),
  remove: (id) => api.delete(`/coupons/${id}`),
  redeem: (code) => api.post('/coupons/redeem', { code }),
};
