// Netlify runs a function with this exact name after every verified form submission.
// It emails the gift details to Omozusi over Brevo SMTP (same setup as the Proposal site).
// Set EMAIL_USER, EMAIL_PASS and optionally YOUR_EMAIL in Site configuration → Environment variables.
import nodemailer from 'nodemailer';
import { renderGiftEmail } from '../email/gift-email.mjs';

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body || '{}');
  if (!payload || payload.form_name !== 'gift') return { statusCode: 200, body: 'ignored' };

  const { EMAIL_USER, EMAIL_PASS, YOUR_EMAIL = 'omoeguare@gmail.com', URL: siteUrl = '' } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('EMAIL_USER or EMAIL_PASS is not set, so the gift email was not sent.');
    return { statusCode: 200, body: 'email not configured' };
  }

  const { subject, html, text } = renderGiftEmail({
    bank: payload.data?.bank,
    account: payload.data?.account_number,
    submittedAt: new Date(payload.created_at || Date.now()),
    siteUrl,
  });

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
    return { statusCode: 500, body: 'Failed to send email' };
  }

  return { statusCode: 200, body: 'sent' };
};
