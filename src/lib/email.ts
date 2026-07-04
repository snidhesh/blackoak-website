import { Resend } from 'resend';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface SendFormEmailInput {
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface SendFormEmailResult {
  success: boolean;
  error?: string;
}

export async function sendFormEmail(input: SendFormEmailInput): Promise<SendFormEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.EMAIL_TO;

  if (!apiKey || !from || !to) {
    console.error('[email] Missing RESEND_API_KEY, EMAIL_FROM, or EMAIL_TO');
    return { success: false, error: 'Email not configured' };
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: to.split(',').map((t) => t.trim()).filter(Boolean),
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
      attachments: input.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    if (error) {
      console.error('[email] Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown';
    console.error('[email] Send failed:', msg);
    return { success: false, error: msg };
  }
}

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => escapeMap[c]);
}

export function renderFieldsTable(rows: Array<[label: string, value: string | number | undefined | null]>): string {
  const cells = rows
    .filter(([, v]) => v !== undefined && v !== null && String(v).length > 0)
    .map(([label, value]) => {
      const safeLabel = escapeHtml(label);
      const safeValue = escapeHtml(String(value)).replace(/\n/g, '<br>');
      return `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;font-weight:600;color:#111;white-space:nowrap">${safeLabel}</td><td style="padding:6px 0;vertical-align:top;color:#333">${safeValue}</td></tr>`;
    })
    .join('');
  return `<table style="border-collapse:collapse;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.5">${cells}</table>`;
}
