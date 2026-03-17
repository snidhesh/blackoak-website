'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Globe } from 'lucide-react';
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

export default function MobileMenu({ isOpen, onClose, navigation }: MobileMenuProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed top-16 left-0 right-0 bottom-0 bg-white overflow-y-auto">
        <nav className="px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <div key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    pathname === item.href
                      ? 'text-black bg-gray-100'
                      : 'text-gray-700 hover:text-black hover:bg-gray-50'
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors',
                      expandedItems.includes(item.label) ? 'text-black bg-gray-50' : 'text-gray-700'
                    )}
                    aria-expanded={expandedItems.includes(item.label)}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        expandedItems.includes(item.label) && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedItems.includes(item.label) && item.dropdown && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href!}
                          onClick={onClose}
                          className={cn(
                            'block px-3 py-2 text-sm rounded-lg transition-colors',
                            pathname === sub.href
                              ? 'text-black font-medium bg-gray-100'
                              : 'text-gray-600 hover:text-black hover:bg-gray-50'
                          )}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Mobile actions */}
          <div className="pt-6 mt-6 border-t border-gray-200 space-y-3 px-4">
            <Link
              href="/contact"
              onClick={onClose}
              className="flex items-center justify-center w-full px-4 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              List Your Property
            </Link>
            <a
              href="https://wa.me/97143989055"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Contact via WhatsApp
            </a>
            <button className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              English
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
