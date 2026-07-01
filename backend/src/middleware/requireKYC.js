const ApiResponse = require('../utils/apiResponse');

const ADMIN_ROLES = ['admin', 'super_admin'];

const requireKYC = (req, res, next) => {
  if (ADMIN_ROLES.includes(req.user?.role)) return next();
  if (!req.user?.kycStatus || req.user.kycStatus === 'none') {
    return res.status(403).json({
      success: false,
      message: 'Identity verification required. Please complete your KYC before using this service.',
      code: 'KYC_REQUIRED',
    });
  }
  next();
};

module.exports = requireKYC;
