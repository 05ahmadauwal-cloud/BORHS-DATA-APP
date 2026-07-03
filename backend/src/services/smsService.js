const logger = require('../utils/logger');

let twilioClient = null;

const getTwilioClient = () => {
  if (!twilioClient) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

const sendSMS = async (to, message) => {
  try {
    const client = getTwilioClient();
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(`SMS sent to ${to}`);
    return true;
  } catch (error) {
    logger.error(`SMS failed to ${to}: ${error.message}`);
    return false;
  }
};

const sendWhatsApp = async (to, message) => {
  try {
    const client = getTwilioClient();
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
    });
    logger.info(`WhatsApp message sent to ${to}`);
    return true;
  } catch (error) {
    logger.error(`WhatsApp failed to ${to}: ${error.message}`);
    return false;
  }
};

const SMS_TEMPLATES = {
  otp: (otp) => `[BORHS Data] Your OTP is: ${otp}. Valid for 10 minutes. Do not share.`,
  walletFund: (amount, balance) =>
    `[BORHS Data] Your wallet has been credited with NGN ${amount}. Available balance: NGN ${balance}.`,
  dataPurchase: (plan, phone, ref, validity) => {
    const validityText = validity ? ` Validity: ${validity}.` : '';
    return `[BORHS Data] ${plan} has been delivered to ${phone}. Ref: ${ref}.${validityText}`;
  },
  transactionAlert: (type, amount, ref) =>
    `[BORHS Data] ${type} of NGN ${amount}. Ref: ${ref}. Contact support if not authorized.`,
};

module.exports = { sendSMS, sendWhatsApp, SMS_TEMPLATES };
