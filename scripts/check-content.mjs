// Fails on duplicate slugs and on relative .md links that point nowhere.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';

const root = resolve('content');
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith('.md') ? [join(d, e.name)] : []));
const files = walk(root);
const errors = [];
const slugs = new Set();
for (const f of files) {
  const rel = relative(root, f).replace(/\.md$/, '').split(/[\\/]/);
  const slug = (rel.at(-1) === 'index' ? rel.slice(0, -1) : rel).join('/');
  if (slugs.has(slug)) errors.push(`duplicate slug: ${slug}`);
  slugs.add(slug);
}
const existing = new Set(files);
for (const f of files) {
  for (const m of readFileSync(f, 'utf8').matchAll(/\]\((\.{1,2}\/[^)#\s]+\.md)(#[^)]*)?\)/g)) {
    if (!existing.has(resolve(dirname(f), m[1]))) errors.push(`${relative(root, f)}: broken link ${m[1]}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`content ok: ${files.length} pages`);
