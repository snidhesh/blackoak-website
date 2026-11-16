// The Monday email telling subscribers a new edition of The Market Briefing is out.
// English only: the subscriber list in Resend does not record a language.

import { escapeHtml } from '@/lib/email';
import { BRIEFING_PUBLIC_ORIGIN } from '@/lib/constants';

// White wordmark on transparent, served from the site's public folder. Mail clients
// do not render SVG, hence the PNG; the alt text carries the name when images are off.
const LOGO_URL = `${BRIEFING_PUBLIC_ORIGIN}/images/logo-white.png`;

export interface EditionEmailInput {
  /** Edition number as printed on the page, e.g. "010". */
  edition: string;
  /** Release date, e.g. "Monday 16 November 2026". */
  dateLabel: string;
  firstName?: string | null;
  /** The subscriber's personal link to the Briefing. */
  link: string;
  unsubscribeLink: string;
}

export function renderEditionEmail(input: EditionEmailInput): { subject: string; html: string; text: string } {
  const firstName = input.firstName?.trim();
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
  const subject = `The Market Briefing, Edition ${input.edition} is out`;
  const intro = `Edition ${input.edition} of The Market Briefing is now available: this week's BlackOak Prime Capital Index and Confidence Index, the numbers that moved the UAE property market, and the BlackOak View.`; // plain-text version
  const personal =
    'This link is personal to you and opens the Briefing directly, with no sign-in. It works until next week’s edition. If you share the Briefing, the people you share it with will be asked to subscribe.';

  const text = [
    greeting,
    '',
    intro,
    '',
    `Read Edition ${input.edition} (${input.dateLabel}):`,
    input.link,
    '',
    personal,
    '',
    'BlackOak Real Estate',
    '',
    `Unsubscribe: ${input.unsubscribeLink}`,
  ].join('\n');

  const link = escapeHtml(input.link);
  const unsubscribe = escapeHtml(input.unsubscribeLink);
  const edition = escapeHtml(input.edition);
  const date = escapeHtml(input.dateLabel);

  // BlackOak "terminal amber", as on the Briefing itself (briefing repo, TEMPLATE.md):
  // near-black field, lifted warm-black panel, one amber accent, sharp corners, Inter
  // for copy and monospace for labels, everything on one left rail. Built from tables
  // with bgcolor attributes and inline styles so Outlook and Gmail render it the same;
  // the colour-scheme metas ask mail apps not to re-colour an already dark design.
  const sans = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
  const mono = "ui-monospace,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";
  const contents: Array<[string, string]> = [
    ['The Index', 'BlackOak Prime Capital Index, the weekly print'],
    ['Confidence', 'BlackOak Confidence Index and its four components'],
    ['The Numbers', 'Dubai and Abu Dhabi sales, rates and rents'],
    ['The View', 'What the week means, in BlackOak’s reading'],
  ];
  const rows = contents
    .map(
      ([label, detail]) => `
              <tr>
                <td valign="top" style="padding:11px 16px 11px 0;border-top:1px solid #26231d;font-family:${mono};font-size:11px;line-height:18px;letter-spacing:1.5px;text-transform:uppercase;color:#ffb000;white-space:nowrap">${escapeHtml(label)}</td>
                <td valign="top" style="padding:11px 0;border-top:1px solid #26231d;font-family:${sans};font-size:14px;line-height:18px;color:#b3ada2">${escapeHtml(detail)}</td>
              </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(subject)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  :root{color-scheme:dark;supported-color-schemes:dark}
  a{text-decoration:none}
  @media (max-width:600px){.bo-pad{padding-left:24px!important;padding-right:24px!important}.bo-title{font-size:32px!important;line-height:36px!important}}
</style>
</head>
<body style="margin:0;padding:0;background:#050505">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#050505">Edition ${edition} is live: this week’s index prints, the numbers that moved and the BlackOak View.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#050505" style="background:#050505">
  <tr>
    <td align="center" style="padding:32px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0e0d0b" style="max-width:580px;background:#0e0d0b;border:1px solid #26231d">
        <tr>
          <td class="bo-pad" align="left" style="padding:36px 40px 0">
            <a href="${link}"><img src="${LOGO_URL}" width="150" height="35" alt="BlackOak Real Estate" style="display:block;border:0;width:150px;height:35px;font-family:${sans};font-size:16px;letter-spacing:2px;color:#e8e6e1"></a>
          </td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" style="padding:30px 40px 0;font-family:${mono};font-size:11px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:#ffb000">UAE Real Estate Intelligence · Published Weekly</td>
        </tr>
        <tr>
          <td class="bo-pad bo-title" align="left" style="padding:12px 40px 0;font-family:${sans};font-size:40px;line-height:44px;font-weight:400;letter-spacing:-0.4px;color:#e8e6e1">The <b style="font-weight:700">Market Briefing</b></td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" style="padding:18px 40px 0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="48" height="2" bgcolor="#ffb000" style="width:48px;height:2px;line-height:2px;font-size:2px;background:#ffb000">&nbsp;</td></tr></table>
          </td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" style="padding:22px 40px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:11px 0;border-top:1px solid #3a3527;border-bottom:1px solid #3a3527;font-family:${mono};font-size:11px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;color:#b3ada2">Edition No. <span style="color:#e8e6e1;font-weight:600">${edition}</span> &nbsp;·&nbsp; <span style="color:#e8e6e1;font-weight:600">${date}</span></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" style="padding:28px 40px 0;font-family:${sans};font-size:16px;line-height:25px;color:#e8e6e1">${escapeHtml(greeting)}</td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" style="padding:10px 40px 0;font-family:${sans};font-size:16px;line-height:25px;color:#b3ada2">This week’s edition of The Market Briefing is now available.</td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" style="padding:24px 40px 0">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #26231d">${rows}
            </table>
          </td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" style="padding:30px 40px 0">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td bgcolor="#ffb000" style="background:#ffb000">
                  <a href="${link}" style="display:inline-block;padding:15px 30px;font-family:${sans};font-size:13px;line-height:16px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#050505;text-decoration:none">Read Edition ${edition}&nbsp;&nbsp;→</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" style="padding:26px 40px 0;font-family:${sans};font-size:13px;line-height:20px;color:#7d786c">${escapeHtml(personal)}</td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" style="padding:12px 40px 36px;font-family:${sans};font-size:12px;line-height:19px;color:#7d786c;word-break:break-all">If the button does not work, copy this address into your browser:<br><a href="${link}" style="color:#b3ada2;text-decoration:underline">${link}</a></td>
        </tr>
        <tr>
          <td class="bo-pad" align="left" bgcolor="#000000" style="padding:22px 40px 24px;background:#000000;border-top:1px solid #4d3a0c;font-family:${sans};font-size:12px;line-height:19px;color:#7d786c">
            <span style="font-family:${mono};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#b3ada2">BlackOak Real Estate</span><br>
            You are receiving this because you subscribed to BlackOak market intelligence.
            <a href="${unsubscribe}" style="color:#b3ada2;text-decoration:underline">Unsubscribe</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
