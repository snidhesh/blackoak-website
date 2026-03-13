export const COMPANY = {
  name: 'BlackOak Real Estate',
  tagline: 'A global luxury real estate firm delivering expert guidance, exclusive opportunities, and tailored investment services.',
  email: 'info@blackoak-re.com',
  phone: '+971 4 398 9055',
  whatsapp: 'https://wa.me/97143989055',
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
  { platform: 'facebook', url: 'https://facebook.com/blackoakre', icon: 'Facebook' },
  { platform: 'twitter', url: 'https://x.com/blackoakre', icon: 'Twitter' },
  { platform: 'linkedin', url: 'https://linkedin.com/company/blackoakre', icon: 'Linkedin' },
  { platform: 'whatsapp', url: 'https://wa.me/97143989055', icon: 'MessageCircle' },
  { platform: 'instagram', url: 'https://instagram.com/blackoakre', icon: 'Instagram' },
  { platform: 'youtube', url: 'https://youtube.com/blackoakre', icon: 'Youtube' },
] as const;

export const PHONE_PREFIX = '+971';
