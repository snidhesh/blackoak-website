import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
}

const variants = {
  primary: 'bg-black text-white hover:bg-gray-800',
  secondary: 'bg-gold text-white hover:bg-gold-dark',
  outline: 'border-2 border-black text-black hover:bg-black hover:text-white',
  'outline-light': 'border-2 border-white text-white hover:bg-white hover:text-black',
  dark: 'bg-white text-black hover:bg-gray-100',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className,
  type = 'button',
  disabled,
  onClick,
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium tracking-wider uppercase transition-all duration-200',
    variants[variant],
    sizes[size],
    disabled && 'opacity-50 cursor-not-allowed',
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
