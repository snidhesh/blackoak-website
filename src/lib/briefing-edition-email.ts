// The Monday email telling subscribers a new edition of The Market Briefing is out.
// It is a teaser, not a summary: the week's headline, the two index readings shown
// only as blurred figures, a button to the Briefing, and three things that moved.
// Neither the readings nor the direction they moved appear anywhere in it, HTML or
// plain text, so the only way to learn them is to open the edition.
// English only: the subscriber list in Resend does not record a language.
//
// What changes each week arrives as `content` (src/lib/briefing-email-data.ts);
// nothing here is edition-specific. `content` still carries the fuller summary
// (confidence note, the View, segment figures); the email does not print it.

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

// Navy field, lifted panels, one gold accent.
const GOLD = '#E0B84E';
// Type follows the Briefing page: Inter for words, the system monospace for figures.
const BODY = "Inter,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const HEAD = BODY;
const NUM = "ui-monospace,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace";
const LOGO_URL = `${BRIEFING_PUBLIC_ORIGIN}/images/logo-white.png`;
// The index figures are not in the email. Where they would be, it shows these
// pictures of a blurred number: the same two pictures every week, drawn from
// made-up digits, so no reading can be recovered from them. Pictures rather than
// a CSS blur because Gmail and Outlook drop `filter`, and a blur that fails
// would print the number.
const FIGURE_GOLD_URL = `${BRIEFING_PUBLIC_ORIGIN}/images/briefing-email/figure-gold.png`;
const FIGURE_LIGHT_URL = `${BRIEFING_PUBLIC_ORIGIN}/images/briefing-email/figure-light.png`;

export function renderEditionEmail(input: EditionEmailInput): { subject: string; html: string; text: string } {
  const { content } = input;
  const subject = `The Market Briefing #${input.edition}`;

  const text = [
    `The Market Briefing, Edition ${input.edition}, ${input.dateLabel}`,
    '',
    content.headline,
    '',
    'This week’s prints are in: the BlackOak Prime Capital Index and the BlackOak Confidence Index.',
    'See the figures:',
    input.link,
    '',
    'Also in this edition:',
    ...content.alsoThisWeek.map((item) => `  - ${item}`),
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

  // The alt text is what shows where pictures are switched off, so it is styled too.
  const figure = (src: string, width: number, height: number, color: string) =>
    `<a href="${link}" style="text-decoration:none;"><img src="${src}" width="${width}" height="${height}" alt="In the Briefing" style="display:block;border:0;width:${width}px;max-width:100%;height:auto;font-family:${NUM};font-weight:600;font-size:15px;line-height:${height}px;color:${color};"></a>`;
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
    .figure-cell { padding-left:16px !important; padding-right:12px !important; }
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

    <!-- The week in one sentence, the two index readings held back, the button -->
    <tr><td class="px" bgcolor="#121A24" align="center" style="background:#121A24;padding:8px 36px 32px;border-top:1px solid #243040;">
      <h1 style="margin:22px 0 22px;font-family:${HEAD};font-weight:500;font-size:24px;line-height:31px;color:#F2EEE6;text-align:left;">
        ${escapeHtml(content.headline)}
      </h1>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0F161F" style="background:#0F161F;border:1px solid #243040;table-layout:fixed;">
        <tr>
          <td class="figure-cell" valign="top" align="left" width="58%" style="padding:18px 16px 6px 22px;font-family:${BODY};font-size:13px;line-height:18px;color:#9AA4B2;">Prime Capital Index</td>
          <td class="figure-cell" valign="top" align="left" width="42%" style="padding:18px 16px 6px 22px;border-left:1px solid #243040;font-family:${BODY};font-size:13px;line-height:18px;color:#9AA4B2;">Confidence Index</td>
        </tr>
        <tr>
          <td class="figure-cell" valign="middle" align="left" style="padding:0 16px 14px 22px;">${figure(FIGURE_GOLD_URL, 232, 84, GOLD)}</td>
          <td class="figure-cell" valign="middle" align="left" style="padding:0 16px 14px 22px;border-left:1px solid #243040;">${figure(FIGURE_LIGHT_URL, 138, 60, '#F2EEE6')}</td>
        </tr>
      </table>
      <div style="font-family:${HEAD};font-weight:600;font-size:19px;line-height:26px;color:#F2EEE6;padding:24px 0 18px;">
        This week’s prints are in.
      </div>
      <table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0">
        <tr><td bgcolor="${GOLD}" style="border-radius:4px;background:${GOLD};">
          <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${link}" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="8%" stroke="f" fillcolor="${GOLD}"><center style="color:#0B1017;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">See the figures</center></v:roundrect><![endif]-->
          <!--[if !mso]><!-->
          <a href="${link}" style="display:inline-block;padding:15px 34px;font-family:${HEAD};font-weight:700;font-size:16px;line-height:20px;color:#0B1017;text-decoration:none;border-radius:4px;background:${GOLD};">See the figures</a>
          <!--<![endif]-->
        </td></tr>
      </table>
      <div style="font-family:${BODY};font-size:12px;line-height:18px;color:#6E7A8A;padding-top:14px;">About a five-minute read</div>
    </td></tr>

    <!-- Three things that moved -->
    <tr><td class="px" bgcolor="#0F161F" style="background:#0F161F;padding:4px 36px 24px;border-top:1px solid #243040;border-radius:0 0 6px 6px;">
      <div style="font-family:${HEAD};font-weight:700;font-size:15px;line-height:20px;color:#F2EEE6;padding:20px 0 8px;">Also in this edition</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${BODY};font-size:14px;line-height:21px;color:#C9CFD8;">${alsoRows}
      </table>
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
