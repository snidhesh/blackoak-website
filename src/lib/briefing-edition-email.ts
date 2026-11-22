// The Monday email telling subscribers a new edition of The Market Briefing is out:
// a snapshot of the edition (index prints, the villa and apartment split, three
// things that moved, the BlackOak View) above a button to the full Briefing.
// English only: the subscriber list in Resend does not record a language.
//
// The layout follows the design reference kept in the Briefing repository
// (blackoak-briefing-weekly-email.html). What changes each week arrives as
// `content` (src/lib/briefing-email-data.ts); nothing here is edition-specific.

import { escapeHtml } from '@/lib/email';
import { BRIEFING_PUBLIC_ORIGIN } from '@/lib/constants';
import type { EditionEmailContent } from '@/lib/briefing-email-data';

export interface EditionEmailInput {
  /** Edition number as printed on the page, e.g. "010". */
  edition: string;
  /** Release date, e.g. "Monday 16 November 2026". */
  dateLabel: string;
  /** The subscriber's personal link to the Briefing. */
  link: string;
  unsubscribeLink: string;
  content: EditionEmailContent;
}

// "Monday 16 November 2026", built from parts so the wording does not depend on
// which ICU version the runtime ships.
export function editionDateLabel(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('weekday')} ${part('day')} ${part('month')} ${part('year')}`;
}

// Palette of the design reference: navy field, lifted panels, one gold accent,
// green for a rise and coral for a fall.
const GOLD = '#E0B84E';
const UP = '#2FD3A7';
const DOWN = '#E8826B';
const FLAT = '#C9CFD8';
// Type follows the Briefing page: Inter for words, the system monospace for figures.
const BODY = "Inter,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const HEAD = BODY;
const NUM = "ui-monospace,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";
const LOGO_URL = `${BRIEFING_PUBLIC_ORIGIN}/images/logo-white.png`;

const index = (value: number) => value.toFixed(1);
const tone = (value: number) => (value > 0 ? UP : value < 0 ? DOWN : FLAT);

/** "+2.7%", "-2.5%" (a true minus sign in HTML), "0.0%". */
function percent(value: number, minus = '-'): string {
  const text = `${Math.abs(value).toFixed(1)}%`;
  return value > 0 ? `+${text}` : value < 0 ? `${minus}${text}` : text;
}

interface Bar {
  label: string;
  index: number;
  change: number;
  /** The composite row: gold and bold, whatever its direction. */
  lead?: boolean;
}

// One divergence bar: a centre line for "no change", the bar growing right for a
// rise and left for a fall. `half` is the change that fills one side completely.
function barRow(bar: Bar, half: number): string {
  const color = bar.lead ? GOLD : tone(bar.change);
  const width = bar.change === 0 ? 0 : Math.max(2, Math.min(100, Math.round((Math.abs(bar.change) / half) * 100)));
  const fill = (radius: string, align = '') =>
    width === 0
      ? '&nbsp;'
      : `<table role="presentation" width="${width}%"${align} cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${color}" height="12" style="background:${color};height:12px;font-size:0;line-height:0;border-radius:${radius};">&nbsp;</td></tr></table>`;
  const left = bar.change < 0 ? fill('2px 0 0 2px', ' align="right"') : '&nbsp;';
  const right = bar.change < 0 ? '&nbsp;' : fill('0 2px 2px 0');
  const labelStyle = bar.lead ? 'color:#F2EEE6;font-weight:600;' : 'color:#C9CFD8;';
  return `
        <tr>
          <td class="bar-label" width="110" style="padding:7px 0;${labelStyle}">${escapeHtml(bar.label)} <span style="color:#6E7A8A;font-weight:400;">${index(bar.index)}</span></td>
          <td style="padding:7px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="50%"${bar.change < 0 ? ' align="right"' : ''} style="border-right:1px solid #6E7A8A;">${left}</td>
              <td width="50%">${right}</td>
            </tr></table>
          </td>
          <td width="62" align="right" style="padding:7px 0;font-family:${NUM};font-weight:600;color:${color};">${percent(bar.change, '&minus;')}</td>
        </tr>`;
}

