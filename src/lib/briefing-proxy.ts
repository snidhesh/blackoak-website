// Shared between the Edge middleware and the /briefing route handler, so both
// apply the same rules to the same raw path. No Node-only imports here.

export const BRIEFING_PATH = '/briefing';
export const HUB_PATH = '/insights/intelligence/';

// Encoded dot / slash / backslash / percent (double encoding), or a literal
// backslash: none belong in a briefing URL, and any of them could let a path
// resolve outside /briefing/ on the origin once it is decoded.
const TRAVERSAL = /%2e|%2f|%5c|%25|\\/i;

export const hasBriefingPrefix = (pathname: string): boolean =>
  pathname === BRIEFING_PATH || pathname.startsWith(`${BRIEFING_PATH}/`);

export const isTraversal = (pathname: string): boolean => TRAVERSAL.test(pathname);
