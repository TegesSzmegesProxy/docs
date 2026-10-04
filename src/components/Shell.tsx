import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, Search } from 'lucide-react';
import { IconButton } from './ui/IconButton';
import { content, allPages } from '../lib/content';
import type { Page } from '../lib/content';
import { href } from '../lib/useRoute';
import { cn } from '../lib/cn';

export function Header({ onMenu, onSearch, menuId, menuOpen, searchRef }: { onMenu: () => void; onSearch: () => void; menuId: string; menuOpen: boolean; searchRef: React.RefObject<HTMLButtonElement | null> }) {
  const mac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 h-(--header-h) px-10 max-md:px-4 bg-[rgba(241,235,224,.82)] backdrop-blur-[14px] saturate-110 border-b border-(--border-subtle)">
      <IconButton icon={Menu} label="Menu" size="lg" className="md:hidden" onClick={onMenu} aria-expanded={menuOpen} aria-controls={menuId} />
      <a href="#/" className="font-sans text-[15px] font-medium tracking-[.18em] text-ink-900 no-underline hover:text-ink-900">TESSERA</a>
      <span className="font-mono text-[11px] uppercase tracking-[.08em] text-muted max-sm:hidden">Docs</span>
      <button
        ref={searchRef}
        type="button"
        onClick={onSearch}
        className="ml-auto inline-flex items-center gap-2 h-9 px-3 rounded-sm border border-(--border-default) bg-bone-50 text-[14px] text-muted cursor-pointer hover:border-(--border-strong)"
      >
        <Search size={14} strokeWidth={1.5} aria-hidden />
        <span className="max-sm:hidden">Search</span>
        <kbd className="font-mono text-[11px] text-faint max-sm:hidden">{mac ? '⌘K' : 'Ctrl K'}</kbd>
        <span className="sr-only sm:hidden">Search</span>
      </button>
      <a href="https://tegesszmegesproxy.github.io/landing/" className="text-[14px] text-body no-underline hover:text-strong hover:underline max-sm:hidden">Tessera home</a>
    </header>
  );
}

function SidebarNav({ current, onNavigate }: { current: string; onNavigate?: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
  }, []);
  return (
    <nav ref={ref} aria-label="Documentation" className="py-6">
      {content.sections.map((s) => (
        <div key={s.title} className="mb-6">
          <h2 className="m-0 mb-1 px-3 font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted">{s.title}</h2>
          <ul className="m-0 p-0 list-none">
            {s.pages.map((p) => {
              const on = p.slug === current;
              return (
                <li key={p.slug}>
                  <a
                    href={href(p.slug)}
                    aria-current={on ? 'page' : undefined}
                    onClick={onNavigate}
                    className={cn('flex items-center min-h-11 md:min-h-9 px-3 rounded-sm text-[15px] no-underline', on ? 'bg-bone-200 text-strong hover:text-strong' : 'text-body hover:bg-(--border-subtle) hover:text-strong')}
                  >
                    {p.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ current, open, onClose, id }: { current: string; open: boolean; onClose: () => void; id: string }) {
  return (
    <>
      <aside className="max-md:hidden sticky top-(--header-h) h-[calc(100dvh-var(--header-h))] w-[248px] shrink-0 overflow-y-auto px-4 border-r border-(--border-subtle)">
        <SidebarNav current={current} />
      </aside>
      {open && (
        <div className="md:hidden fixed inset-0 top-(--header-h) z-30 bg-[rgba(31,31,31,.32)]" onClick={onClose}>
          <div id={id} onClick={(e) => e.stopPropagation()} className="h-full w-[min(320px,86vw)] overflow-y-auto bg-page px-4 border-r border-(--border-subtle)">
            <SidebarNav current={current} onNavigate={onClose} />
          </div>
        </div>
      )}
    </>
  );
}

export function Toc({ page }: { page: Page }) {
  const [active, setActive] = useState('');
  useEffect(() => {
    setActive('');
    const els = page.headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const v = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (v) setActive(v.target.id);
      },
      { rootMargin: '-72px 0px -70% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [page]);
  if (!page.headings.length) return null;
  return (
    <aside className="max-xl:hidden sticky top-(--header-h) h-[calc(100dvh-var(--header-h))] w-[200px] shrink-0 overflow-y-auto py-10 pl-2">
      <nav aria-label="On this page">
        <h2 className="m-0 mb-2 font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted">On this page</h2>
        <ul className="m-0 p-0 list-none">
          {page.headings.map((h) => (
            <li key={h.id}>
              <a
                href={href(page.slug, h.id)}
                aria-current={active === h.id ? 'location' : undefined}
                className={cn('block py-1 text-[13px] no-underline [overflow-wrap:anywhere]', h.level === 3 && 'pl-3', active === h.id ? 'text-strong' : 'text-muted hover:text-strong')}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function PrevNext({ page }: { page: Page }) {
  const i = allPages.findIndex((p) => p.slug === page.slug);
  const prev = allPages[i - 1];
  const next = allPages[i + 1];
  if (!prev && !next) return null;
  const card = 'flex flex-col gap-1 p-4 rounded-md bg-card border border-(--border-subtle) shadow-1 no-underline hover:border-(--border-default)';
  return (
    <nav aria-label="Previous and next page" className="mt-16 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
      {prev ? (
        <a href={href(prev.slug)} className={card}>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[.08em] text-muted"><ChevronLeft size={14} strokeWidth={1.5} aria-hidden />Previous</span>
          <span className="text-[16px] text-strong">{prev.title}</span>
        </a>
      ) : <span />}
      {next ? (
        <a href={href(next.slug)} className={cn(card, 'items-end text-right')}>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[.08em] text-muted">Next<ChevronRight size={14} strokeWidth={1.5} aria-hidden /></span>
          <span className="text-[16px] text-strong">{next.title}</span>
        </a>
      ) : <span />}
    </nav>
  );
}

export const useMenuId = useId;
