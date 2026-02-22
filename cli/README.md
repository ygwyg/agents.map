# agentsmap

CLI tool for the [AGENTS.map](https://github.com/ygwyg/agents.map) specification — discover, validate, and resolve `AGENTS.md` instruction files.

## Install

```bash
npm install -g agentsmap
```

Or run directly with `npx`:

```bash
npx agentsmap init
```

## Commands

### `agentsmap init`

Scan your repo for `AGENTS.md` files and generate an `AGENTS.map.md` at the root.

```bash
agentsmap init
```

Interactive by default — prompts you for each file's purpose. Use `--non-interactive` to auto-infer purposes from file contents:

```bash
agentsmap init --non-interactive
```

### `agentsmap validate`

Check that your `AGENTS.map.md` is valid: all listed paths exist, required fields are present, no duplicates, no path traversal.

```bash
agentsmap validate
```

Use this in CI to catch stale entries:

```yaml
# .github/workflows/agents-map.yml
- run: npx agentsmap validate
```

Exits with code 1 on errors. Warnings (like unlisted `AGENTS.md` files) don't fail the check.

### `agentsmap resolve <path>`

Show which `AGENTS.md` files apply to a given path, ranked by priority then specificity.

```bash
agentsmap resolve src/services/payments/checkout.ts
```

Use `--tag` to find entries by domain instead of path:

```bash
agentsmap resolve --tag frontend
agentsmap resolve --tag backend,compliance
```

Use `--json` for machine-readable output:

```bash
agentsmap resolve src/payments/checkout.ts --json
```

### `agentsmap discover`

Find all `AGENTS.md` files in your repo and show whether they're listed in the map.

```bash
agentsmap discover
```

Output shows listed files with `+` and unlisted with `?`, along with suggested purposes.

## Programmatic API

You can import the parser, resolver, and validator directly:

```typescript
import { parseMarkdown } from "agentsmap/parser";
import { resolveEntries } from "agentsmap/resolver";
import { validate } from "agentsmap/validator";

const map = parseMarkdown(markdownContent);
const matches = resolveEntries(map, "src/payments/checkout.ts");
const result = validate(map, "/path/to/repo");
```

## How it works

`AGENTS.map.md` is a plain Markdown file at your repo root that indexes all `AGENTS.md` files:

```markdown
# AGENTS.map

## Entries

- Path: /AGENTS.md
  - Purpose: Global repo conventions.
  - Applies to: /**

- Path: /services/payments/AGENTS.md
  - Purpose: PCI rules, Stripe patterns.
  - Applies to: /services/payments/**
  - Priority: critical
  - Owners: @payments-team
  - Tags: backend, compliance
```

When an agent enters your repo, it reads this file, matches entries by glob pattern, and loads the most specific instructions. If the map is missing or stale, agents fall back to scanning — nothing breaks.

Full spec: [spec/v1.md](https://github.com/ygwyg/agents.map/blob/main/spec/v1.md)

## License

MIT
