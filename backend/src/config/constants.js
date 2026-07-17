module.exports = {
  ROLES: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    AGENT: 'agent',
    CUSTOMER: 'customer',
  },

  TRANSACTION_TYPES: {
    WALLET_FUND: 'wallet_fund',
    WALLET_TRANSFER: 'wallet_transfer',
    WITHDRAWAL: 'withdrawal',
    DATA_PURCHASE: 'data_purchase',
    AIRTIME_PURCHASE: 'airtime_purchase',
    ELECTRICITY_PURCHASE: 'electricity_purchase',
    CABLE_PURCHASE: 'cable_purchase',
    EDUCATION_PURCHASE: 'education_purchase',
    COMMISSION_EARNED: 'commission_earned',
    REFERRAL_BONUS: 'referral_bonus',
    REFUND: 'refund',
    AGENT_FEE: 'agent_fee',
  },

  TRANSACTION_STATUS: {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    REVERSED: 'reversed',
    PROCESSING: 'processing',
  },

  NETWORKS: {
    MTN: 'mtn',
    AIRTEL: 'airtel',
    GLO: 'glo',
    NINE_MOBILE: '9mobile',
  },

  DATA_TYPES: {
    SME: 'sme',
    CORPORATE: 'corporate',
    GIFTING: 'gifting',
    DIRECT: 'direct',
  },

  CABLE_PROVIDERS: {
    DSTV: 'dstv',
    GOTV: 'gotv',
    STARTIMES: 'startimes',
  },

  ELECTRICITY_PROVIDERS: {
    IKEDC: 'ikedc',
    EKEDC: 'ekedc',
    AEDC: 'aedc',
    KEDCO: 'kedco',
    JED: 'jed',
    PHED: 'phed',
  },

  EXAM_TYPES: {
    WAEC: 'waec',
    NECO: 'neco',
    NABTEB: 'nabteb',
    JAMB: 'jamb',
  },

  KYC_STATUS: {
    NONE: 'none',
    TIER1: 'tier1',
    TIER2: 'tier2',
    TIER3: 'tier3',
  },

  KYC_APPROVAL_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },

  PAYMENT_GATEWAYS: {
    PAYSTACK: 'paystack',
    FLUTTERWAVE: 'flutterwave',
    BILLSTACK: 'billstack',
  },

  VTU_PROVIDERS: {
    SMEAPI: 'smeapi',
  },

  NOTIFICATION_TYPES: {
    EMAIL: 'email',
    SMS: 'sms',
    WHATSAPP: 'whatsapp',
    IN_APP: 'in_app',
  },

  NOTIFICATION_EVENTS: {
    REGISTRATION: 'registration',
    LOGIN: 'login',
    WALLET_FUND: 'wallet_fund',
    DATA_PURCHASE: 'data_purchase',
    AIRTIME_PURCHASE: 'airtime_purchase',
    ELECTRICITY_PURCHASE: 'electricity_purchase',
    CABLE_PURCHASE: 'cable_purchase',
    EDUCATION_PURCHASE: 'education_purchase',
    COMMISSION_EARNED: 'commission_earned',
    WITHDRAWAL: 'withdrawal',
    KYC_APPROVED: 'kyc_approved',
    KYC_REJECTED: 'kyc_rejected',
    PASSWORD_RESET: 'password_reset',
    ANNOUNCEMENT: 'announcement',
  },

  REFERRAL_LEVELS: {
    LEVEL1: 1,
    LEVEL2: 2,
    LEVEL3: 3,
  },

  WALLET_LIMITS: {
    MIN_FUND: 100,
    MAX_FUND: 5000000,
    MIN_WITHDRAW: 500,
    MIN_TRANSFER: 100,
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
};
