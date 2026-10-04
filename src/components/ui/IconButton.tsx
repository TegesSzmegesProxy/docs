import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  /** required accessible label (also tooltip title) */
  label: string;
  variant?: 'ghost' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
}

const VARIANT = {
  ghost: 'border-transparent',
  outline: 'border-(--border-default) hover:enabled:border-(--border-strong)',
  solid: 'border-transparent bg-ink-900 text-bone-100 hover:enabled:bg-stone-700 hover:enabled:text-bone-50',
} as const;

const SIZE = { sm: 'size-7', md: 'size-9', lg: 'size-11' } as const;

export function IconButton({ icon: Icon, label, variant = 'ghost', size = 'md', type = 'button', className, ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-(--radius-pill) border cursor-pointer',
        'text-body bg-transparent transition-[background-color,color,border-color] duration-(--dur-fast) ease-out',
        'hover:enabled:bg-(--border-subtle) hover:enabled:text-strong active:enabled:translate-y-px',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)',
        'disabled:opacity-[.42] disabled:cursor-not-allowed',
        "before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-1/2 before:content-['']",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.5} aria-hidden />
    </button>
  );
}
