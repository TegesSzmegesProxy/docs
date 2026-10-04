import { useEffect, useId, useMemo, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Dialog } from './ui/Dialog';
import { allPages } from '../lib/content';
import { href } from '../lib/useRoute';
import { cn } from '../lib/cn';

interface Hit { slug: string; title: string; section: string; snippet: string }

function search(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: Hit[] = [];
  for (const p of allPages) {
    const inTitle = p.title.toLowerCase().includes(q);
    const inHeading = p.headings.some((h) => h.text.toLowerCase().includes(q));
    const at = p.body.toLowerCase().indexOf(q);
    if (!inTitle && !inHeading && at < 0) continue;
    const snippet = at < 0 ? p.description : p.body.slice(Math.max(0, at - 40), at + 80).replace(/\s+/g, ' ');
    hits.push({ slug: p.slug, title: p.title, section: p.slug.split('/')[0].replace(/-/g, ' '), snippet });
  }
  // Title matches first.
  return hits.sort((a, b) => Number(b.title.toLowerCase().includes(q)) - Number(a.title.toLowerCase().includes(q)));
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const id = useId();
  const hits = useMemo(() => search(query), [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  const go = (h: Hit) => {
    location.hash = href(h.slug);
    onClose();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && hits[active]) {
      e.preventDefault();
      go(hits[active]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Search the docs" width={560} closeLabel="Close search">
      <div className="pb-6">
        <div className="flex items-center gap-2 h-10 px-3 rounded-sm border border-(--border-default) bg-bone-50 focus-within:border-(--focus-ring)">
          <SearchIcon size={16} strokeWidth={1.5} aria-hidden className="text-muted" />
          <input
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls={`${id}-list`}
            aria-activedescendant={hits[active] ? `${id}-${active}` : undefined}
            aria-label="Search the docs"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKey}
            placeholder="Search"
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[15px] text-strong placeholder:text-faint"
          />
        </div>
        {query.trim() && hits.length === 0 && (
          <p className="mt-4 mb-0 text-[14px] text-muted">
            No results for “{query.trim()}”.{' '}
            <button type="button" onClick={() => setQuery('')} className="bg-transparent border-0 p-0 text-(--text-link) underline underline-offset-3 cursor-pointer">
              Clear search
            </button>
          </p>
        )}
        <ul id={`${id}-list`} role="listbox" aria-label="Results" className="m-0 mt-2 p-0 list-none max-h-[50vh] overflow-y-auto">
          {hits.map((h, i) => (
            <li
              key={h.slug}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(h)}
              className={cn('px-3 py-2.5 rounded-sm cursor-pointer', i === active && 'bg-bone-200')}
            >
              <div className="font-mono text-[11px] uppercase tracking-[.08em] text-muted">{h.section}</div>
              <div className="text-[15px] text-strong">{h.title}</div>
              {h.snippet && <div className="text-[13px] text-muted truncate">{h.snippet}</div>}
            </li>
          ))}
        </ul>
      </div>
    </Dialog>
  );
}
