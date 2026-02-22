# AGENTS.map

A sitemap for your repo's agent instructions. One Markdown file at the root — every `AGENTS.md` file, indexed.

`AGENTS.map.md` is a simple, open format that tells coding agents where to find instruction files across your codebase. Instead of scanning your entire repo tree, agents read one file and know exactly where to go.

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
```

## Why

As repos grow, `AGENTS.md` files end up scattered across dozens of directories. Agents waste tokens scanning the tree to find them. `AGENTS.map.md` gives them a single index at the root — plain Markdown, readable on GitHub, no tooling required.

- **Hints, not rules.** The map is informational. Individual `AGENTS.md` files remain the source of truth.
- **Markdown native.** Renders on GitHub, GitLab, any viewer. No JSON schema, no config files.
- **Fail-safe by default.** If the map is missing or stale, agents fall back to scanning. You can't break anything by adopting it.

## Quick start

```bash
# Generate AGENTS.map.md from existing AGENTS.md files
npx agentsmap init

# Validate the map
npx agentsmap validate

# See which instructions apply to a path
npx agentsmap resolve src/payments/checkout.ts
```

## CLI

The `agentsmap` CLI helps you create, validate, and query your map.

```bash
npm install -g agentsmap
```

| Command | Description |
|---------|-------------|
| `agentsmap init` | Scan for `AGENTS.md` files and generate `AGENTS.map.md` |
| `agentsmap validate` | Check that all listed paths exist and fields are valid |
| `agentsmap resolve <path>` | Show which `AGENTS.md` files apply to a given path |
| `agentsmap discover` | Find all `AGENTS.md` files and show their listing status |

See the [CLI README](./cli/README.md) for full usage details.

## Specification

The full v1 spec is at [`spec/v1.md`](./spec/v1.md). The key points:

- **File:** `AGENTS.map.md` at the repository root.
- **Entries:** Each entry has a `Path`, `Purpose`, and `Applies to` (glob pattern). Optional: `Owners`, `Tags`, `Last reviewed`.
- **Resolution:** Match entries by glob, rank by specificity (longest prefix wins), fall back to scanning if the map is absent.
- **Authority:** If the map conflicts with an actual `AGENTS.md`, the `AGENTS.md` wins.

## Examples

- [`examples/monorepo/AGENTS.map.md`](./examples/monorepo/AGENTS.map.md) — Multi-service monorepo with auth, payments, UI, infra
- [`examples/microfrontend/AGENTS.map.md`](./examples/microfrontend/AGENTS.map.md) — Module federation micro-frontend architecture

## Website

The landing site lives in [`site/`](./site/) and is built with React, Tailwind CSS, and Vite.

### Running locally

```bash
cd site
pnpm install
pnpm dev
```

Open http://localhost:5173

## License

MIT
