// Unsubscribe link in the Monday email.
//
//   GET  ?u=<token>   a confirmation page with one button (a GET never unsubscribes,
//                     so mail scanners that follow links cannot do it by accident)
//   POST ?u=<token>   marks the contact unsubscribed in Resend. This is also what a
//                     mail client's own "Unsubscribe" button calls (RFC 8058
//                     one-click, announced in the List-Unsubscribe-Post header).
//
// The token is signed (src/lib/briefing-link.ts), so only the holder of an email we
// sent can unsubscribe that address. /api/briefing/notify skips unsubscribed contacts.

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/email';
import { verifyUnsubscribeToken } from '@/lib/briefing-link';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function page(title: string, body: string, status = 200): NextResponse {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${escapeHtml(title)} | BlackOak Real Estate</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f4f5;color:#181a20;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
main{max-width:440px;margin:16px;background:#fff;padding:36px 32px}h1{font-size:20px;margin:0 0 14px}p{font-size:15px;line-height:1.55;margin:0 0 18px;color:#3d4047}
button{background:#181a20;color:#fff;border:0;font:inherit;font-size:14px;letter-spacing:.06em;padding:13px 24px;cursor:pointer}a{color:#181a20}</style>
</head><body><main><h1>${escapeHtml(title)}</h1>${body}</main></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
  });
}

const invalid = () =>
  page(
    'This link is not valid',
    '<p>The unsubscribe link is incomplete or has been altered. Please use the link at the bottom of a BlackOak email, or write to <a href="mailto:info@blackoak-re.com">info@blackoak-re.com</a>.</p>',
    400
  );

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('u');
  const email = await verifyUnsubscribeToken(token);
  if (!email || !token) return invalid();
  return page(
    'Unsubscribe from The Market Briefing',
    `<p>Stop sending the weekly Market Briefing email to <strong>${escapeHtml(email)}</strong>?</p>
     <form method="post" action="?u=${encodeURIComponent(token)}"><button type="submit">Unsubscribe</button></form>`
  );
}

export async function POST(request: NextRequest) {
  const limit = await checkRateLimit(getClientIP(request), 'briefing-unsubscribe');
  if (!limit.success) return page('Please try again shortly', '<p>Too many requests. Please try again in a minute.</p>', 429);

  const email = await verifyUnsubscribeToken(request.nextUrl.searchParams.get('u'));
  if (!email) return invalid();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[api/briefing/unsubscribe] Missing RESEND_API_KEY');
    return page('Something went wrong', '<p>We could not process this just now. Please try again later.</p>', 500);
  }

  try {
    const { error } = await new Resend(apiKey).contacts.update({ email, unsubscribed: true });
    // An address that is no longer on the list has nothing left to unsubscribe.
    if (error && !/not found/i.test(error.message)) {
      console.error('[api/briefing/unsubscribe] Resend error:', error);
      return page('Something went wrong', '<p>We could not process this just now. Please try again later.</p>', 502);
    }
  } catch (error) {
    console.error('[api/briefing/unsubscribe] Request failed:', error);
    return page('Something went wrong', '<p>We could not process this just now. Please try again later.</p>', 502);
  }

  return page(
    'You are unsubscribed',
    `<p><strong>${escapeHtml(email)}</strong> will no longer receive the weekly Market Briefing email.</p>`
  );
}
