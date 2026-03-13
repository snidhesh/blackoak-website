'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 disabled:opacity-30 hover:bg-gray-100 rounded transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'w-10 h-10 text-sm font-medium rounded transition-colors',
            currentPage === page
              ? 'bg-black text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 disabled:opacity-30 hover:bg-gray-100 rounded transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
