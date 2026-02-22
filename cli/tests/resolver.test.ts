import { describe, it, expect } from "vitest";
import { resolveEntries, resolveByTag, calculateSpecificity } from "../src/resolver.js";
import type { AgentsMap } from "../src/types.js";

describe("calculateSpecificity", () => {
  it("should return 0 for **", () => {
    expect(calculateSpecificity("**")).toBe(0);
  });

  it("should return 0 for /** (normalized)", () => {
    expect(calculateSpecificity("/**")).toBe(0);
  });

  it("should score literal segments highest", () => {
    const score = calculateSpecificity("services/auth/**");
    expect(score).toBe(6); // services(3) + auth(3) + **(0)
  });

  it("should score wildcards lower than literals", () => {
    const wildcardScore = calculateSpecificity("services/*/files");
    const literalScore = calculateSpecificity("services/auth/files");
    expect(literalScore).toBeGreaterThan(wildcardScore);
  });

  it("should handle deeply nested paths", () => {
    const shallow = calculateSpecificity("a/**");
    const deep = calculateSpecificity("a/b/c/**");
    expect(deep).toBeGreaterThan(shallow);
  });
});

describe("resolveEntries", () => {
  const testMap: AgentsMap = {
    schema_version: 1,
    entries: [
      {
        path: "AGENTS.md",
        scope: ["**"],
        purpose: "Global conventions.",
      },
      {
        path: "services/auth/AGENTS.md",
        scope: ["services/auth/**"],
        purpose: "Auth service rules.",
        owners: ["@security-team"],
      },
      {
        path: "services/payments/AGENTS.md",
        scope: ["services/payments/**"],
        purpose: "Payments rules.",
        owners: ["@payments-team"],
      },
      {
        path: "frontend/AGENTS.md",
        scope: ["frontend/**"],
        purpose: "UI conventions.",
      },
      {
        path: "infra/AGENTS.md",
        scope: ["infra/**", "terraform/**", ".github/**"],
        purpose: "Infrastructure rules.",
        owners: ["@devops"],
      },
    ],
  };

  it("should match the root entry for any path", () => {
    const matches = resolveEntries(testMap, "README.md");
    expect(matches).toHaveLength(1);
    expect(matches[0].entry.path).toBe("AGENTS.md");
  });

  it("should match specific and global entries", () => {
    const matches = resolveEntries(testMap, "services/auth/login.ts");
    expect(matches).toHaveLength(2);
    // Most specific first
    expect(matches[0].entry.path).toBe("services/auth/AGENTS.md");
    expect(matches[1].entry.path).toBe("AGENTS.md");
  });

  it("should match deeply nested paths", () => {
    const matches = resolveEntries(testMap, "services/payments/stripe/webhook.ts");
    expect(matches).toHaveLength(2);
    expect(matches[0].entry.path).toBe("services/payments/AGENTS.md");
  });

  it("should match frontend paths", () => {
    const matches = resolveEntries(testMap, "frontend/components/Button.tsx");
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].entry.path).toBe("frontend/AGENTS.md");
  });

  it("should match infra paths with multiple scopes", () => {
    const matchesInfra = resolveEntries(testMap, "infra/main.tf");
    expect(matchesInfra.some((m) => m.entry.path === "infra/AGENTS.md")).toBe(true);

    const matchesTerraform = resolveEntries(testMap, "terraform/modules/vpc.tf");
    expect(matchesTerraform.some((m) => m.entry.path === "infra/AGENTS.md")).toBe(true);

    const matchesGithub = resolveEntries(testMap, ".github/workflows/ci.yml");
    expect(matchesGithub.some((m) => m.entry.path === "infra/AGENTS.md")).toBe(true);
  });

  it("should sort by specificity (most specific first)", () => {
    const matches = resolveEntries(testMap, "services/auth/middleware/jwt.ts");
    expect(matches.length).toBeGreaterThanOrEqual(2);
    // First should be more specific than last
    expect(matches[0].specificity).toBeGreaterThanOrEqual(matches[matches.length - 1].specificity);
  });

  it("should handle leading slash in target path", () => {
    const matches = resolveEntries(testMap, "/services/auth/login.ts");
    expect(matches).toHaveLength(2);
    expect(matches[0].entry.path).toBe("services/auth/AGENTS.md");
  });

  it("should handle backslashes in target path", () => {
    const matches = resolveEntries(testMap, "services\\auth\\login.ts");
    expect(matches).toHaveLength(2);
    expect(matches[0].entry.path).toBe("services/auth/AGENTS.md");
  });

  it("should sort by priority first, then specificity", () => {
    const priorityMap: AgentsMap = {
      schema_version: 1,
      entries: [
        {
          path: "AGENTS.md",
          scope: ["**"],
          purpose: "Global.",
          priority: "low",
        },
        {
          path: "services/auth/AGENTS.md",
          scope: ["services/auth/**"],
          purpose: "Auth.",
          priority: "normal",
        },
        {
          path: "security/AGENTS.md",
          scope: ["**"],
          purpose: "Security policies.",
          priority: "critical",
        },
      ],
    };

    const matches = resolveEntries(priorityMap, "services/auth/login.ts");
    // Critical should come first despite lower specificity
    expect(matches[0].entry.priority).toBe("critical");
    // Then normal (auth) with higher specificity
    expect(matches[1].entry.path).toBe("services/auth/AGENTS.md");
    // Then low (global)
    expect(matches[2].entry.priority).toBe("low");
  });

  it("should treat missing priority as normal", () => {
    const mixedMap: AgentsMap = {
      schema_version: 1,
      entries: [
        {
          path: "AGENTS.md",
          scope: ["**"],
          purpose: "Global.",
          priority: "high",
        },
        {
          path: "src/AGENTS.md",
          scope: ["src/**"],
          purpose: "Source.",
          // no priority = normal
        },
      ],
    };

    const matches = resolveEntries(mixedMap, "src/app.ts");
    expect(matches[0].entry.path).toBe("AGENTS.md"); // high > normal
    expect(matches[1].entry.path).toBe("src/AGENTS.md");
  });

  it("should return empty array for no matches with restrictive scopes", () => {
    const restrictedMap: AgentsMap = {
      schema_version: 1,
      entries: [
        {
          path: "src/AGENTS.md",
          scope: ["src/**"],
          purpose: "Source only.",
        },
      ],
    };

    const matches = resolveEntries(restrictedMap, "docs/readme.md");
    expect(matches).toHaveLength(0);
  });
});

