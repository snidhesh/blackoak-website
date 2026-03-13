import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export default function Container({ children, className, narrow }: ContainerProps) {
  return (
    <div className={cn(narrow ? 'container-narrow' : 'container-wide', className)}>
      {children}
    </div>
  );
}
