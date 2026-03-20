'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavItem[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavItem[];
}

const secondaryLinks = [
  { label: 'List Your Property', href: '/list-your-property' },
  { label: 'Career', href: '/career' },
  { label: 'Contact', href: '/contact' },
];

const socialLinks = [
  {
    platform: 'facebook',
    url: 'https://facebook.com/blackoakre',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 008.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
      </svg>
    ),
  },
  {
    platform: 'twitter',
    url: 'https://x.com/blackoakre',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[60%] h-[60%]">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    platform: 'linkedin',
    url: 'https://linkedin.com/company/blackoakre',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zM8.65 17.57H6.14V9.98h2.51v7.59zM7.39 8.94c-.8 0-1.46-.66-1.46-1.47s.65-1.47 1.46-1.47 1.46.65 1.46 1.47-.65 1.47-1.46 1.47zm10.18 8.63h-2.51v-3.69c0-.88-.02-2.01-1.22-2.01-1.22 0-1.41.96-1.41 1.95v3.75h-2.51V9.98h2.41v1.04h.03c.34-.64 1.16-1.31 2.38-1.31 2.55 0 3.02 1.68 3.02 3.86v4z" />
      </svg>
    ),
  },
  {
    platform: 'whatsapp',
    url: 'https://wa.me/97143989055',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.86.51 3.6 1.4 5.09L2 22l5.08-1.33A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.46 14.12c-.23.65-1.34 1.24-1.84 1.32-.5.08-1.13.12-1.82-.12-.42-.14-.96-.34-1.65-.67-2.93-1.37-4.84-4.34-4.99-4.54-.15-.2-1.2-1.6-1.2-3.06 0-1.45.76-2.17 1.03-2.47.27-.3.59-.37.79-.37.2 0 .39 0 .57.01.18.01.42-.07.66.5.24.57.82 2 .89 2.15.07.15.12.32.02.52-.1.2-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.13.99 2.09 1.3 2.38 1.44.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.34.07.12.07.7-.16 1.34z" />
      </svg>
    ),
  },
  {
    platform: 'instagram',
    url: 'https://instagram.com/blackoakre',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2c-2.716 0-3.056.012-4.123.06-1.064.049-1.791.218-2.427.465a4.9 4.9 0 00-1.772 1.153A4.9 4.9 0 002.525 5.45c-.247.636-.416 1.363-.465 2.427C2.012 8.944 2 9.284 2 12s.012 3.056.06 4.123c.049 1.064.218 1.791.465 2.427a4.9 4.9 0 001.153 1.772 4.9 4.9 0 001.772 1.153c.636.247 1.363.416 2.427.465 1.067.048 1.407.06 4.123.06s3.056-.012 4.123-.06c1.064-.049 1.791-.218 2.427-.465a4.9 4.9 0 001.772-1.153 4.9 4.9 0 001.153-1.772c.247-.636.416-1.363.465-2.427.048-1.067.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.049-1.064-.218-1.791-.465-2.427a4.9 4.9 0 00-1.153-1.772 4.9 4.9 0 00-1.772-1.153c-.636-.247-1.363-.416-2.427-.465C15.056 2.012 14.716 2 12 2zm0 1.802c2.67 0 2.986.01 4.04.058.976.045 1.505.207 1.858.344.466.181.8.398 1.15.748.35.35.566.684.748 1.15.137.353.3.882.344 1.857.048 1.055.058 1.37.058 4.041 0 2.67-.01 2.986-.058 4.04-.045.976-.207 1.505-.344 1.858-.181.466-.398.8-.748 1.15-.35.35-.684.566-1.15.748-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.041.058-2.67 0-2.987-.01-4.04-.058-.976-.045-1.505-.207-1.858-.344a3.097 3.097 0 01-1.15-.748 3.098 3.098 0 01-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.055-.058-1.37-.058-4.041 0-2.67.01-2.986.058-4.04.045-.976.207-1.505.344-1.858.181-.466.398-.8.748-1.15.35-.35.684-.567 1.15-.749.353-.137.882-.299 1.857-.344 1.055-.048 1.37-.058 4.041-.058zm0 3.063a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
      </svg>
    ),
  },
  {
    platform: 'youtube',
    url: 'https://youtube.com/blackoakre',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 13.33c-.1.42-.4.74-.82.84C15.09 16.33 12 16.33 12 16.33s-3.09 0-3.82-.16a1.19 1.19 0 01-.82-.84C7.2 14.66 7.2 12 7.2 12s0-2.66.16-3.33c.1-.42.4-.74.82-.84C8.91 7.67 12 7.67 12 7.67s3.09 0 3.82.16c.42.1.72.42.82.84.16.67.16 3.33.16 3.33s0 2.66-.16 3.33zM10.8 14.09l2.55-1.47-2.55-1.47v2.94z" />
      </svg>
    ),
  },
];

export default function MobileMenu({ isOpen, onClose, navigation }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] bg-black lg:hidden transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-[18px] right-5 p-2"
        aria-label="Close menu"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Scrollable content */}
      <div className="h-full overflow-y-auto pt-24 pb-10 px-7">
        <nav className="space-y-0">
          {/* Primary navigation */}
          {navigation.map((item) => (
            <div key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="block py-[15px] text-[14px] font-medium text-white uppercase tracking-[1.4px]"
                >
                  {item.label}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className="flex items-center justify-between w-full py-[15px] text-[14px] font-medium text-white uppercase tracking-[1.4px]"
                    aria-expanded={expandedItems.includes(item.label)}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-white/60 transition-transform duration-200',
                        expandedItems.includes(item.label) && 'rotate-180'
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      expandedItems.includes(item.label)
                        ? 'max-h-[600px] opacity-100'
                        : 'max-h-0 opacity-0'
                    )}
                  >
                    {item.dropdown && (
                      <div className="pl-4 pb-2 space-y-0 border-l border-[#232323]">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href!}
                            onClick={onClose}
                            className={cn(
                              'block py-2.5 text-[13px] font-medium tracking-[1px] transition-colors',
                              pathname === sub.href
                                ? 'text-white'
                                : 'text-white/50 hover:text-white'
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Secondary links */}
          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block py-[15px] text-[14px] font-medium text-white uppercase tracking-[1.4px]"
            >
              {link.label}
            </Link>
          ))}

          {/* Language */}
          <div className="border-b border-[#232323] py-5 mt-2">
            <p className="text-[11px] font-medium text-[#5F6368] uppercase tracking-[1.1px] mb-2">
              Language
            </p>
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-white/60" />
              <span className="text-[14px] font-medium text-white uppercase tracking-[1.4px]">
                English
              </span>
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href="https://wa.me/97143989055"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 py-[15px] border-b border-[#232323]"
          >
            <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-[14px] font-medium text-white uppercase tracking-[1.4px]">
              Whatsapp
            </span>
          </a>

          {/* Social icons */}
          <div className="pt-5">
            <p className="text-[11px] font-medium text-[#5F6368] uppercase tracking-[1.1px] mb-3">
              Follow us
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  aria-label={social.platform}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