export function renderEditionEmail(input: EditionEmailInput): { subject: string; html: string; text: string } {
  const { content } = input;
  const n = content.numbers;
  const subject = `The Market Briefing, Edition ${input.edition} is out`;
  const weekLine = `Week to ${n.weekTo}. 5 Jan 2026 = 100`;

  const bars: Bar[] = [
    { label: 'Villas', index: n.villas.index, change: n.villas.preConflict },
    { label: 'All prime', index: n.composite, change: n.preConflict, lead: true },
    { label: 'Apartments', index: n.apartments.index, change: n.apartments.preConflict },
  ];
  // Each side of the centre line is worth 10%, widened in steps of 5 if a change outgrows it.
  const half = Math.max(10, Math.ceil(Math.max(...bars.map((b) => Math.abs(b.change))) / 5) * 5);

  const text = [
    `The Market Briefing, Edition ${input.edition}, ${input.dateLabel}`,
    '',
    content.headline,
    '',
    `BlackOak Prime Capital Index: ${index(n.composite)} (${weekLine})`,
    `  On the week ${percent(n.wow)}, year to date ${percent(n.ytd)}, vs pre-conflict ${percent(n.preConflict)}`,
    '',
    'Where each segment stands against 23 February, the last reading before the conflict shock:',
    ...bars.map((b) => `  ${b.label} ${index(b.index)}: ${percent(b.change)}`),
    '',
    `BlackOak Confidence Index: ${index(n.confidence)}`,
    content.confidence,
    '',
    'Also this week:',
    ...content.alsoThisWeek.map((item) => `  - ${item}`),
    '',
    'The BlackOak View:',
    content.view,
    '',
    'Read this week’s Briefing (charts, district detail, rates, rentals and the full methodology):',
    input.link,
    '',
    'Journalists: the BPCI print and chart may be quoted with attribution to "The Market Briefing".',
    '',
    'BlackOak Real Estate L.L.C., Office 1406, 14th Floor, Marina Plaza, Al Marsa Street, Dubai Marina, Dubai, UAE. For general information only; not investment advice.',
    '',
    `Unsubscribe: ${input.unsubscribeLink}`,
  ].join('\n');

  const link = escapeHtml(input.link);
  const unsubscribe = escapeHtml(input.unsubscribeLink);
  const edition = escapeHtml(input.edition);
  const date = escapeHtml(input.dateLabel);

  const changeRow = (label: string, value: number, first = false) => {
    const rule = first ? '' : 'border-top:1px solid #243040;';
    return `<tr><td style="padding:3px 0;color:#9AA4B2;${rule}">${label}</td><td align="right" style="padding:3px 0;font-family:${NUM};font-weight:600;color:${tone(value)};${rule}">${percent(value, '&minus;')}</td></tr>`;
  };
  const alsoRows = content.alsoThisWeek
    .map((item, i) => {
      const rule = i === 0 ? '' : 'border-top:1px solid #243040;';
      return `
        <tr><td valign="top" width="16" style="padding:6px 0;color:${GOLD};${rule}">&#9632;</td><td style="padding:6px 0;${rule}">${escapeHtml(item)}</td></tr>`;
    })
    .join('');

  // Tables with bgcolor attributes and inline styles, so Outlook and Gmail render
  // it alike; the Outlook-only block swaps the web fonts for Arial and draws the
  // button as a VML shape, since Outlook ignores padding on links.
  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; }
  img { border:0; outline:none; text-decoration:none; }
  body { margin:0 !important; padding:0 !important; width:100% !important; background:#0B1017; }
  a { color:${GOLD}; }
  .btn a:hover { background:#F0CB66 !important; }
  @media screen and (max-width:620px) {
    .wrap { width:100% !important; }
    .px { padding-left:22px !important; padding-right:22px !important; }
    .hero-num { font-size:58px !important; line-height:62px !important; }
    .stack { display:block !important; width:100% !important; }
    .stack-gap { padding-top:14px !important; }
    .bar-label { width:96px !important; }
  }
</style>
<!--[if mso]><style>body,table,td,p,a{font-family:Arial,Helvetica,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#0B1017;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0B1017;">
  ${escapeHtml(content.preheader)}
  &#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B1017" style="background:#0B1017;">
<tr><td align="center" style="padding:28px 12px 40px;">

  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    <!-- Top utility line -->
    <tr><td class="px" style="padding:0 36px 16px;font-family:${BODY};font-size:12px;line-height:18px;color:#6E7A8A;" align="right">
      <a href="${link}" style="color:#6E7A8A;text-decoration:underline;">View in browser</a>
    </td></tr>

    <!-- Masthead -->
    <tr><td bgcolor="#121A24" style="background:#121A24;border-top:3px solid ${GOLD};border-radius:6px 6px 0 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="px" style="padding:26px 36px 22px;" valign="bottom">
            <img src="${LOGO_URL}" width="150" height="35" alt="BlackOak Real Estate" style="display:block;border:0;width:150px;height:35px;font-family:${HEAD};font-weight:700;font-size:18px;line-height:35px;color:#F2EEE6;">
            <div style="font-family:${HEAD};font-weight:600;font-size:14px;line-height:20px;color:${GOLD};padding-top:10px;">The Market Briefing</div>
          </td>
          <td class="px" style="padding:26px 36px 22px;font-family:${BODY};font-size:12px;line-height:18px;color:#9AA4B2;" align="right" valign="bottom">
            Edition ${edition}<br>${date}
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Hero: the week in one sentence + the BPCI print -->
    <tr><td class="px" bgcolor="#121A24" style="background:#121A24;padding:8px 36px 30px;border-top:1px solid #243040;">
      <h1 style="margin:22px 0 22px;font-family:${HEAD};font-weight:500;font-size:26px;line-height:33px;color:#F2EEE6;">
        ${escapeHtml(content.headline)}
      </h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="stack" valign="bottom" width="58%">
            <div style="font-family:${BODY};font-size:13px;line-height:18px;color:#9AA4B2;padding-bottom:4px;">BlackOak Prime Capital Index</div>
            <div class="hero-num" style="font-family:${NUM};font-weight:600;font-size:72px;line-height:76px;color:${GOLD};letter-spacing:-2px;">${index(n.composite)}</div>
            <div style="font-family:${BODY};font-size:12px;line-height:18px;color:#6E7A8A;padding-top:6px;">${escapeHtml(weekLine)}</div>
          </td>
          <td class="stack stack-gap" valign="bottom" width="42%" style="font-family:${BODY};font-size:14px;line-height:22px;color:#C9CFD8;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${changeRow('On the week', n.wow, true)}
              ${changeRow('Year to date', n.ytd)}
              ${changeRow('Vs pre-conflict', n.preConflict)}
            </table>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- The split: divergence bars from the pre-conflict level -->
    <tr><td class="px" bgcolor="#0F161F" style="background:#0F161F;padding:26px 36px 24px;border-top:1px solid #243040;">
      <div style="font-family:${HEAD};font-weight:700;font-size:15px;line-height:20px;color:#F2EEE6;">Where each segment stands against 23 February</div>
      <div style="font-family:${BODY};font-size:13px;line-height:19px;color:#9AA4B2;padding:4px 0 16px;">The last reading before the conflict shock. Centre line is no change.</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${BODY};font-size:13px;line-height:18px;">${bars.map((b) => barRow(b, half)).join('')}
      </table>
    </td></tr>

    <!-- Confidence Index -->
    <tr><td class="px" bgcolor="#121A24" style="background:#121A24;padding:24px 36px;border-top:1px solid #243040;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top" width="96" style="font-family:${NUM};font-weight:600;font-size:32px;line-height:38px;color:#F2EEE6;">${index(n.confidence)}</td>
          <td valign="top" style="font-family:${BODY};font-size:14px;line-height:21px;color:#C9CFD8;padding-left:6px;">
            <span style="font-family:${HEAD};font-weight:700;color:#F2EEE6;">BlackOak Confidence Index</span><br>
            ${escapeHtml(content.confidence)}
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Three things that moved -->
    <tr><td class="px" bgcolor="#121A24" style="background:#121A24;padding:4px 36px 26px;border-top:1px solid #243040;">
      <div style="font-family:${HEAD};font-weight:700;font-size:15px;line-height:20px;color:#F2EEE6;padding:22px 0 10px;">Also this week</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${BODY};font-size:14px;line-height:21px;color:#C9CFD8;">${alsoRows}
      </table>
    </td></tr>

    <!-- The BlackOak View -->
    <tr><td class="px" bgcolor="#0F161F" style="background:#0F161F;padding:26px 36px;border-top:1px solid #243040;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="3" bgcolor="${GOLD}" style="background:${GOLD};width:3px;font-size:0;line-height:0;">&nbsp;</td>
          <td style="padding-left:18px;">
            <div style="font-family:${BODY};font-size:13px;line-height:18px;color:#9AA4B2;padding-bottom:6px;">The BlackOak View</div>
            <div style="font-family:${HEAD};font-weight:500;font-size:17px;line-height:26px;color:#F2EEE6;">
              ${escapeHtml(content.view)}
            </div>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- CTA -->
    <tr><td class="px" bgcolor="#121A24" align="center" style="background:#121A24;padding:32px 36px 34px;border-top:1px solid #243040;border-radius:0 0 6px 6px;">
      <div style="font-family:${BODY};font-size:14px;line-height:21px;color:#C9CFD8;padding-bottom:18px;">
        Charts, district detail, rates, rentals and the full methodology.
      </div>
      <table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0">
        <tr><td bgcolor="${GOLD}" style="border-radius:4px;background:${GOLD};">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${link}" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="8%" stroke="f" fillcolor="${GOLD}"><center style="color:#0B1017;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Read this week’s Briefing</center></v:roundrect><![endif]-->
          <!--[if !mso]><!-->
          <a href="${link}" style="display:inline-block;padding:15px 34px;font-family:${HEAD};font-weight:700;font-size:16px;line-height:20px;color:#0B1017;text-decoration:none;border-radius:4px;background:${GOLD};">Read this week’s Briefing</a>
          <!--<![endif]-->
        </td></tr>
      </table>
      <div style="font-family:${BODY};font-size:12px;line-height:18px;color:#6E7A8A;padding-top:14px;">About a five-minute read</div>
    </td></tr>

    <!-- Footer -->
    <tr><td class="px" style="padding:28px 36px 0;font-family:${BODY};font-size:12px;line-height:19px;color:#6E7A8A;">
      <p style="margin:0 0 12px;">
        Journalists: the BPCI print and chart may be quoted with attribution to “The Market Briefing”.
      </p>
      <p style="margin:0 0 12px;">
        BlackOak Real Estate L.L.C., Office 1406, 14th Floor, Marina Plaza, Al Marsa Street, Dubai Marina, Dubai, UAE.
        For general information only; not investment advice.
      </p>
      <p style="margin:0;">
        <a href="${unsubscribe}" style="color:#9AA4B2;">Unsubscribe</a>
      </p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
