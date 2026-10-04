import { ExternalLink } from 'lucide-react';
import { cn } from '../lib/cn';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-(--border-subtle) bg-bone-50 py-12 px-10 max-md:px-4">
      <div className="mx-auto max-w-[1280px] flex items-center justify-between max-sm:flex-col gap-6">
        <p className="m-0 text-[14px] text-muted">
          Tessera documentation
        </p>
        <div className="flex items-center gap-6">
          <a href="../landing/" className="text-[14px] text-body no-underline hover:text-strong hover:underline">
            Tessera home
          </a>
          <a
            href="https://github.com/TegesSzmegesProxy"
            target="_blank"
            rel="noreferrer"
            className={cn(
              'inline-flex items-center gap-2 text-[14px] text-body no-underline',
              'hover:text-strong focus-visible:outline-2 focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2 rounded-sm'
            )}
            aria-label="GitHub repository"
          >
            <ExternalLink size={14} strokeWidth={1.5} aria-hidden />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
