# Site — AGENTS.md

The agents.map landing page. React + Tailwind CSS v4 + Vite.

## Stack

- React 19, TypeScript, Tailwind CSS v4.
- Geist Mono — the only font. Loaded from Google Fonts.
- PixelBlast background (Three.js + postprocessing).
- Cloudflare Kumo design tokens (`@cloudflare/kumo`).

## Design

- Single-column layout, `max-w-[620px]`, center-aligned.
- Pure grayscale palette on black background. No accent colors.
- Glass card effects: `backdrop-blur`, `bg-white/[0.03]`, `border-white/[0.08]`.
- Text hierarchy: white for headings, `#c4c4cc` for body, `white/50` for labels.

## Components

- `Hero.tsx` — Title, tagline, CTA buttons.
- `Principles.tsx` — How it works section, numbered list.
- `Format.tsx` — Interactive two-panel IDE: file tree + AGENTS.map.md content with bidirectional hover highlighting.
- `GetStarted.tsx` — Terminal commands and links.
- `Nav.tsx` / `Footer.tsx` — Minimal chrome.
- `PixelBlast.tsx` — WebGL background animation.

## Dev

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # production build to dist/
```
