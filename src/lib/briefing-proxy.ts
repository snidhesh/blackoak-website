// Shared between the Edge middleware and the /briefing route handler, so both
// apply the same rules to the same raw path. No Node-only imports here.

export const BRIEFING_PATH = '/briefing';
export const HUB_PATH = '/insights/intelligence/';
export const BRIEFING_INDEX_PATH = `${BRIEFING_PATH}/index.html`;
export const BRIEFING_PREVIEW_PATH = `${BRIEFING_PATH}/preview`;

// Served without the access cookie: the one-time preview page and the logo it
// shows on its subscribe wall. Nothing else under /briefing is public.
const PUBLIC_PATHS = new Set([BRIEFING_PREVIEW_PATH, `${BRIEFING_PREVIEW_PATH}/`, `${BRIEFING_PATH}/Logo_2k.png`]);
export const isPublicBriefingPath = (pathname: string): boolean => PUBLIC_PATHS.has(pathname);
export const isPreviewPage = (pathname: string): boolean =>
  pathname === BRIEFING_PREVIEW_PATH || pathname === `${BRIEFING_PREVIEW_PATH}/`;

// Encoded dot / slash / backslash / percent (double encoding), or a literal
// backslash: none belong in a briefing URL, and any of them could let a path
// resolve outside /briefing/ on the origin once it is decoded.
const TRAVERSAL = /%2e|%2f|%5c|%25|\\/i;

export const hasBriefingPrefix = (pathname: string): boolean =>
  pathname === BRIEFING_PATH || pathname.startsWith(`${BRIEFING_PATH}/`);

export const isTraversal = (pathname: string): boolean => TRAVERSAL.test(pathname);
