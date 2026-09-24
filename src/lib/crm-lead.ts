// Forwards project enquiries and verified newsletter subscribers to the CRM
// inbound-lead endpoint.
// Pattern mirrors the JPJ4J2 sibling project: minimal { name, phone, email, note }
// payload with Bearer auth. Single attempt — lead intake isn't idempotent.

import type { ProjectEnquiryFormData } from '@/lib/schemas';

const NOTE_MAX = 2000;
const EMAIL_MAX = 200;
const TIMEOUT_MS = 10_000;

export interface CrmLeadResult {
  success: boolean;
  status?: number;
}

export interface CrmLeadInput {
  data: ProjectEnquiryFormData;
  utm?: Record<string, string>;
}

// UAE-aware E.164 normalizer. The site's form UI shows a fixed +971 chip but
// only the local number is submitted in `phone`, so we default to UAE when no
// country indicator is present.
export function toE164(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) {
    return '+' + trimmed.slice(1).replace(/\D/g, '');
  }
  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('00971')) digits = digits.slice(2);
  else if (digits.startsWith('971')) {
    // already country-prefixed
  } else if (digits.startsWith('0')) digits = '971' + digits.slice(1);
  else digits = '971' + digits;
  return '+' + digits;
}

function buildNote(input: CrmLeadInput): string {
  const { data, utm } = input;
  const lines: string[] = [];
  if (data.message) lines.push(data.message);
  if (data.projectName) lines.push(`Project: ${data.projectName}`);
  if (data.projectSlug) lines.push(`Slug: ${data.projectSlug}`);
  if (data.reference) lines.push(`Reference: ${data.reference}`);
  lines.push('Source: blackoak-website');
  if (utm && Object.keys(utm).length > 0) {
    const utmString = Object.entries(utm)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    lines.push(`UTM: ${utmString}`);
  }
  lines.push('Consent: granted');
  return lines.join('\n').slice(0, NOTE_MAX);
}

export async function submitCrmLead(input: CrmLeadInput): Promise<CrmLeadResult> {
  const { data } = input;
  const payload: Record<string, unknown> = {
    name: `${data.firstName} ${data.lastName}`.trim(),
    phone: toE164(data.phone),
    note: buildNote(input),
  };
  if (data.email) payload.email = data.email.slice(0, EMAIL_MAX);
  return postLead(payload, 'crm-lead');
}

export interface NewsletterCrmLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  /** Raw phone as typed, normalised to E.164 here. Omitted when the visitor gave none. */
  phone?: string;
  locale?: string;
  sourceLabel: string;
  utm?: Record<string, string>;
}

// A verified newsletter subscriber, filed as a lead so the sales team sees it.
// Provenance goes into `note`, the only free-text field the intake accepts.
export async function submitNewsletterCrmLead(input: NewsletterCrmLeadInput): Promise<CrmLeadResult> {
  const lines = [
    `${input.sourceLabel} subscriber (email verified with a one-time code)`,
    'Source: blackoak-website',
  ];
  if (input.locale) lines.push(`Language: ${input.locale}`);
  if (input.utm && Object.keys(input.utm).length > 0) {
    lines.push(`UTM: ${Object.entries(input.utm).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  }
  lines.push('Consent: agreed to receive market updates by email');

  const payload: Record<string, unknown> = {
    name: `${input.firstName} ${input.lastName}`.trim(),
    email: input.email.slice(0, EMAIL_MAX),
    note: lines.join('\n').slice(0, NOTE_MAX),
    leadType: 'Newsletter subscriber',
  };
  if (input.phone?.trim()) payload.phone = toE164(input.phone);
  return postLead(payload, 'crm-lead/newsletter');
}

async function postLead(payload: Record<string, unknown>, tag: string): Promise<CrmLeadResult> {
  const endpoint = process.env.CRM_LEAD_ENDPOINT;
  const token = process.env.CRM_LEAD_TOKEN;

  if (!endpoint) {
    console.warn(`[${tag}] CRM_LEAD_ENDPOINT not configured; skipping submission`);
    return { success: true };
  }
  if (!token) {
    console.error(`[${tag}] CRM_LEAD_TOKEN missing while CRM_LEAD_ENDPOINT is set`);
    return { success: false };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(`[${tag}] CRM rejected lead:`, res.status);
      return { success: false, status: res.status };
    }
    return { success: true, status: res.status };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown';
    console.error(`[${tag}] Request failed:`, msg);
    return { success: false };
  }
}
