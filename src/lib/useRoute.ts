import { useEffect, useState } from 'react';

export interface Route { slug: string; anchor: string }

/** `#/section/page#heading` → slug and anchor; split on the second `#`. */
export function parseHash(hash: string): Route {
  const rest = hash.replace(/^#\/?/, '');
  const i = rest.indexOf('#');
  return i < 0 ? { slug: rest.replace(/\/$/, ''), anchor: '' } : { slug: rest.slice(0, i).replace(/\/$/, ''), anchor: rest.slice(i + 1) };
}

export const href = (slug: string, anchor = '') => `#/${slug}${anchor ? `#${anchor}` : ''}`;

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
