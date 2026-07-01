const express = require('express');
const router = express.Router();
const multer = require('multer');
const kycService = require('./kyc.service');
const { authenticate, authorize } = require('../../middleware/auth');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('express-async-handler');

// Store files in memory as Buffer (no disk needed — Render compatible)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|jpg|png|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
  },
});

// Convert uploaded buffers to base64 data URIs for MongoDB storage
const filesToBase64 = (files = {}) => {
  const result = {};
  for (const [key, arr] of Object.entries(files)) {
    if (arr?.[0]) {
      const { buffer, mimetype } = arr[0];
      result[key] = `data:${mimetype};base64,${buffer.toString('base64')}`;
    }
  }
  return result;
};

router.use(authenticate);

router.get('/status', asyncHandler(async (req, res) => {
  const data = await kycService.getKYCStatus(req.user._id);
  return ApiResponse.success(res, data);
}));

router.post('/tier1', asyncHandler(async (req, res) => {
  const data = await kycService.submitTier1(req.user._id);
  return ApiResponse.success(res, data, 'Tier 1 KYC completed');
}));

router.post('/tier2',
  upload.fields([{ name: 'idFront', maxCount: 1 }, { name: 'idBack', maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const images = filesToBase64(req.files);
    const data = await kycService.submitTier2(req.user._id, req.body, images);
    return ApiResponse.success(res, data, 'Tier 2 KYC submitted for review');
  })
);

router.post('/tier3',
  upload.fields([{ name: 'selfie', maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const images = filesToBase64(req.files);
    const data = await kycService.submitTier3(req.user._id, images);
    return ApiResponse.success(res, data, 'Tier 3 KYC submitted for review');
  })
);

// Admin routes — specific paths before /:id
router.get('/pending', authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const data = await kycService.getPendingKYC(req.query);
  return ApiResponse.success(res, data);
}));

router.get('/submissions', authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const data = await kycService.getKYCSubmissions(req.query);
  return ApiResponse.success(res, data);
}));

router.get('/counts', authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const counts = await kycService.getKYCCounts();
  return ApiResponse.success(res, counts);
}));

router.get('/:id', authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const kyc = await kycService.getKYCById(req.params.id);
  return ApiResponse.success(res, { kyc });
}));

router.patch('/:id/review', authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const data = await kycService.reviewKYC(req.user._id, req.params.id, req.body.action, req.body.rejectionReason);
  return ApiResponse.success(res, { kyc: data }, `KYC ${req.body.action}d successfully`);
}));

module.exports = router;
