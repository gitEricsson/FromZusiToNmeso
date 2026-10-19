// Writes the gift email with sample data to site/email-preview.html so you can open it
// in a browser while the local server runs. Nothing is sent.
// Usage: npm run email:preview   (then visit http://localhost:5173/email-preview.html)
import { writeFileSync } from 'node:fs';
import { renderGiftEmail } from '../netlify/email/gift-email.mjs';

const out = process.argv[2] || new URL('../site/email-preview.html', import.meta.url);
const { subject, html } = renderGiftEmail({
  bank: 'GTBank',
  account: '0123456789',
  siteUrl: 'https://fromzusitonmeso.netlify.app',
});
writeFileSync(out, html);
console.log(`Subject: ${subject}\nWrote ${out}`);
