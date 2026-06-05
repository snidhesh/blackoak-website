'use client';

import { ChevronDown } from 'lucide-react';

interface DialEntry {
  iso: string;     // ISO 3166-1 alpha-2 (acts as React key)
  code: string;    // dial code, e.g. "+971"
  name: string;    // country name (used as accessible label)
  flag: string;    // emoji flag (falls back gracefully on platforms without flag emojis)
}

// Curated list — Gulf + major source markets for luxury Dubai real estate.
// Kept compact so the dropdown stays usable; can grow as needed.
export const PHONE_DIAL_CODES: DialEntry[] = [
  { iso: 'AE', code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { iso: 'SA', code: '+966', name: 'Saudi Arabia',         flag: '🇸🇦' },
  { iso: 'KW', code: '+965', name: 'Kuwait',               flag: '🇰🇼' },
  { iso: 'QA', code: '+974', name: 'Qatar',                flag: '🇶🇦' },
  { iso: 'BH', code: '+973', name: 'Bahrain',              flag: '🇧🇭' },
  { iso: 'OM', code: '+968', name: 'Oman',                 flag: '🇴🇲' },
  { iso: 'US', code: '+1',   name: 'United States',        flag: '🇺🇸' },
  { iso: 'CA', code: '+1',   name: 'Canada',               flag: '🇨🇦' },
  { iso: 'GB', code: '+44',  name: 'United Kingdom',       flag: '🇬🇧' },
  { iso: 'IE', code: '+353', name: 'Ireland',              flag: '🇮🇪' },
  { iso: 'DE', code: '+49',  name: 'Germany',              flag: '🇩🇪' },
  { iso: 'FR', code: '+33',  name: 'France',               flag: '🇫🇷' },
  { iso: 'IT', code: '+39',  name: 'Italy',                flag: '🇮🇹' },
  { iso: 'ES', code: '+34',  name: 'Spain',                flag: '🇪🇸' },
  { iso: 'PT', code: '+351', name: 'Portugal',             flag: '🇵🇹' },
  { iso: 'CH', code: '+41',  name: 'Switzerland',          flag: '🇨🇭' },
  { iso: 'NL', code: '+31',  name: 'Netherlands',          flag: '🇳🇱' },
  { iso: 'BE', code: '+32',  name: 'Belgium',              flag: '🇧🇪' },
  { iso: 'SE', code: '+46',  name: 'Sweden',               flag: '🇸🇪' },
  { iso: 'NO', code: '+47',  name: 'Norway',               flag: '🇳🇴' },
  { iso: 'DK', code: '+45',  name: 'Denmark',              flag: '🇩🇰' },
  { iso: 'FI', code: '+358', name: 'Finland',              flag: '🇫🇮' },
  { iso: 'AT', code: '+43',  name: 'Austria',              flag: '🇦🇹' },
  { iso: 'GR', code: '+30',  name: 'Greece',               flag: '🇬🇷' },
  { iso: 'PL', code: '+48',  name: 'Poland',               flag: '🇵🇱' },
  { iso: 'CZ', code: '+420', name: 'Czechia',              flag: '🇨🇿' },
  { iso: 'TR', code: '+90',  name: 'Turkey',               flag: '🇹🇷' },
  { iso: 'RU', code: '+7',   name: 'Russia',               flag: '🇷🇺' },
  { iso: 'UA', code: '+380', name: 'Ukraine',              flag: '🇺🇦' },
  { iso: 'IL', code: '+972', name: 'Israel',               flag: '🇮🇱' },
  { iso: 'EG', code: '+20',  name: 'Egypt',                flag: '🇪🇬' },
  { iso: 'JO', code: '+962', name: 'Jordan',               flag: '🇯🇴' },
  { iso: 'LB', code: '+961', name: 'Lebanon',              flag: '🇱🇧' },
  { iso: 'IN', code: '+91',  name: 'India',                flag: '🇮🇳' },
  { iso: 'PK', code: '+92',  name: 'Pakistan',             flag: '🇵🇰' },
  { iso: 'BD', code: '+880', name: 'Bangladesh',           flag: '🇧🇩' },
  { iso: 'LK', code: '+94',  name: 'Sri Lanka',            flag: '🇱🇰' },
  { iso: 'CN', code: '+86',  name: 'China',                flag: '🇨🇳' },
  { iso: 'HK', code: '+852', name: 'Hong Kong',            flag: '🇭🇰' },
  { iso: 'TW', code: '+886', name: 'Taiwan',               flag: '🇹🇼' },
  { iso: 'JP', code: '+81',  name: 'Japan',                flag: '🇯🇵' },
  { iso: 'KR', code: '+82',  name: 'South Korea',          flag: '🇰🇷' },
  { iso: 'SG', code: '+65',  name: 'Singapore',            flag: '🇸🇬' },
  { iso: 'MY', code: '+60',  name: 'Malaysia',             flag: '🇲🇾' },
  { iso: 'TH', code: '+66',  name: 'Thailand',             flag: '🇹🇭' },
  { iso: 'ID', code: '+62',  name: 'Indonesia',            flag: '🇮🇩' },
  { iso: 'PH', code: '+63',  name: 'Philippines',          flag: '🇵🇭' },
  { iso: 'VN', code: '+84',  name: 'Vietnam',              flag: '🇻🇳' },
  { iso: 'AU', code: '+61',  name: 'Australia',            flag: '🇦🇺' },
  { iso: 'NZ', code: '+64',  name: 'New Zealand',          flag: '🇳🇿' },
  { iso: 'ZA', code: '+27',  name: 'South Africa',         flag: '🇿🇦' },
  { iso: 'NG', code: '+234', name: 'Nigeria',              flag: '🇳🇬' },
  { iso: 'KE', code: '+254', name: 'Kenya',                flag: '🇰🇪' },
  { iso: 'MA', code: '+212', name: 'Morocco',              flag: '🇲🇦' },
  { iso: 'BR', code: '+55',  name: 'Brazil',               flag: '🇧🇷' },
  { iso: 'MX', code: '+52',  name: 'Mexico',               flag: '🇲🇽' },
  { iso: 'AR', code: '+54',  name: 'Argentina',            flag: '🇦🇷' },
];

export const DEFAULT_DIAL_ISO = 'AE';

interface Props {
  value: string;     // ISO country code (e.g. "AE")
  onChange: (iso: string) => void;
  ariaLabel?: string;
  className?: string;
}

/** Lookup the dial code for the given ISO. Falls back to UAE if not found. */
export function getDialCodeForIso(iso: string): string {
  return PHONE_DIAL_CODES.find((c) => c.iso === iso)?.code ?? '+971';
}

export default function PhoneCountryCodeSelect({ value, onChange, ariaLabel = 'Country code', className }: Props) {
  const current = PHONE_DIAL_CODES.find((c) => c.iso === value) ?? PHONE_DIAL_CODES[0];

  return (
    <div className={`relative flex items-center gap-1 ps-3 pe-7 bg-[#f5f5f5] border border-[#d1d5db] border-e-0 shrink-0 ${className ?? ''}`}>
      <span className="text-base leading-none" aria-hidden="true">{current.flag}</span>
      <span className="text-[13.7px] text-[#374151] tabular-nums">{current.code}</span>
      <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      >
        {PHONE_DIAL_CODES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.flag} {c.name} ({c.code})
          </option>
        ))}
      </select>
    </div>
  );
}
