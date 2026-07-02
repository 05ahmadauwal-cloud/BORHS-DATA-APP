const express = require('express');
const router = express.Router();
const Coupon = require('../../models/Coupon');
const { fundWallet } = require('../wallet/wallet.service');
const { authenticate, authorize } = require('../../middleware/auth');
const ApiResponse = require('../../utils/apiResponse');
const asyncHandler = require('express-async-handler');

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.post('/', authenticate, authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const { code, description, amount, maxUses, expiresAt, type, dataNetwork, dataSize } = req.body;
  if (!code) return ApiResponse.error(res, 'code is required', 400);
  if (amount === undefined || amount === null || Number(amount) < 0) return ApiResponse.error(res, 'amount is required', 400);

  const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (existing) return ApiResponse.error(res, 'Coupon code already exists', 400);

  const couponType = type === 'data' ? 'data' : 'money';
  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    type: couponType,
    description,
    amount: Number(amount),
    maxUses: Number(maxUses) || 0,
    expiresAt: expiresAt || null,
    dataNetwork: couponType === 'data' ? dataNetwork : null,
    dataSize: couponType === 'data' ? dataSize : null,
    createdBy: req.user._id,
  });
  return ApiResponse.success(res, { coupon }, 'Coupon created', 201);
}));

router.get('/', authenticate, authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return ApiResponse.success(res, { coupons });
}));

router.patch('/:id', authenticate, authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const { description, amount, maxUses, expiresAt, isActive, dataNetwork, dataSize } = req.body;
  const update = {};
  if (description !== undefined) update.description = description;
  if (amount !== undefined) update.amount = Number(amount);
  if (maxUses !== undefined) update.maxUses = Number(maxUses);
  if (expiresAt !== undefined) update.expiresAt = expiresAt || null;
  if (isActive !== undefined) update.isActive = isActive;
  if (dataNetwork !== undefined) update.dataNetwork = dataNetwork;
  if (dataSize !== undefined) update.dataSize = dataSize;

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!coupon) return ApiResponse.error(res, 'Coupon not found', 404);
  return ApiResponse.success(res, { coupon }, 'Coupon updated');
}));

router.delete('/:id', authenticate, authorize('admin', 'super_admin'), asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return ApiResponse.error(res, 'Coupon not found', 404);
  return ApiResponse.success(res, null, 'Coupon deleted');
}));

// ─── Customer route ───────────────────────────────────────────────────────────
router.post('/redeem', authenticate, asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) return ApiResponse.error(res, 'Coupon code is required', 400);

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon || !coupon.isActive) return ApiResponse.error(res, 'Invalid or inactive coupon code', 400);

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return ApiResponse.error(res, 'This coupon has expired', 400);
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return ApiResponse.error(res, 'This coupon has reached its usage limit', 400);
  }

  const alreadyUsed = coupon.usedBy.some((u) => u.user.toString() === req.user._id.toString());
  if (alreadyUsed) return ApiResponse.error(res, 'You have already used this coupon', 400);

  // Credit wallet
  await fundWallet(req.user._id, coupon.amount, 'coupon', `COUPON-${coupon.code}-${req.user._id}`, {
    couponCode: coupon.code,
    couponId: coupon._id,
    couponType: coupon.type,
    ...(coupon.type === 'data' ? { dataNetwork: coupon.dataNetwork, dataSize: coupon.dataSize } : {}),
  });

  // Record usage
  coupon.usedCount += 1;
  coupon.usedBy.push({ user: req.user._id });
  await coupon.save();

  const successMsg = coupon.type === 'data'
    ? `₦${coupon.amount.toLocaleString()} data credit added to your wallet! Use it to buy ${coupon.dataNetwork ? coupon.dataNetwork.toUpperCase() + ' ' : ''}data.`
    : `₦${coupon.amount.toLocaleString()} credited to your wallet!`;

  return ApiResponse.success(res, { amount: coupon.amount, type: coupon.type }, successMsg);
}));

module.exports = router;
