require('dotenv').config();
const mongoose = require('mongoose');
const KYC = require('../src/models/KYC');
const { syncMonnifyKYC } = require('../src/modules/kyc/kyc.service');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const records = await KYC.find({
    tier: 2,
    status: 'approved',
    $or: [
      { bvn: { $exists: true, $nin: [null, ''] } },
      { idType: 'nin', idNumber: { $exists: true, $nin: [null, ''] } },
    ],
  }).select('user').lean();
  const userIds = [...new Set(records.map((record) => String(record.user)))];
  if (process.argv.includes('--dry-run')) {
    process.stdout.write(`${JSON.stringify({ eligible: userIds.length, dryRun: true })}\n`);
    await mongoose.disconnect();
    return;
  }
  let synced = 0;
  let failed = 0;
  for (const userId of userIds) {
    try {
      const result = await syncMonnifyKYC(userId);
      if (result.synced) synced += 1;
    } catch {
      failed += 1;
    }
  }
  process.stdout.write(`${JSON.stringify({ eligible: userIds.length, synced, failed })}\n`);
  await mongoose.disconnect();
  if (failed) process.exitCode = 1;
};

run().catch(async (error) => {
  process.stderr.write(`${error.message}\n`);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
