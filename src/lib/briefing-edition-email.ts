// The Monday email telling subscribers a new edition of The Market Briefing is out.
// English only: the subscriber list in Resend does not record a language.

import { escapeHtml } from '@/lib/email';

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
  const intro = `Edition ${input.edition} of The Market Briefing is now available: this week's BlackOak Prime Capital Index and Confidence Index, the numbers that moved the UAE property market, and the BlackOak View.`;
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

  // Table-free and inline-styled, like the verification email, so it holds up in
  // every mail client. The button is a plain link: no images, nothing to block.
  const html = `
    <div style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#181a20">
      <div style="max-width:520px;margin:0 auto;background:#ffffff">
        <div style="background:#181a20;padding:24px 32px;color:#ffffff;font-size:15px;letter-spacing:2px;text-transform:uppercase">BlackOak Real Estate</div>
        <div style="padding:32px">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#b07a1e">The Market Briefing</p>
          <p style="margin:0 0 24px;font-size:22px;line-height:1.3;font-weight:600">Edition ${escapeHtml(input.edition)} · ${escapeHtml(input.dateLabel)}</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 28px;font-size:16px;line-height:1.5">${escapeHtml(intro)}</p>
          <p style="margin:0 0 28px">
            <a href="${link}" style="display:inline-block;background:#181a20;color:#ffffff;text-decoration:none;font-size:15px;letter-spacing:1px;padding:14px 28px">Read this week’s Briefing</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#55585f">${escapeHtml(personal)}</p>
          <p style="margin:0;font-size:13px;line-height:1.5;color:#55585f;word-break:break-all">If the button does not work, copy this address into your browser:<br><a href="${link}" style="color:#55585f">${link}</a></p>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #e4e4e7;font-size:12px;line-height:1.5;color:#7a7d85">
          You are receiving this because you subscribed to BlackOak market intelligence.
          <a href="${unsubscribe}" style="color:#7a7d85">Unsubscribe</a>
        </div>
      </div>
    </div>
  `;

  return { subject, html, text };
}
