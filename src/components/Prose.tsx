import { Children, isValidElement, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import Markdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { Link2, Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '../lib/cn';
import { href } from '../lib/useRoute';

const assets = import.meta.glob('/content/assets/**/*', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** `./jev.md#x` relative to the page's folder → `section/jev` and `x`. */
function resolveDoc(target: string, dir: string): { slug: string; anchor: string } | null {
  const m = /^([^#]+)\.md(?:#(.*))?$/.exec(target);
  if (!m) return null;
  const out = dir ? dir.split('/') : [];
  for (const part of m[1].split('/')) {
    if (part === '..') out.pop();
    else if (part !== '.') out.push(part);
  }
  if (out.at(-1) === 'index') out.pop();
  return { slug: out.join('/'), anchor: m[2] ?? '' };
}

const textOf = (node: ReactNode): string =>
  Children.toArray(node).map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : isValidElement(c) ? textOf((c as ReactElement<{ children?: ReactNode }>).props.children) : '')).join('');

function CodeBlock({ children }: { children?: ReactNode }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number>(undefined);
  const code = isValidElement(children) ? (children as ReactElement<{ className?: string; children?: ReactNode }>) : null;
  const lang = /language-([\w-]+)/.exec(code?.props.className ?? '')?.[1] ?? 'text';
  const text = textOf(code?.props.children).replace(/\n$/, '');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2000);
  };

  return (
    <div className="theme-ink my-6 rounded-lg bg-ink-900 border border-(--terminal-border) shadow-3 overflow-hidden">
      <div className="flex items-center gap-2.5 h-[38px] px-3.5 border-b border-[rgba(241,235,224,.08)]">
        <span aria-hidden className="flex gap-[5px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2 bg-stone-700" />
          ))}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[.08em] text-stone-500">{lang}</span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="ml-auto inline-flex items-center gap-1.5 h-7 px-2 rounded-sm border-0 bg-transparent font-mono text-[12px] text-bone-500 hover:text-bone-100 cursor-pointer"
        >
          {state === 'copied' ? <Check size={14} strokeWidth={1.5} aria-hidden /> : <Copy size={14} strokeWidth={1.5} aria-hidden />}
          <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}</span>
        </button>
      </div>
      <pre className="m-0 px-[18px] pt-4 pb-[18px] font-mono text-[13px] leading-[1.65] text-bone-100 overflow-x-auto" tabIndex={0}>
        {children}
      </pre>
    </div>
  );
}

const CALLOUT = {
  NOTE: { label: 'Note', bg: 'bg-blue-100' },
  WARNING: { label: 'Warning', bg: 'bg-ochre-100' },
  DANGER: { label: 'Danger', bg: 'bg-clay-100' },
} as const;

function Blockquote({ children }: { children?: ReactNode }) {
  const kids = Children.toArray(children).filter((c) => !(typeof c === 'string' && !c.trim()));
  const first = kids[0];
  let kind: keyof typeof CALLOUT | undefined;
  let rest: ReactNode[] = kids;
  if (isValidElement(first)) {
    const inner = Children.toArray((first as ReactElement<{ children?: ReactNode }>).props.children);
    const head = typeof inner[0] === 'string' ? /^\[!(NOTE|WARNING|DANGER)\]\s*/.exec(inner[0]) : null;
    if (head) {
      kind = head[1] as keyof typeof CALLOUT;
      inner[0] = (inner[0] as string).slice(head[0].length);
      rest = [<p key="first">{inner}</p>, ...kids.slice(1)];
    }
  }
  return (
    <blockquote className="my-6 rounded-md bg-card border border-(--border-subtle) shadow-1 px-5 py-4 [&>p]:my-0 [&>p+p]:mt-3">
      {kind && <span className={cn('mb-2 inline-block rounded-xs px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-[.08em] text-strong', CALLOUT[kind].bg)}>{CALLOUT[kind].label}</span>}
      {rest}
    </blockquote>
  );
}

function Heading({ level, id, slug, children }: { level: 2 | 3; id?: string; slug: string; children?: ReactNode }) {
  const Tag = `h${level}` as const;
  return (
    <Tag
      id={id}
      className={cn(
        'group relative text-strong text-balance scroll-mt-[84px]',
        level === 2 ? 'mt-16 pt-6 border-t border-(--border-subtle) text-[28px] font-normal tracking-[-0.02em] leading-[1.18]' : 'mt-10 text-[20px] font-medium tracking-[-0.015em]',
      )}
    >
      {children}
      {id && (
        <a href={href(slug, id)} aria-label="Link to this section" className="ml-2 inline-block align-middle opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-faint">
          <Link2 size={16} strokeWidth={1.5} aria-hidden />
        </a>
      )}
    </Tag>
  );
}

export function Prose({ body, dir, slug }: { body: string; dir: string; slug: string }) {
  const components: Components = {
    h1: () => null, // the article renders the page's h1 itself
    h2: ({ id, children }) => <Heading level={2} id={id} slug={slug}>{children}</Heading>,
    h3: ({ id, children }) => <Heading level={3} id={id} slug={slug}>{children}</Heading>,
    p: ({ children }) => <p className="my-4 max-w-[72ch] text-pretty [overflow-wrap:anywhere]">{children}</p>,
    ul: ({ children }) => <ul className="my-4 pl-6 list-disc marker:text-faint max-w-[72ch]">{children}</ul>,
    ol: ({ children }) => <ol className="my-4 pl-6 list-decimal marker:text-faint max-w-[72ch]">{children}</ol>,
    li: ({ children }) => <li className="my-1.5 [overflow-wrap:anywhere]">{children}</li>,
    hr: () => <hr className="my-10 border-0 border-t border-(--border-subtle)" />,
    strong: ({ children }) => <strong className="font-medium text-strong">{children}</strong>,
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    code: ({ className, children }) =>
      className ? (
        <code className={className}>{children}</code>
      ) : (
        <code className="rounded-xs bg-bone-200 px-[.35em] py-[.1em] font-mono text-[.9em] text-strong [overflow-wrap:anywhere]">{children}</code>
      ),
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-[15px] text-left">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border-b border-(--border-default) px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted">{children}</th>,
    td: ({ children }) => <td className="border-b border-(--border-subtle) px-3 py-2.5 align-top [overflow-wrap:anywhere] tabular-nums">{children}</td>,
    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
    img: ({ src = '', alt }) => {
      const url = assets[`/content/${src.replace(/^\.\//, '')}`] ?? src;
      return <img src={url} alt={alt ?? ''} className={cn('my-6 max-w-full rounded-md border border-(--border-subtle)', /-pixel\.\w+$/.test(src) && 'pixelated')} />;
    },
    a: ({ href: to = '', children }) => {
      const doc = resolveDoc(to, dir);
      if (doc) return <a href={href(doc.slug, doc.anchor)}>{children}</a>;
      if (to.startsWith('#')) return <a href={href(slug, to.slice(1))}>{children}</a>;
      return (
        <a href={to} target="_blank" rel="noreferrer">
          {children}
          <ExternalLink size={12} strokeWidth={1.5} aria-hidden className="ml-1 inline align-baseline" />
        </a>
      );
    },
  };
  return (
    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: false }]]} components={components}>
      {body}
    </Markdown>
  );
}
