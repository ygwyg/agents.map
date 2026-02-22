# CLI — AGENTS.md

The `agentsmap` CLI tool. Published to npm as `agentsmap`.

## Architecture

- `src/index.ts` — Entry point, command definitions (Commander.js).
- `src/parser.ts` — Parses AGENTS.map.md Markdown into structured data.
- `src/validator.ts` — Validates entries against the v1 spec (paths exist, no duplicates, required fields).
- `src/resolver.ts` — Matches a target path against entry globs, ranks by specificity.
- `src/discoverer.ts` — Scans the filesystem for AGENTS.md files.
- `src/generator.ts` — Generates AGENTS.map.md Markdown from discovered entries.
- `src/types.ts` — Shared TypeScript interfaces.

## Patterns

- Imports use `.js` extensions (NodeNext module resolution for compiled output).
- All source is in `src/`, tests in `tests/`, compiled output in `dist/`.
- Build with `npm run build` (uses `tsconfig.build.json`).
- `bin` points to `dist/index.js` — never run raw `.ts` in production.

## Testing

- Run `npm test` (Vitest).
- Tests cover parser, resolver, and validator. Validator tests use temp directories with real files.
- Add tests for any new commands or parsing changes.

## Publishing

- `npm publish` triggers `prepublishOnly` which runs the build.
- Only `dist/` is included in the npm package (`files` field).