describe("resolveByTag", () => {
  const tagMap: AgentsMap = {
    schema_version: 1,
    entries: [
      {
        path: "AGENTS.md",
        scope: ["**"],
        purpose: "Global.",
      },
      {
        path: "packages/ui/AGENTS.md",
        scope: ["packages/ui/**"],
        purpose: "Component library.",
        tags: ["frontend", "shared"],
        priority: "high",
      },
      {
        path: "services/api/AGENTS.md",
        scope: ["services/api/**"],
        purpose: "API endpoints.",
        tags: ["backend"],
      },
      {
        path: "frontend/AGENTS.md",
        scope: ["frontend/**"],
        purpose: "Frontend app.",
        tags: ["frontend"],
      },
      {
        path: "security/AGENTS.md",
        scope: ["**"],
        purpose: "Security policies.",
        tags: ["security", "compliance"],
        priority: "critical",
      },
    ],
  };

  it("should find entries by tag", () => {
    const matches = resolveByTag(tagMap, ["frontend"]);
    expect(matches).toHaveLength(2);
    const paths = matches.map((m) => m.entry.path);
    expect(paths).toContain("packages/ui/AGENTS.md");
    expect(paths).toContain("frontend/AGENTS.md");
  });

  it("should not match entries without tags", () => {
    const matches = resolveByTag(tagMap, ["frontend"]);
    const paths = matches.map((m) => m.entry.path);
    expect(paths).not.toContain("AGENTS.md");
  });

  it("should sort results by priority", () => {
    const matches = resolveByTag(tagMap, ["frontend", "security"]);
    // Critical (security) should come first
    expect(matches[0].entry.path).toBe("security/AGENTS.md");
  });

  it("should be case-insensitive", () => {
    const matches = resolveByTag(tagMap, ["FRONTEND"]);
    expect(matches).toHaveLength(2);
  });

  it("should match multiple tags", () => {
    const matches = resolveByTag(tagMap, ["backend", "compliance"]);
    expect(matches).toHaveLength(2);
    const paths = matches.map((m) => m.entry.path);
    expect(paths).toContain("services/api/AGENTS.md");
    expect(paths).toContain("security/AGENTS.md");
  });

  it("should return empty for unknown tags", () => {
    const matches = resolveByTag(tagMap, ["mobile"]);
    expect(matches).toHaveLength(0);
  });

  it("should set matchedPattern to tag:<name>", () => {
    const matches = resolveByTag(tagMap, ["backend"]);
    expect(matches[0].matchedPattern).toBe("tag:backend");
  });
});
