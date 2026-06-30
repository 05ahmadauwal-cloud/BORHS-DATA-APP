const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const kycService = require('./kyc.service');
const { authenticate, authorize } = require('../../middleware/auth');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('express-async-handler');

const storage = multer.diskStorage({
  destination: 'uploads/kyc/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `kyc-${req.user._id}-${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

router.use(authenticate);

router.get('/status', asyncHandler(async (req, res) => {
  const data = await kycService.getKYCStatus(req.user._id);
  return ApiResponse.success(res, data);
}));

router.post('/tier1', asyncHandler(async (req, res) => {
  const data = await kycService.submitTier1(req.user._id);
  return ApiResponse.success(res, data, 'Tier 1 KYC completed');
}));

router.post('/tier2', upload.fields([{ name: 'idFront', maxCount: 1 }, { name: 'idBack', maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const data = await kycService.submitTier2(req.user._id, req.body, req.files);
    return ApiResponse.success(res, data, 'Tier 2 KYC submitted for review');
  })
);

router.post('/tier3', upload.fields([{ name: 'selfie', maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const data = await kycService.submitTier3(req.user._id, req.files);
    return ApiResponse.success(res, data, 'Tier 3 KYC submitted for review');
  })
);

// Admin routes
router.get('/pending', authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const data = await kycService.getPendingKYC(req.query);
  return ApiResponse.success(res, data);
}));

router.patch('/:id/review', authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const data = await kycService.reviewKYC(req.user._id, req.params.id, req.body.action, req.body.rejectionReason);
  return ApiResponse.success(res, { kyc: data }, `KYC ${req.body.action}d successfully`);
}));

module.exports = router;
