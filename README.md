# Tessera docs

Documentation site for Tessera, a runtime security proxy with a hosted control plane.

Live: https://tegesszmegesproxy.github.io/docs/

## Run

```sh
npm install
npm run dev      # dev server
npm run build    # type-check, check content, build to dist/
```

Pushing to the `deploy` branch publishes the site to GitHub Pages.

## Where things are

Every Markdown file in `content/` becomes a page. The top-level folder is the sidebar section. Optional frontmatter: `title`, `description`, `order`, `draft`. Routing is hash-based (`#/section/page`). See `CLAUDE.md` for the full content model and design rules.

## Built with LLMs

During this project we used Claude for practicality and time efficiency.
