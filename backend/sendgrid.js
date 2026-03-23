const sgMail = require('@sendgrid/mail');

const apiKey = (process.env.SENDGRID_API_KEY || '').trim();
const sendgridEnabled = apiKey.startsWith('SG.');

if (sendgridEnabled) {
  sgMail.setApiKey(apiKey);
}

async function sendEmail({ to, subject, text, html }) {
  if (!sendgridEnabled) {
    return { success: false, skipped: true, message: 'SendGrid not configured' };
  }

  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'support@smartvet.com',
      subject,
      text: text || undefined,
      html: html || undefined
    };
    const result = await sgMail.send(msg);
    console.log(`SendGrid email sent: ${result[0]?.statusCode} -> ${to}`);
    return { success: true, statusCode: result[0]?.statusCode };
  } catch (error) {
    console.error(`SendGrid email failed: ${error.message} -> ${to}`);
    return { success: false, message: error.message };
  }
}

module.exports = {
  sendEmail,
  sendgridEnabled
};
