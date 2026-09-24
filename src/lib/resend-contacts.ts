// Keeps a durable copy of every verified subscriber in Resend's contact list, so
// the team has a list to export and to send the promised market updates to.
// Best-effort: the verify route treats a failure here as a logged warning, never
// as a reason to refuse the visitor who just proved their address.

import { Resend } from 'resend';

export interface SubscriberContact {
  email: string;
  firstName: string;
  lastName: string;
}

export interface AddContactResult {
  success: boolean;
  error?: string;
}

export async function addSubscriberContact(contact: SubscriberContact): Promise<AddContactResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[resend-contacts] DEV — Resend not configured, contact NOT saved: ${contact.email}`);
      return { success: true };
    }
    console.error('[resend-contacts] Missing RESEND_API_KEY');
    return { success: false, error: 'Resend not configured' };
  }

  // Optional: a Resend segment (formerly "audience") to file the contact under.
  // Without it the contact still lands in the account-wide contact list.
  const segmentId = process.env.RESEND_SEGMENT_ID?.trim();

  try {
    const { error } = await new Resend(apiKey).contacts.create({
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      unsubscribed: false,
      ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
    });
    if (error) {
      // An address that is already on the list is not a failure for our purposes.
      if (/already exists/i.test(error.message)) return { success: true };
      console.error('[resend-contacts] Resend error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown';
    console.error('[resend-contacts] Request failed:', msg);
    return { success: false, error: msg };
  }
}
