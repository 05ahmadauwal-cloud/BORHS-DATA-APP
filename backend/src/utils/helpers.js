const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const generateReference = (prefix = 'TXN') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generateReferralCode = (firstName) => {
  const clean = firstName.toUpperCase().slice(0, 4);
  const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${clean}${rand}`;
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

const paginate = (page, limit) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, parseInt(limit) || 20);
  return { skip: (p - 1) * l, limit: l, page: p };
};

const paginateResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

const maskPhone = (phone) => {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 4) + '****' + phone.slice(-3);
};

const maskEmail = (email) => {
  if (!email) return email;
  const [local, domain] = email.split('@');
  const masked = local[0] + '***' + local[local.length - 1];
  return `${masked}@${domain}`;
};

const sanitizePhone = (phone) => {
  const clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) return '+234' + clean.slice(1);
  if (clean.startsWith('234')) return '+' + clean;
  if (clean.startsWith('+234')) return clean;
  return clean;
};

const encryptData = (data) => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8').slice(0, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptData = (encryptedData) => {
  const [ivHex, encrypted] = encryptedData.split(':');
  const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf8').slice(0, 32);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isValidNigeriaPhone = (phone) => {
  const regex = /^(\+234|234|0)[789][01]\d{8}$/;
  return regex.test(phone);
};

const getNetworkFromPhone = (phone) => {
  const clean = sanitizePhone(phone).replace('+234', '0');
  const prefix = clean.slice(0, 4);
  const mtn = ['0803', '0806', '0813', '0816', '0703', '0706', '0813', '0814', '0903', '0906', '0913', '0916'];
  const airtel = ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901'];
  const glo = ['0805', '0807', '0811', '0815', '0905', '0915'];
  const nine = ['0809', '0817', '0818', '0908', '0909'];
  if (mtn.includes(prefix)) return 'mtn';
  if (airtel.includes(prefix)) return 'airtel';
  if (glo.includes(prefix)) return 'glo';
  if (nine.includes(prefix)) return '9mobile';
  return null;
};

module.exports = {
  generateReference,
  generateReferralCode,
  generateOTP,
  formatAmount,
  paginate,
  paginateResponse,
  maskPhone,
  maskEmail,
  sanitizePhone,
  encryptData,
  decryptData,
  sleep,
  isValidNigeriaPhone,
  getNetworkFromPhone,
};
