# AGENTS.md

This is the agents.map project — a spec, CLI, and landing site for the AGENTS.map format.

## Project structure

- `spec/` — The v1 specification (`v1.md`).
- `cli/` — TypeScript CLI published as `agentsmap` on npm.
- `site/` — React + Tailwind landing page.
- `examples/` — Example AGENTS.map.md files for common repo architectures.

## Conventions

- All code is TypeScript, strict mode.
- CLI uses ESM (`"type": "module"`) with Node 18+.
- Site uses Vite, Tailwind CSS v4, React.
- Commits should be concise and describe the "why."

## Testing

- CLI tests: `cd cli && npm test` (Vitest, 32 tests).
- Site build: `cd site && pnpm build`.

## Key files

- `AGENTS.map.md` — The root map indexing all AGENTS.md files in this repo (we eat our own dog food).
- `cli/src/index.ts` — CLI entry point with all commands.
- `spec/v1.md` — The canonical spec document.
