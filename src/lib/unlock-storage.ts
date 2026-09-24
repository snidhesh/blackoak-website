// Browser-side state for the subscribe-to-unlock gates. Storage can throw (private
// mode, site data blocked), so every access is wrapped: on failure the visitor
// simply sees the gate, or loses the pending code on reload.

import { MI_SUBSCRIBED_STORAGE_KEY, type SubscribeSource } from '@/lib/constants';
import type { NewsletterFormData } from '@/lib/schemas';

const PENDING_STORAGE_KEY = 'blackoak-mi-pending';

export type SignupBody = NewsletterFormData & {
  locale: string;
  source: SubscribeSource;
  utm?: Record<string, string>;
};

// A code has been emailed and is waiting to be typed in. `body` is kept so
// "Resend code" can ask for a fresh one without the visitor retyping anything.
export interface Pending {
  challenge: string;
  expiresAt: number;
  body: SignupBody;
}

export function hasSubscribed(): boolean {
  try {
    return localStorage.getItem(MI_SUBSCRIBED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function rememberSubscription(): void {
  try {
    localStorage.setItem(MI_SUBSCRIBED_STORAGE_KEY, '1');
  } catch {
    // Storage blocked: the visitor stays unlocked for this page view only.
  }
}

// sessionStorage, so a pending code survives a reload. Phones routinely reload the
// tab when the visitor comes back from their mail app with the code.
export function loadPending(): Pending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_STORAGE_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw) as Pending;
    if (typeof pending?.challenge !== 'string' || !(pending.expiresAt > Date.now())) {
      sessionStorage.removeItem(PENDING_STORAGE_KEY);
      return null;
    }
    return pending;
  } catch {
    return null;
  }
}

export function savePending(pending: Pending | null): void {
  try {
    if (pending) sessionStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(pending));
    else sessionStorage.removeItem(PENDING_STORAGE_KEY);
  } catch {
    // Storage blocked: the code step simply will not survive a reload.
  }
}

export function hasPendingCode(): boolean {
  return loadPending() !== null;
}
