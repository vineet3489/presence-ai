import Image from 'next/image';
import Link from 'next/link';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  showText?: boolean;
  className?: string;
}

const SIZE = {
  sm: { icon: 24, text: 'text-base' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 48, text: 'text-3xl' },
};

export function PresenceLogo({ size = 'md', href, showText = true, className = '' }: Props) {
  const { icon, text } = SIZE[size];

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/presence-logo.svg"
        alt="PresenceAI"
        width={icon}
        height={icon}
        priority
      />
      {showText && (
        <span className={`font-black gradient-text leading-none ${text}`}>
          PresenceAI
        </span>
      )}
    </span>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
