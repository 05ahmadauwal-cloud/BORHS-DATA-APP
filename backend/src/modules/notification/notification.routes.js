const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('express-async-handler');
const notificationService = require('./notification.service');
const ApiResponse = require('../../utils/apiResponse');

router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const data = await notificationService.getNotifications(req.user._id, req.query);
  return ApiResponse.success(res, data);
}));

router.patch('/read', asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.user._id, req.body.ids);
  return ApiResponse.success(res, {}, 'Marked as read');
}));

module.exports = router;
