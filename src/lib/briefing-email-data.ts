// What the Monday edition email says: read from the Briefing's own deployment.
//
// The Briefing repository publishes briefing/email.json with every edition. Its
// "numbers" are copied from the edition page by that repo's
// scripts/build_email_data.py; the words are written for the edition and reviewed
// in the edition pull request. Reading the file here, at send time, means the
// email always quotes the edition that is actually live.

import { z } from 'zod';
import { BRIEFING_ORIGIN } from '@/lib/constants';
import { BRIEFING_PATH } from '@/lib/briefing-proxy';

const line = (max: number) => z.string().trim().min(1).max(max);
const indexValue = z.number().min(0).max(1000);
const change = z.number().min(-100).max(1000);

export const editionEmailSchema = z.object({
  edition: z.string().regex(/^\d{3}$/),
  preheader: line(200),
  headline: line(160),
  confidence: line(300),
  alsoThisWeek: z.array(line(160)).length(3),
  view: line(360),
  numbers: z.object({
    /** Last day of the index week, e.g. "12 November". */
    weekTo: z.string().regex(/^\d{1,2} [A-Z][a-z]+$/),
    composite: indexValue,
    wow: change,
    ytd: change,
    preConflict: change,
    villas: z.object({ index: indexValue, preConflict: change }),
    apartments: z.object({ index: indexValue, preConflict: change }),
    confidence: z.number().min(0).max(100),
  }),
});

export type EditionEmailContent = z.infer<typeof editionEmailSchema>;

export type EditionEmailContentResult = { ok: true; content: EditionEmailContent } | { ok: false; error: string };

/**
 * Fetches and validates the email content for `edition`. Fails, rather than fall
 * back to anything, when the file is missing, malformed or written for another
 * edition: a wrong number in every subscriber's inbox cannot be taken back.
 */
export async function fetchEditionEmailContent(edition: string): Promise<EditionEmailContentResult> {
  const url = `${BRIEFING_ORIGIN}${BRIEFING_PATH}/email.json?edition=${edition}&t=${Date.now()}`;
  let body: unknown;
  try {
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
    if (!response.ok) return { ok: false, error: `email.json responded ${response.status}` };
    body = await response.json();
  } catch (error) {
    return { ok: false, error: `could not read email.json: ${error instanceof Error ? error.message : 'unknown'}` };
  }
  const parsed = editionEmailSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `email.json is invalid at ${issue?.path.join('.') || 'root'}: ${issue?.message ?? 'unknown'}` };
  }
  if (parsed.data.edition !== edition) {
    return { ok: false, error: `email.json is written for edition ${parsed.data.edition}, not ${edition}` };
  }
  return { ok: true, content: parsed.data };
}
