require('dotenv').config();
const mongoose = require('mongoose');
const { backfillStarterAccounts } = require('../src/services/monnifyAccountProvisioning');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await backfillStarterAccounts();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  await mongoose.disconnect();
  if (result.failed) process.exitCode = 1;
};

run().catch(async (error) => {
  process.stderr.write(`${error.message}\n`);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
