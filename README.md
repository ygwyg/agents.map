# AGENTS.map

[AGENTS.map](https://agentsmap.dev) is a simple, open format for indexing agent instruction files across a codebase.

Think of AGENTS.map as a sitemap for your repo's `AGENTS.md` files: one Markdown file at the root that tells agents exactly where to find instructions, instead of scanning the whole tree.

Below is a minimal example of an AGENTS.map.md file:

```markdown
# AGENTS.map

This file lists where nested AGENTS.md files live and what they're for.
The AGENTS.md files themselves are authoritative for their subtrees.

## Entries

- Path: /AGENTS.md
  - Purpose: Global repo conventions, build/test, PR rules.
  - Applies to: /**

- Path: /services/payments/AGENTS.md
  - Purpose: PCI rules, Stripe integration patterns, test fixtures.
  - Applies to: /services/payments/**
  - Owners: @payments-team

- Path: /packages/ui/AGENTS.md
  - Purpose: Component library, accessibility requirements, Storybook conventions.
  - Applies to: /packages/ui/**
  - Owners: @design-systems
  - Tags: frontend, shared

- Path: /node_modules/@acme/ui/AGENTS.md
  - Purpose: Acme component API, theming, a11y requirements.
  - Applies to: /src/components/**, /frontend/**
  - Tags: frontend, dependency
```

## Quick start

```bash
# Generate AGENTS.map.md from existing AGENTS.md files
npx agentsmap init

# Validate the map
npx agentsmap validate

# Include AGENTS.md from dependencies
npx agentsmap init --deps

# See which instructions apply to a path
npx agentsmap resolve src/payments/checkout.ts

# Find entries by tag
npx agentsmap resolve --tag frontend
```

## CLI

| Command | Description |
|---------|-------------|
| `agentsmap init` | Scan for `AGENTS.md` files and generate `AGENTS.map.md` |
| `agentsmap validate` | Check that all listed paths exist and fields are valid |
| `agentsmap resolve <path>` | Show which `AGENTS.md` files apply to a given path |
| `agentsmap resolve --tag <t>` | Find entries by tag (e.g., `frontend`, `compliance`) |
| `agentsmap discover` | Find all `AGENTS.md` files and show their listing status |
| `agentsmap discover --deps` | Include `AGENTS.md` files from `node_modules` |

## Specification

The full v1 spec is at [`spec/v1.md`](./spec/v1.md). The key points:

- `AGENTS.map.md` goes at the repository root.
- Each entry has a `Path`, `Purpose`, and `Applies to` glob. Optional: `Priority`, `Last modified`, `Owners`, `Tags`, `Last reviewed`.
- Entries can reference dependencies (`node_modules/`) — the map indexes instructions shipped by your packages.
- Tags enable cross-cutting queries: `agentsmap resolve --tag frontend` finds all frontend-relevant entries.
- The map is informational — if it conflicts with an actual `AGENTS.md`, the `AGENTS.md` wins.
- If the map is missing or stale, agents fall back to scanning. Nothing breaks.

## Examples

- [`examples/monorepo`](./examples/monorepo/AGENTS.map.md) — Multi-service monorepo
- [`examples/microfrontend`](./examples/microfrontend/AGENTS.map.md) — Module federation architecture

## License

MIT
