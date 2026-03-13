import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
  light?: boolean;
  align?: 'left' | 'center';
}

export default function SectionHeading({ title, subtitle, className, light, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', className)}>
      <h2 className={cn(
        'text-[28px] md:text-[32px] font-normal leading-[48px]',
        light ? 'text-white' : 'text-black'
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          'mt-4 text-lg max-w-2xl',
          align === 'center' && 'mx-auto',
          light ? 'text-gray-300' : 'text-gray-600'
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
