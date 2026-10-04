export interface Heading { id: string; text: string; level: 2 | 3 }
export interface Page { slug: string; dir: string; title: string; description: string; body: string; headings: Heading[]; order: number }
export interface Section { title: string; pages: Page[] }

const files = import.meta.glob('/content/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/** `key: value` lines between `---` fences. */
function frontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: raw.slice(m[0].length) };
}

/** Same algorithm as github-slugger, which rehype-slug uses, for the cases our headings hit. */
export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s/g, '-');
}

function headingsOf(body: string): Heading[] {
  const out: Heading[] = [];
  const seen = new Map<string, number>();
  let fence = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) fence = !fence;
    if (fence) continue;
    const m = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/`/g, '');
    const base = slugify(text);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push({ id: n ? `${base}-${n}` : base, text, level: m[1].length as 2 | 3 });
  }
  return out;
}

const sentence = (s: string) => {
  const t = s.replace(/-/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

function build() {
  const sections = new Map<string, { title: string; order: number; pages: Page[] }>();
  for (const [path, raw] of Object.entries(files)) {
    const parts = path.replace(/^\/content\//, '').replace(/\.md$/, '').split('/');
    if (parts.length < 2) continue;
    const { meta, body } = frontmatter(raw);
    if (meta.draft === 'true' && import.meta.env.PROD) continue;
    const dir = parts[0];
    const sec = sections.get(dir) ?? { title: sentence(dir), order: 100, pages: [] };
    sections.set(dir, sec);
    const file = parts[parts.length - 1];
    const h1 = /^#\s+(.+?)\s*$/m.exec(body)?.[1];
    const order = Number(meta.order ?? 100);
    if (file === 'index') {
      if (meta.title) sec.title = meta.title;
      sec.order = order;
    }
    sec.pages.push({
      dir: parts.slice(0, -1).join('/'),
      slug: (file === 'index' ? parts.slice(0, -1) : parts).join('/'),
      title: meta.title ?? h1 ?? sentence(file),
      description: meta.description ?? '',
      body,
      headings: headingsOf(body),
      order,
    });
  }
  const sorted = [...sections.values()].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  for (const s of sorted) s.pages.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return { sections: sorted as Section[] };
}

export const content = build();
export const allPages: Page[] = content.sections.flatMap((s) => s.pages);
export const pageBySlug = (slug: string) => allPages.find((p) => p.slug === slug);
