const express = require('express');
const asyncHandler = require('express-async-handler');
const { body } = require('express-validator');
const { authenticate } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const ApiResponse = require('../../utils/apiResponse');
const service = require('./renewal.service');

const router = express.Router();
router.use(authenticate);

router.get('/recipient-lists', asyncHandler(async (req, res) => ApiResponse.success(res, { lists: await service.RecipientList.find({ user: req.user._id }).sort({ name: 1 }).lean() })));
router.post('/recipient-lists', [body('name').trim().notEmpty(), body('numbers').isArray({ min: 1 }), body('numbers.*').matches(/^0\d{10}$/)], validate, asyncHandler(async (req, res) => {
  const numbers = [...new Set(req.body.numbers)];
  const list = await service.RecipientList.findOneAndUpdate({ user: req.user._id, name: req.body.name }, { numbers }, { upsert: true, new: true });
  return ApiResponse.success(res, { list }, 'Recipient list saved');
}));
router.delete('/recipient-lists/:id', asyncHandler(async (req, res) => { await service.RecipientList.deleteOne({ _id: req.params.id, user: req.user._id }); return ApiResponse.success(res, {}, 'Recipient list deleted'); }));

router.get('/auto-renewals', asyncHandler(async (req, res) => ApiResponse.success(res, { renewals: await service.AutoRenewal.find({ user: req.user._id }).sort({ createdAt: -1 }).lean() })));
router.post('/auto-renewals', [body('serviceType').isIn(['data', 'airtime']), body('frequency').isIn(['daily', 'weekly', 'monthly']), body('paymentSource').optional().isIn(['main', 'reward', 'reward_first']), body('pin').matches(/^\d{4}$/)], validate, asyncHandler(async (req, res) => ApiResponse.success(res, { renewal: await service.createRenewal(req.user._id, req.body) }, 'Auto-renewal activated')));
router.patch('/auto-renewals/:id', [body('isActive').isBoolean()], validate, asyncHandler(async (req, res) => {
  const renewal = await service.AutoRenewal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: req.body.isActive }, { new: true });
  return ApiResponse.success(res, { renewal }, req.body.isActive ? 'Auto-renewal activated' : 'Auto-renewal paused');
}));
router.delete('/auto-renewals/:id', asyncHandler(async (req, res) => { await service.AutoRenewal.deleteOne({ _id: req.params.id, user: req.user._id }); return ApiResponse.success(res, {}, 'Auto-renewal deleted'); }));

module.exports = router;
