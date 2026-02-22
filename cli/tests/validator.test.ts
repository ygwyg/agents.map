import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { validate } from "../src/validator.js";
import type { AgentsMap } from "../src/types.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agentsmap-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function createFile(relativePath: string, content: string = ""): void {
  const fullPath = path.join(tmpDir, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, "utf-8");
}

describe("validate", () => {
  it("should pass for a valid map with existing files", () => {
    createFile("AGENTS.md", "# Root agents");
    createFile("services/auth/AGENTS.md", "# Auth agents");

    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        { path: "AGENTS.md", scope: ["**"], purpose: "Global." },
        { path: "services/auth/AGENTS.md", scope: ["services/auth/**"], purpose: "Auth." },
      ],
    };

    const result = validate(map, tmpDir);
    expect(result.valid).toBe(true);
    expect(result.diagnostics.filter((d) => d.severity === "error")).toHaveLength(0);
  });

  it("should error on path containing '..'", () => {
    createFile("AGENTS.md");

    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        { path: "../escape/AGENTS.md", scope: ["**"], purpose: "Bad path." },
      ],
    };

    const result = validate(map, tmpDir);
    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        message: expect.stringContaining('must not contain ".."'),
      })
    );
  });

  it("should error on path starting with '/'", () => {
    createFile("AGENTS.md");

    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        { path: "/AGENTS.md", scope: ["**"], purpose: "Absolute path." },
      ],
    };

    const result = validate(map, tmpDir);
    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        message: expect.stringContaining('must not start with "/"'),
      })
    );
  });

  it("should error on duplicate paths", () => {
    createFile("AGENTS.md");

    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        { path: "AGENTS.md", scope: ["**"], purpose: "First." },
        { path: "AGENTS.md", scope: ["**"], purpose: "Duplicate." },
      ],
    };

    const result = validate(map, tmpDir);
    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        message: expect.stringContaining("Duplicate"),
      })
    );
  });

  it("should error on missing file", () => {
    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        { path: "nonexistent/AGENTS.md", scope: ["**"], purpose: "Ghost." },
      ],
    };

    const result = validate(map, tmpDir);
    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        message: expect.stringContaining("does not exist"),
      })
    );
  });

  it("should error on missing required field 'purpose'", () => {
    createFile("AGENTS.md");

    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        { path: "AGENTS.md", scope: ["**"], purpose: "" },
      ],
    };

    const result = validate(map, tmpDir);
    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        message: expect.stringContaining('missing required field "purpose"'),
      })
    );
  });

  it("should error on empty scope array", () => {
    createFile("AGENTS.md");

    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        { path: "AGENTS.md", scope: [], purpose: "No scope." },
      ],
    };

    const result = validate(map, tmpDir);
    expect(result.valid).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "error",
        message: expect.stringContaining('missing or empty required field "scope"'),
      })
    );
  });

  it("should warn about unlisted AGENTS.md files", () => {
    createFile("AGENTS.md", "# Root");
    createFile("services/payments/AGENTS.md", "# Payments");

    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        { path: "AGENTS.md", scope: ["**"], purpose: "Root only." },
      ],
    };

    const result = validate(map, tmpDir);
    // Valid because it's only a warning
    expect(result.valid).toBe(true);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "warning",
        message: expect.stringContaining("services/payments/AGENTS.md"),
      })
    );
  });

  it("should warn on invalid last_reviewed format", () => {
    createFile("AGENTS.md");

    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        {
          path: "AGENTS.md",
          scope: ["**"],
          purpose: "Root.",
          last_reviewed: "Feb 21, 2026",
        },
      ],
    };

    const result = validate(map, tmpDir);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        severity: "warning",
        message: expect.stringContaining("YYYY-MM-DD"),
      })
    );
  });

  it("should pass with valid last_reviewed format", () => {
    createFile("AGENTS.md");

    const map: AgentsMap = {
      schema_version: 1,
      entries: [
        {
          path: "AGENTS.md",
          scope: ["**"],
          purpose: "Root.",
          last_reviewed: "2026-02-21",
        },
      ],
    };

    const result = validate(map, tmpDir);
    expect(result.valid).toBe(true);
    const lastReviewedDiags = result.diagnostics.filter(
      (d) => d.message.includes("last_reviewed")
    );
    expect(lastReviewedDiags).toHaveLength(0);
  });
});
