// Builds the email Omozusi gets when Nmeso submits the gift form.
// Email clients ignore most modern CSS, so this is table layout with inline styles,
// hex colours and system fonts only.

const C = {
  page: '#efe7fb',
  paper: '#fcfaff',
  plum: '#3b0a4f',
  purple: '#7b2cbf',
  violet: '#9d4edd',
  lav: '#c8b6ff',
  tint: '#f4edff',
  muted: '#6b5a7b',
  gingham: { dark: '#9d6ad6', mid: '#cfb4ee', light: '#fcfaff' },
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "Menlo, Consolas, 'Courier New', monospace";

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

// Gingham strip like the site's tablecloth: alternating rows of 10px cells.
const gingham = (rows = 2, cols = 56) => {
  const { dark, mid, light } = C.gingham;
  const cell = (bg) => `<td width="10" height="10" style="width:10px;height:10px;background:${bg};font-size:0;line-height:0;">&nbsp;</td>`;
  let html = '';
  for (let r = 0; r < rows; r++) {
    const striped = r % 2 === 0;
    html += '<tr>';
    for (let c = 0; c < cols; c++) html += cell(striped ? (c % 2 ? mid : dark) : (c % 2 ? light : mid));
    html += '</tr>';
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;table-layout:fixed;">${html}</table>`;
};

const formatWhen = (date) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    weekday: 'long', day: 'numeric', month: 'long',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date);

export function renderGiftEmail({ bank, account, submittedAt = new Date(), siteUrl = '' }) {
  const when = formatWhen(submittedAt);
  const site = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const b = escapeHtml(bank);
  const a = escapeHtml(account);

  const subject = `Nmeso's account details for her birthday gift`;
  const preheader = `${bank}, ${account}. Sent ${when}.`;

  const label = (text) =>
    `<div style="font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.violet};margin:0 0 6px;">${text}</div>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page};">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background:${C.paper};border-radius:14px;overflow:hidden;box-shadow:0 18px 40px -24px rgba(59,10,79,.45);">
        <tr><td>${gingham(4)}</td></tr>
        <tr>
          <td style="padding:34px 36px 6px;">
            <div style="font-family:${SERIF};font-style:italic;font-size:15px;color:${C.purple};margin:0 0 6px;">From the birthday site</div>
            <h1 style="font-family:${SERIF};font-weight:normal;font-size:30px;line-height:1.2;color:${C.plum};margin:0 0 12px;">Nmeso sent her account details</h1>
            <p style="font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted};margin:0;">She read the letter and filled in the gift form on ${escapeHtml(when)}. Here's where her gift should go.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 36px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.tint};border:1.5px dashed ${C.lav};border-radius:12px;">
              <tr>
                <td style="padding:22px 24px 18px;">
                  ${label('Bank')}
                  <div style="font-family:${SERIF};font-size:24px;line-height:1.25;color:${C.plum};">${b}</div>
                </td>
              </tr>
              <tr><td style="padding:0 24px;"><div style="border-top:1px solid ${C.lav};font-size:0;line-height:0;">&nbsp;</div></td></tr>
              <tr>
                <td style="padding:18px 24px 22px;">
                  ${label('Account number')}
                  <div style="font-family:${MONO};font-size:30px;line-height:1.2;letter-spacing:4px;color:${C.plum};font-weight:700;">${a}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 36px 30px;">
            <p style="font-family:${SANS};font-size:13px;line-height:1.6;color:${C.muted};margin:0;">Check that the account name on the transfer screen says Nwabueze Nmesoma Faith before you send.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 36px;"><div style="border-top:1px dashed ${C.lav};font-size:0;line-height:0;">&nbsp;</div></td>
        </tr>
        <tr>
          <td align="center" style="padding:22px 36px 30px;">
            <div style="font-family:${SERIF};font-style:italic;font-size:20px;color:${C.purple};margin:0 0 6px;"><span style="color:${C.violet};">&#9825;</span> Happy 24th, Nmeso</div>
            ${site ? `<div style="font-family:${SANS};font-size:12px;color:${C.muted};">Sent automatically from <a href="${escapeHtml(siteUrl)}" style="color:${C.purple};text-decoration:underline;">${escapeHtml(site)}</a></div>` : ''}
          </td>
        </tr>
        <tr><td>${gingham(2)}</td></tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    'Nmeso sent her account details',
    '',
    `She filled in the gift form on ${when}.`,
    '',
    `Bank: ${bank}`,
    `Account number: ${account}`,
    '',
    'Check that the account name on the transfer screen says Nwabueze Nmesoma Faith before you send.',
    '',
    'Happy 24th, Nmeso',
    site ? `Sent automatically from ${site}` : '',
  ].join('\n');

  return { subject, html, text };
}
