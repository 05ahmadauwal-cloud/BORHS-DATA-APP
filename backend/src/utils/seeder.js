require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DataPlan = require('../models/DataPlan');
const Settings = require('../models/Settings');
const logger = require('./logger');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  logger.info('MongoDB connected for seeding');
};

const seedUsers = async () => {
  await User.deleteMany({ email: { $in: ['superadmin@borhsdata.com', 'admin@borhsdata.com', 'agent@borhsdata.com', 'customer@borhsdata.com'] } });

  // Use create() one-by-one so pre-save hooks (bcrypt hashing) fire correctly
  const usersData = [
    { firstName: 'Super', lastName: 'Admin', email: 'superadmin@borhsdata.com', phone: '+2348000000001', password: 'Admin@1234', role: 'super_admin', isEmailVerified: true, isPhoneVerified: true, referralCode: 'SUPER001' },
    { firstName: 'Admin', lastName: 'User', email: 'admin@borhsdata.com', phone: '+2348000000002', password: 'Admin@1234', role: 'admin', isEmailVerified: true, isPhoneVerified: true, referralCode: 'ADMIN001' },
    { firstName: 'Test', lastName: 'Agent', email: 'agent@borhsdata.com', phone: '+2348000000003', password: 'Agent@1234', role: 'agent', isEmailVerified: true, isPhoneVerified: true, referralCode: 'AGENT001', walletBalance: 50000 },
    { firstName: 'Test', lastName: 'Customer', email: 'customer@borhsdata.com', phone: '+2348000000004', password: 'Customer@1234', role: 'customer', isEmailVerified: true, isPhoneVerified: true, referralCode: 'CUST001', walletBalance: 10000 },
  ];

  for (const userData of usersData) {
    await User.create(userData);
  }
  logger.info(`Seeded ${usersData.length} users`);
};

const seedDataPlans = async () => {
  await DataPlan.deleteMany({});
  const plans = [
    // MTN SME
    { network: 'mtn', dataType: 'sme', planId: 'mtn-sme-100mb', name: '100MB SME', dataSize: '100MB', validity: '1 Day', costPrice: 95, sellingPrice: 100, agentPrice: 97, providerPlanCode: 'mtn-sme-100mb' },
    { network: 'mtn', dataType: 'sme', planId: 'mtn-sme-500mb', name: '500MB SME', dataSize: '500MB', validity: '30 Days', costPrice: 140, sellingPrice: 150, agentPrice: 145, providerPlanCode: 'mtn-sme-500mb' },
    { network: 'mtn', dataType: 'sme', planId: 'mtn-sme-1gb', name: '1GB SME', dataSize: '1GB', validity: '30 Days', costPrice: 270, sellingPrice: 285, agentPrice: 275, providerPlanCode: 'mtn-sme-1gb' },
    { network: 'mtn', dataType: 'sme', planId: 'mtn-sme-2gb', name: '2GB SME', dataSize: '2GB', validity: '30 Days', costPrice: 490, sellingPrice: 510, agentPrice: 498, providerPlanCode: 'mtn-sme-2gb' },
    { network: 'mtn', dataType: 'sme', planId: 'mtn-sme-5gb', name: '5GB SME', dataSize: '5GB', validity: '30 Days', costPrice: 1200, sellingPrice: 1250, agentPrice: 1220, providerPlanCode: 'mtn-sme-5gb' },
    { network: 'mtn', dataType: 'sme', planId: 'mtn-sme-10gb', name: '10GB SME', dataSize: '10GB', validity: '30 Days', costPrice: 2350, sellingPrice: 2450, agentPrice: 2390, providerPlanCode: 'mtn-sme-10gb' },
    // Airtel
    { network: 'airtel', dataType: 'corporate', planId: 'airtel-corp-1gb', name: '1GB Corporate', dataSize: '1GB', validity: '30 Days', costPrice: 290, sellingPrice: 310, agentPrice: 298, providerPlanCode: 'airtel-corp-1gb' },
    { network: 'airtel', dataType: 'corporate', planId: 'airtel-corp-2gb', name: '2GB Corporate', dataSize: '2GB', validity: '30 Days', costPrice: 550, sellingPrice: 580, agentPrice: 560, providerPlanCode: 'airtel-corp-2gb' },
    { network: 'airtel', dataType: 'corporate', planId: 'airtel-corp-5gb', name: '5GB Corporate', dataSize: '5GB', validity: '30 Days', costPrice: 1300, sellingPrice: 1380, agentPrice: 1330, providerPlanCode: 'airtel-corp-5gb' },
    // Glo
    { network: 'glo', dataType: 'gifting', planId: 'glo-gift-1gb', name: '1GB Gifting', dataSize: '1GB', validity: '30 Days', costPrice: 280, sellingPrice: 300, agentPrice: 288, providerPlanCode: 'glo-gift-1gb' },
    { network: 'glo', dataType: 'gifting', planId: 'glo-gift-2gb', name: '2GB Gifting', dataSize: '2GB', validity: '30 Days', costPrice: 520, sellingPrice: 550, agentPrice: 530, providerPlanCode: 'glo-gift-2gb' },
    // 9mobile
    { network: '9mobile', dataType: 'sme', planId: '9mobile-sme-1gb', name: '1GB SME', dataSize: '1GB', validity: '30 Days', costPrice: 290, sellingPrice: 310, agentPrice: 298, providerPlanCode: '9mobile-sme-1gb' },
    { network: '9mobile', dataType: 'sme', planId: '9mobile-sme-2gb', name: '2GB SME', dataSize: '2GB', validity: '30 Days', costPrice: 540, sellingPrice: 570, agentPrice: 550, providerPlanCode: '9mobile-sme-2gb' },
  ];
  await DataPlan.insertMany(plans);
  logger.info(`Seeded ${plans.length} data plans`);
};

const seedSettings = async () => {
  await Settings.deleteMany({});
  const defaults = [
    { key: 'app_name', value: 'BORHS Data', isPublic: true },
    { key: 'app_tagline', value: 'Fast, Cheap & Reliable VTU Services', isPublic: true },
    { key: 'support_email', value: 'support@borhsdata.com', isPublic: true },
    { key: 'support_phone', value: '+2348000000000', isPublic: true },
    { key: 'maintenance_mode', value: false, isPublic: true },
    { key: 'min_wallet_fund', value: 100, isPublic: true },
    { key: 'max_wallet_fund', value: 5000000, isPublic: true },
    { key: 'referral_level1_percent', value: 5 },
    { key: 'referral_level2_percent', value: 2 },
    { key: 'referral_level3_percent', value: 1 },
    { key: 'data_commission_rate', value: 2 },
    { key: 'airtime_commission_rate', value: 1 },
  ];
  await Settings.insertMany(defaults);
  logger.info(`Seeded ${defaults.length} settings`);
};

const seed = async () => {
  try {
    await connectDB();
    await seedUsers();
    await seedDataPlans();
    await seedSettings();
    logger.info('Database seeded successfully!');
    logger.info('\n=== Seed Credentials ===');
    logger.info('Super Admin: superadmin@borhsdata.com / Admin@1234');
    logger.info('Admin:       admin@borhsdata.com / Admin@1234');
    logger.info('Agent:       agent@borhsdata.com / Agent@1234');
    logger.info('Customer:    customer@borhsdata.com / Customer@1234');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
