// Netlify runs a function with this exact name after every verified form submission.
// It sends the styled gift email through Gmail. Set GMAIL_USER and GMAIL_APP_PASSWORD
// (and optionally NOTIFY_TO) in Site configuration → Environment variables.
import nodemailer from 'nodemailer';
import { renderGiftEmail } from '../email/gift-email.mjs';

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body || '{}');
  if (!payload || payload.form_name !== 'gift') return { statusCode: 200, body: 'ignored' };

  const { GMAIL_USER, GMAIL_APP_PASSWORD, NOTIFY_TO = 'omoeguare@gmail.com', URL: siteUrl = '' } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD is not set, so the styled email was not sent.');
    return { statusCode: 200, body: 'email not configured' };
  }

  const { subject, html, text } = renderGiftEmail({
    bank: payload.data?.bank,
    account: payload.data?.account_number,
    submittedAt: new Date(payload.created_at || Date.now()),
    siteUrl,
  });

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
  await transport.sendMail({
    from: `"Nmeso's birthday site" <${GMAIL_USER}>`,
    to: NOTIFY_TO,
    subject,
    html,
    text,
  });

  return { statusCode: 200, body: 'sent' };
};
