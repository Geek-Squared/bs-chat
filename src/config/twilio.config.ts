import { registerAs } from '@nestjs/config';

export default registerAs('twilio', () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  whatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  smsNumber: process.env.TWILIO_SMS_NUMBER,
  webhookSecret: process.env.TWILIO_WEBHOOK_SECRET
}));