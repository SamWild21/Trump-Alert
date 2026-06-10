import nodemailer from 'nodemailer';
import { buildAlertEmail, SAMPLE_ALERT_POST } from './alertMessage.js';

export async function sendPostAlert(config, post) {
  return sendEmail(config, buildAlertEmail(post));
}

export async function sendTestEmail(config) {
  return sendEmail(config, buildAlertEmail(SAMPLE_ALERT_POST));
}

async function sendEmail(config, message) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: config.gmailUser,
      pass: config.gmailAppPassword
    }
  });

  return transporter.sendMail({
    from: config.emailFrom,
    to: config.emailTo.join(', '),
    ...message
  });
}
