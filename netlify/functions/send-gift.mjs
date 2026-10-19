// POST /.netlify/functions/send-gift
// Called by the gift form. Emails the details to Omozusi over Brevo SMTP
// (same setup as the Proposal site's /api/send-email).
// Set EMAIL_USER, EMAIL_PASS and optionally YOUR_EMAIL in Site configuration → Environment variables.
import nodemailer from 'nodemailer';
import { renderGiftEmail } from '../email/gift-email.mjs';

const reply = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch {
    return reply(400, { error: 'Invalid JSON' });
  }

  // Honeypot: real visitors never fill this in, so pretend it worked and send nothing.
  if (data.bot) return reply(200, { success: true });

  const bank = String(data.bank || '').trim().slice(0, 80);
  const account = String(data.account_number || '').trim();
  if (bank.length < 2 || !/^\d{10}$/.test(account)) {
    return reply(400, { error: 'Bank name and a 10-digit account number are required' });
  }

  const { EMAIL_USER, EMAIL_PASS, YOUR_EMAIL = 'omoeguare@gmail.com', URL: siteUrl = '' } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('EMAIL_USER or EMAIL_PASS is not set, so the gift email was not sent.');
    return reply(500, { error: 'Email is not configured' });
  }

  const { subject, html, text } = renderGiftEmail({ bank, account, submittedAt: new Date(), siteUrl });

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 2525,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"Nmeso's birthday site" <${EMAIL_USER}>`,
      to: YOUR_EMAIL,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return reply(502, { error: 'Failed to send email' });
  }

  return reply(200, { success: true });
};
