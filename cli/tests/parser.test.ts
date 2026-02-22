import { describe, it, expect } from "vitest";
import { parseMarkdown } from "../src/parser.js";

describe("parseMarkdown", () => {
  it("should parse a standard AGENTS.map.md", () => {
    const input = `# AGENTS.map

This file lists where nested AGENTS.md files live and what they're for.
The AGENTS.md files themselves are authoritative for their subtrees.

## Entries

- Path: /AGENTS.md
  - Purpose: Global repo conventions.
  - Applies to: /**

- Path: /services/payments/AGENTS.md
  - Purpose: Payments domain rules.
  - Applies to: /services/payments/**
  - Owners: @payments-team
`;

    const result = parseMarkdown(input);
    expect(result.schema_version).toBe(1);
    expect(result.entries).toHaveLength(2);

    expect(result.entries[0].path).toBe("AGENTS.md");
    expect(result.entries[0].purpose).toBe("Global repo conventions.");
    expect(result.entries[0].scope).toEqual(["**"]);

    expect(result.entries[1].path).toBe("services/payments/AGENTS.md");
    expect(result.entries[1].purpose).toBe("Payments domain rules.");
    expect(result.entries[1].scope).toEqual(["services/payments/**"]);
    expect(result.entries[1].owners).toEqual(["@payments-team"]);
  });

  it("should parse multiple comma-separated scopes", () => {
    const input = `- Path: /infra/AGENTS.md
  - Purpose: Infra rules.
  - Applies to: /infra/**, /terraform/**, /.github/**
  - Owners: @devops
`;

    const result = parseMarkdown(input);
    expect(result.entries[0].scope).toEqual(["infra/**", "terraform/**", ".github/**"]);
  });

  it("should handle entries without optional fields", () => {
    const input = `- Path: /src/AGENTS.md
  - Purpose: Source code rules.
  - Applies to: /src/**
`;

    const result = parseMarkdown(input);
    expect(result.entries[0].owners).toBeUndefined();
    expect(result.entries[0].tags).toBeUndefined();
    expect(result.entries[0].last_reviewed).toBeUndefined();
  });

  it("should handle entries with tags and last_reviewed", () => {
    const input = `- Path: /frontend/AGENTS.md
  - Purpose: UI conventions.
  - Applies to: /frontend/**
  - Owners: @web-team
  - Tags: frontend, a11y
  - Last reviewed: 2026-02-21
`;

    const result = parseMarkdown(input);
    const entry = result.entries[0];
    expect(entry.tags).toEqual(["frontend", "a11y"]);
    expect(entry.last_reviewed).toBe("2026-02-21");
  });

  it("should parse priority field", () => {
    const input = `- Path: /security/AGENTS.md
  - Purpose: Security policies.
  - Applies to: /security/**
  - Priority: critical
`;

    const result = parseMarkdown(input);
    expect(result.entries[0].priority).toBe("critical");
  });

  it("should parse last modified field", () => {
    const input = `- Path: /AGENTS.md
  - Purpose: Root conventions.
  - Applies to: /**
  - Priority: high
  - Last modified: 2026-02-21
`;

    const result = parseMarkdown(input);
    const entry = result.entries[0];
    expect(entry.priority).toBe("high");
    expect(entry.last_modified).toBe("2026-02-21");
  });

  it("should handle all fields together", () => {
    const input = `- Path: /services/payments/AGENTS.md
  - Purpose: PCI rules, Stripe patterns.
  - Applies to: /services/payments/**
  - Priority: critical
  - Last modified: 2026-02-20
  - Owners: @payments-team
  - Tags: backend, compliance
  - Last reviewed: 2026-02-21
`;

    const result = parseMarkdown(input);
    const entry = result.entries[0];
    expect(entry.priority).toBe("critical");
    expect(entry.last_modified).toBe("2026-02-20");
    expect(entry.owners).toEqual(["@payments-team"]);
    expect(entry.tags).toEqual(["backend", "compliance"]);
    expect(entry.last_reviewed).toBe("2026-02-21");
  });

  it("should default scope to ** for root AGENTS.md when Applies to is missing", () => {
    const input = `- Path: /AGENTS.md
  - Purpose: Minimal entry.
`;

    const result = parseMarkdown(input);
    expect(result.entries[0].scope).toEqual(["**"]);
  });

  it("should default scope to entry directory when Applies to is missing for nested path", () => {
    const input = `- Path: /services/payments/AGENTS.md
  - Purpose: Payment rules.
`;

    const result = parseMarkdown(input);
    expect(result.entries[0].scope).toEqual(["services/payments/**"]);
  });

  it("should return empty entries for empty content", () => {
    const result = parseMarkdown("");
    expect(result.entries).toHaveLength(0);
  });

  it("should handle path without leading slash", () => {
    const input = `- Path: services/auth/AGENTS.md
  - Purpose: Auth rules.
  - Applies to: /services/auth/**
`;

    const result = parseMarkdown(input);
    expect(result.entries[0].path).toBe("services/auth/AGENTS.md");
  });

  it("should handle multiple entries in sequence", () => {
    const input = `# AGENTS.map

## Entries

- Path: /AGENTS.md
  - Purpose: Root.
  - Applies to: /**

- Path: /frontend/AGENTS.md
  - Purpose: UI.
  - Applies to: /frontend/**

- Path: /backend/AGENTS.md
  - Purpose: API.
  - Applies to: /backend/**
`;

    const result = parseMarkdown(input);
    expect(result.entries).toHaveLength(3);
    expect(result.entries[0].path).toBe("AGENTS.md");
    expect(result.entries[1].path).toBe("frontend/AGENTS.md");
    expect(result.entries[2].path).toBe("backend/AGENTS.md");
  });
});
