import { Facebook, Twitter, Linkedin, Instagram, Youtube, MessageCircle } from 'lucide-react';

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook, Twitter, Linkedin, Instagram, Youtube, MessageCircle,
};

interface SocialIconsProps {
  links: { platform: string; url: string; icon: string }[];
  className?: string;
}

export default function SocialIcons({ links, className }: SocialIconsProps) {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      {links.map((link) => {
        const Icon = icons[link.icon];
        if (!Icon) return null;
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.platform}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          >
            <Icon className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
}
