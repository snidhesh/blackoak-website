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

interface DeliverInput extends SendFormEmailInput {
  to: string[];
  text?: string;
  /**
   * Development only: when Resend is not configured, print the message to the
   * server console and report success, so a flow that depends on receiving an
   * email (the Market Intelligence code) can be exercised locally. Never applies
   * in production, where a missing key is always a failure.
   */
  devConsoleFallback?: boolean;
}

/** Team-facing: delivers to the EMAIL_TO inbox. */
export async function sendFormEmail(
  input: SendFormEmailInput & { devConsoleFallback?: boolean }
): Promise<SendFormEmailResult> {
  const to = (process.env.EMAIL_TO ?? '').split(',').map((t) => t.trim()).filter(Boolean);
  if (to.length === 0 && !(input.devConsoleFallback && process.env.NODE_ENV !== 'production')) {
    console.error('[email] Missing EMAIL_TO');
    return { success: false, error: 'Email not configured' };
  }
  return deliver({ ...input, to: to.length > 0 ? to : ['team-inbox (EMAIL_TO not set)'] });
}

/** Visitor-facing: delivers to an address the visitor supplied. */
export async function sendVisitorEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  devConsoleFallback?: boolean;
}): Promise<SendFormEmailResult> {
  return deliver({ ...input, to: [input.to] });
}

async function deliver(input: DeliverInput): Promise<SendFormEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (input.devConsoleFallback && process.env.NODE_ENV !== 'production') {
      console.info(
        `\n[email] DEV FALLBACK — Resend is not configured, so this email was NOT sent.\n` +
          `  To:      ${input.to.join(', ')}\n` +
          `  Subject: ${input.subject}\n` +
          (input.text ? `  ${input.text.split('\n').join('\n  ')}\n` : '')
      );
      return { success: true };
    }
    console.error('[email] Missing RESEND_API_KEY or EMAIL_FROM');
    return { success: false, error: 'Email not configured' };
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
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
