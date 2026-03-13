import { cn } from '@/lib/utils';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}

export default function SectionLabel({ children, className, light }: SectionLabelProps) {
  return (
    <div className={cn('section-label justify-center', light && '[&::before]:bg-gray-600 [&::after]:bg-gray-600 text-gray-400', className)}>
      {children}
    </div>
  );
}
