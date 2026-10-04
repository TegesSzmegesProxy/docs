import { useEffect, useRef, useState } from 'react';
import { Prose } from './components/Prose';
import { SearchDialog } from './components/Search';
import { Header, Sidebar, Toc, PrevNext, useMenuId } from './components/Shell';
import { Footer } from './components/Footer';
import { allPages, pageBySlug } from './lib/content';
import { href, useRoute } from './lib/useRoute';

const TITLE = 'Tessera docs';

export default function App() {
  const route = useRoute();
  const page = route.slug ? pageBySlug(route.slug) : allPages[0];
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);
  const menuId = useMenuId();
  const h1 = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearching(true);
      } else if (e.key === 'Escape') setMenu(false);
    };
    const onResize = () => window.matchMedia('(min-width: 768px)').matches && setMenu(false);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Route change: scroll to the heading, or focus the h1 and go to top.
  useEffect(() => {
    document.title = page ? `${page.title} · ${TITLE}` : TITLE;
    document.querySelector('meta[name="description"]')?.setAttribute('content', page?.description || 'Tessera documentation.');
    const target = route.anchor && document.getElementById(route.anchor);
    if (target) target.scrollIntoView();
    else {
      window.scrollTo(0, 0);
      h1.current?.focus({ preventScroll: true });
    }
  }, [page, route.anchor]);

  const current = page?.slug ?? '';

  return (
    <>
      <a href="#main" onClick={(e) => { e.preventDefault(); h1.current?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-2 focus:left-2 focus:rounded-sm focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Header onMenu={() => setMenu((m) => !m)} onSearch={() => setSearching(true)} menuId={menuId} menuOpen={menu} searchRef={searchRef} />
      <div className="flex flex-col min-h-[calc(100dvh-var(--header-h))]">
        <div className="flex mx-auto max-w-[1280px] w-full flex-1">
          {allPages.length > 0 && <Sidebar current={current} open={menu} onClose={() => setMenu(false)} id={menuId} />}
          <main id="main" className="min-w-0 flex-1 px-10 max-md:px-4 py-12">
            {allPages.length === 0 ? (
              <p>No documents yet.</p>
            ) : !page ? (
              <div className="max-w-[720px]">
                <h1 ref={h1} tabIndex={-1} className="text-[40px] font-light tracking-[-0.035em] leading-[1.1] text-strong outline-none">Page not found.</h1>
                <p className="mt-4"><a href={href(allPages[0].slug)}>Go to {allPages[0].title}</a></p>
              </div>
            ) : (
              <article key={page.slug} className="fade-up mx-auto max-w-[720px]">
                <h1 ref={h1} tabIndex={-1} className="m-0 text-[40px] md:text-[48px] font-light tracking-[-0.035em] leading-[1.1] text-strong outline-none">{page.title}</h1>
                {page.description && <p className="mt-4 text-[19px] leading-[1.5] text-muted text-pretty">{page.description}</p>}
                <Prose body={page.body} dir={page.dir} slug={page.slug} />
                <PrevNext page={page} />
              </article>
            )}
          </main>
          {page && <Toc page={page} />}
        </div>
        <Footer />
      </div>
      <SearchDialog open={searching} onClose={() => setSearching(false)} />
    </>
  );
}
