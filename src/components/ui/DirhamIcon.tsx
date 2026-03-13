import Image from 'next/image';

interface DirhamIconProps {
  className?: string;
  size?: number;
}

export default function DirhamIcon({ className, size = 18 }: DirhamIconProps) {
  return (
    <Image
      src="/images/icons/dirham.svg"
      alt="AED"
      width={size}
      height={size}
      className={className}
    />
  );
}
