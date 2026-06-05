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
