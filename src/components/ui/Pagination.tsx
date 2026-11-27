'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /**
   * When given, each page control is a real link to this path, so the pages
   * can be crawled and opened directly. Without it the controls are buttons.
   */
  getHref?: (page: number) => string;
  /**
   * With `getHref`: true lets the link navigate; false keeps the link in the
   * markup but changes page in place through `onPageChange`. Default true.
   */
  navigate?: boolean;
}

export default function Pagination({ currentPage, totalPages, onPageChange, getHref, navigate = true }: PaginationProps) {
  const t = useTranslations('common');
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const control = (page: number, disabled: boolean, className: string, children: React.ReactNode, label?: string) => {
    if (!getHref || disabled) {
      return (
        <button
          onClick={() => onPageChange(page)}
          disabled={disabled}
          aria-label={label}
          className={className}
        >
          {children}
        </button>
      );
    }
    return (
      <Link
        href={getHref(page)}
        prefetch={false}
        aria-label={label}
        aria-current={page === currentPage ? 'page' : undefined}
        onClick={(e) => {
          if (navigate) return;
          e.preventDefault();
          onPageChange(page);
        }}
        className={cn(className, 'inline-flex items-center justify-center')}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav aria-label={t('pagination')} className="flex flex-wrap items-center justify-center gap-2 mt-8">
      {control(
        currentPage - 1,
        currentPage === 1,
        'p-2 disabled:opacity-30 hover:bg-gray-100 rounded transition-colors',
        <ChevronLeft className="w-5 h-5" />,
        t('previousPage')
      )}
      {pages.map((page) => (
        <span key={page}>
          {control(
            page,
            false,
            cn(
              'w-10 h-10 text-sm font-medium rounded transition-colors',
              currentPage === page ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            ),
            page
          )}
        </span>
      ))}
      {control(
        currentPage + 1,
        currentPage === totalPages,
        'p-2 disabled:opacity-30 hover:bg-gray-100 rounded transition-colors',
        <ChevronRight className="w-5 h-5" />,
        t('nextPage')
      )}
    </nav>
  );
}
