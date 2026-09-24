export const COMPANY = {
  name: 'BlackOak Real Estate',
  tagline: 'A global luxury real estate firm delivering expert guidance, exclusive opportunities, and tailored investment services.',
  email: 'info@blackoak-re.com',
  phone: '+971 4 398 9055',
  whatsapp: 'https://wa.me/971501046890',
} as const;

export const ADDRESSES = {
  dubai: {
    label: 'Dubai',
    lines: [
      'Marina Plaza, Office 1406, Dubai Marina',
      'Dubai, UAE',
    ],
  },
  london: {
    label: 'London',
    lines: [
      '71-75 Shelton Street, London, WC2H 9JQ,',
      'United Kingdom',
    ],
  },
} as const;

export const SOCIAL_LINKS = [
  { platform: 'facebook', url: 'https://www.facebook.com/BlackOakRealEstate/', icon: 'Facebook' },
  { platform: 'linkedin', url: 'https://ae.linkedin.com/company/blackoak-real-estate', icon: 'Linkedin' },
  { platform: 'whatsapp', url: 'https://wa.me/971501046890', icon: 'MessageCircle' },
  { platform: 'instagram', url: 'https://www.instagram.com/blackoakdubai/', icon: 'Instagram' },
  { platform: 'tiktok', url: 'https://www.tiktok.com/@blackoak.realestate', icon: 'TikTok' },
  { platform: 'youtube', url: 'https://www.youtube.com/@blackoakrealestate', icon: 'Youtube' },
] as const;

export const PHONE_PREFIX = '+971';

// localStorage flag set once a visitor subscribes on Market Intelligence or the
// Intelligence Hub. Read by the gate components and the pages' pre-paint inline
// script, so it lives here rather than in a 'use client' component file.
export const MI_SUBSCRIBED_STORAGE_KEY = 'blackoak-mi-subscribed';

// Runs before first paint so returning subscribers never see the locked state
// (globals.css reveals gated content when data-mi-unlocked is set). localStorage
// throws when storage is blocked, hence the try/catch: on failure the visitor
// simply sees the gate.
export const MI_PRE_PAINT_UNLOCK_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(
  MI_SUBSCRIBED_STORAGE_KEY
)})==='1'){document.documentElement.dataset.miUnlocked='1'}}catch(e){}`;

// Hub variant: when the middleware bounced the visitor here with ?next=, the cookie
// is missing or expired, so the tiles must show locked even for a browser that
// remembers an earlier subscription.
export const HUB_PRE_PAINT_UNLOCK_SCRIPT = `try{if(!/[?&]next=/.test(location.search)&&localStorage.getItem(${JSON.stringify(
  MI_SUBSCRIBED_STORAGE_KEY
)})==='1'){document.documentElement.dataset.miUnlocked='1'}}catch(e){}`;

// Where a subscription was started. Travels inside the signed challenge so the
// team email and the verification copy can say which product was unlocked.
export const SUBSCRIBE_SOURCES = ['market-intelligence', 'intelligence-hub'] as const;
export type SubscribeSource = (typeof SUBSCRIBE_SOURCES)[number];

// The Briefing: static site on a separate Vercel project, proxied by the
// middleware under /briefing once the visitor holds the access cookie.
export const BRIEFING_ORIGIN = 'https://blackoak-briefing.vercel.app';
export const INTEL_ACCESS_COOKIE = 'blackoak-intel-access';
export const INTEL_ACCESS_TTL_MS = 90 * 24 * 60 * 60 * 1000;
