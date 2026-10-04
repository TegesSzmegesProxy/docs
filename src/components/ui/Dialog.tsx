import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { DUR, EASE_OUT } from '../../lib/motion';
import { IconButton } from './IconButton';

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  /** footer buttons, right-aligned */
  actions?: ReactNode;
  onClose?: () => void;
  width?: number;
  closeLabel?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, title, description, children, actions, onClose, width = 460, closeLabel = 'Close' }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Lock page scroll without shifting the layout.
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const gap = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    // Move focus inside: first form control, else first focusable, else the panel.
    const el = panel.current;
    const first = el?.querySelector<HTMLElement>('input, select, textarea') ?? el?.querySelector<HTMLElement>(FOCUSABLE) ?? el;
    first?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="scrim"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_OUT }}
          className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-[rgba(31,31,31,.32)] backdrop-blur-[3px]"
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 8 }}
            animate={{ y: 0 }}
            exit={{ y: 8 }}
            transition={{ duration: DUR.base, ease: EASE_OUT }}
            className="w-full bg-card rounded-lg border border-(--border-subtle) shadow-3 font-sans outline-none"
            style={{ maxWidth: width }}
          >
            <div className="flex items-start gap-3 pt-5 pr-5 pl-6">
              <div className="flex-1 pt-1">
                <h2 id={titleId} className="text-[18px] font-medium tracking-[-0.015em] text-strong">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-1.5 text-[14px] text-muted text-pretty">
                    {description}
                  </p>
                )}
              </div>
              {onClose && <IconButton icon={X} label={closeLabel} size="sm" onClick={onClose} />}
            </div>
            {children && <div className="pt-4 px-6">{children}</div>}
            {actions && <div className="flex justify-end gap-2 p-6">{actions}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
