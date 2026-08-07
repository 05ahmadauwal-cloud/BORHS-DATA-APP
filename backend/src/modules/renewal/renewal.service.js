const AutoRenewal = require('../../models/AutoRenewal');
const RecipientList = require('../../models/RecipientList');
const User = require('../../models/User');
const dataService = require('../data/data.service');
const airtimeService = require('../airtime/airtime.service');
const { createNotification } = require('../notification/notification.service');
const logger = require('../../utils/logger');

const nextRun = (frequency, from = new Date()) => {
  const date = new Date(from);
  if (frequency === 'daily') date.setDate(date.getDate() + 1);
  else if (frequency === 'weekly') date.setDate(date.getDate() + 7);
  else date.setMonth(date.getMonth() + 1);
  return date;
};

const verifyPin = async (userId, pin) => {
  const user = await User.findById(userId).select('+transactionPin');
  if (!user?.isPinSet || !await user.comparePin(String(pin || ''))) throw Object.assign(new Error('Invalid transaction PIN'), { statusCode: 401 });
};

const createRenewal = async (userId, body) => {
  await verifyPin(userId, body.pin);
  const recipients = Array.isArray(body.recipients) ? body.recipients : [];
  if (!recipients.length && !body.payload?.phone) throw Object.assign(new Error('At least one recipient is required'), { statusCode: 400 });
  return AutoRenewal.create({
    user: userId, serviceType: body.serviceType, label: body.label,
    payload: { ...body.payload, pin: undefined, paymentSource: undefined }, recipients,
    frequency: body.frequency, paymentSource: body.paymentSource || 'main',
    nextRunAt: nextRun(body.frequency),
  });
};

const executeRenewal = async (renewal) => {
  const common = { ...renewal.payload, paymentSource: renewal.paymentSource };
  const recipients = renewal.recipients?.length ? renewal.recipients : [renewal.payload];
  const results = [];
  for (const recipient of recipients) {
    try {
      const payload = { ...common, ...recipient };
      const purchase = renewal.serviceType === 'data'
        ? await dataService.purchaseData(renewal.user, payload, { skipPin: true })
        : await airtimeService.purchaseAirtime(renewal.user, payload, { skipPin: true });
      results.push({ phone: recipient.phone, status: 'success', reference: purchase.reference });
    } catch (error) {
      results.push({ phone: recipient.phone, status: 'failed', error: error.message });
    }
  }
  const successes = results.filter((result) => result.status === 'success').length;
  const status = successes === results.length ? 'success' : successes ? 'partial' : 'failed';
  await AutoRenewal.findByIdAndUpdate(renewal._id, { lastRunAt: new Date(), lastStatus: status, lastError: status === 'success' ? null : results.find((r) => r.error)?.error });
  await createNotification(renewal.user, { title: 'Auto-renewal update', message: `${successes} of ${results.length} ${renewal.serviceType} renewal(s) completed.`, type: 'in_app', metadata: { renewalId: renewal._id } }).catch(() => {});
};

const processDueRenewals = async () => {
  let renewal;
  do {
    renewal = await AutoRenewal.findOneAndUpdate(
      { isActive: true, nextRunAt: { $lte: new Date() } },
      [{ $set: { nextRunAt: { $switch: { branches: [
        { case: { $eq: ['$frequency', 'daily'] }, then: { $dateAdd: { startDate: '$nextRunAt', unit: 'day', amount: 1 } } },
        { case: { $eq: ['$frequency', 'weekly'] }, then: { $dateAdd: { startDate: '$nextRunAt', unit: 'day', amount: 7 } } },
      ], default: { $dateAdd: { startDate: '$nextRunAt', unit: 'month', amount: 1 } } } } } }],
      { new: false }
    );
    if (renewal) await executeRenewal(renewal);
  } while (renewal);
};

let timer;
const startRenewalWorker = () => {
  if (timer) return;
  timer = setInterval(() => processDueRenewals().catch((error) => logger.error(`Renewal worker: ${error.message}`)), 60_000);
  timer.unref();
  processDueRenewals().catch((error) => logger.error(`Renewal worker: ${error.message}`));
};

module.exports = { nextRun, createRenewal, processDueRenewals, startRenewalWorker, RecipientList, AutoRenewal };
