'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', subtitle: 'text-[10px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', subtitle: 'text-xs' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', subtitle: 'text-sm' },
  };

  const { icon, text, subtitle } = sizes[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Hexagonal Icon */}
      <div className={cn('relative', icon)}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Hexagon background */}
          <polygon
            points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
            className="fill-primary"
            strokeWidth="2"
          />
          {/* M shape */}
          <path
            d="M25 70 L25 35 L38 50 L50 35 L50 70"
            className="fill-white"
            stroke="white"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* T shape */}
          <path
            d="M52 35 L75 35 M63.5 35 L63.5 70"
            className="stroke-muted-foreground"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* G shape */}
          <circle
            cx="73"
            cy="52"
            r="14"
            className="fill-transparent stroke-white"
            strokeWidth="3"
          />
          <path
            d="M73 52 L85 52 L85 62"
            className="stroke-white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Text */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <span className={cn('font-bold tracking-tight text-foreground', text)}>
            <span className="text-primary">MTG</span>
            <span className="text-muted-foreground ml-1">Automotora</span>
          </span>
          {variant === 'full' && (
            <span className={cn('text-muted-foreground tracking-wide', subtitle)}>
              Tu próxima decisión inteligente
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for small spaces
export function LogoCompact({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="w-8 h-8 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
            className="fill-primary"
          />
          <text
            x="50"
            y="62"
            textAnchor="middle"
            className="fill-white font-bold text-3xl"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            MTG
          </text>
        </svg>
      </div>
    </div>
  );
}
