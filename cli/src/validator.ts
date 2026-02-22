/**
 * Validation logic for AGENTS.map.md files.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentsMap, ValidationDiagnostic, ValidationResult } from "./types.js";
import { discoverAgentFiles } from "./discoverer.js";

/** Validate an AGENTS.map structure against the v1 spec rules. */
export function validate(map: AgentsMap, rootDir: string): ValidationResult {
  const diagnostics: ValidationDiagnostic[] = [];

  // Check that entries is present and is an array
  if (!Array.isArray(map.entries)) {
    diagnostics.push({
      severity: "error",
      message: '"entries" must be an array.',
    });
    return { valid: false, diagnostics };
  }

  // Track paths for duplicate detection
  const seenPaths = new Set<string>();

  for (const entry of map.entries) {
    // Check required fields
    if (!entry.path || typeof entry.path !== "string") {
      diagnostics.push({
        severity: "error",
        message: "Entry is missing required field \"path\".",
      });
      continue;
    }

    if (!entry.scope || !Array.isArray(entry.scope) || entry.scope.length === 0) {
      diagnostics.push({
        severity: "error",
        message: `Entry "${entry.path}": missing or empty required field "scope".`,
        entryPath: entry.path,
      });
    }

    if (!entry.purpose || typeof entry.purpose !== "string") {
      diagnostics.push({
        severity: "error",
        message: `Entry "${entry.path}": missing required field "purpose".`,
        entryPath: entry.path,
      });
    }

    // Check path doesn't contain ".."
    if (entry.path.includes("..")) {
      diagnostics.push({
        severity: "error",
        message: `Entry "${entry.path}": path must not contain ".." segments.`,
        entryPath: entry.path,
      });
    }

    // Check path doesn't start with "/"
    if (entry.path.startsWith("/")) {
      diagnostics.push({
        severity: "error",
        message: `Entry "${entry.path}": path must not start with "/". Use relative POSIX paths.`,
        entryPath: entry.path,
      });
    }

    // Check for duplicate paths
    const normalizedPath = entry.path.replace(/\\/g, "/");
    if (seenPaths.has(normalizedPath)) {
      diagnostics.push({
        severity: "error",
        message: `Duplicate entry for path "${entry.path}".`,
        entryPath: entry.path,
      });
    }
    seenPaths.add(normalizedPath);

    // Check that the file actually exists
    const fullPath = path.join(rootDir, entry.path);
    if (!fs.existsSync(fullPath)) {
      diagnostics.push({
        severity: "error",
        message: `Entry "${entry.path}": file does not exist at ${fullPath}.`,
        entryPath: entry.path,
      });
    }

    // Validate last_reviewed format if present
    if (entry.last_reviewed) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.last_reviewed)) {
        diagnostics.push({
          severity: "warning",
          message: `Entry "${entry.path}": last_reviewed "${entry.last_reviewed}" is not in YYYY-MM-DD format.`,
          entryPath: entry.path,
        });
      }
    }
  }

  // Warn about AGENTS.md files that exist but aren't listed
  const discoveredFiles = discoverAgentFiles(rootDir);
  for (const file of discoveredFiles) {
    if (!seenPaths.has(file)) {
      diagnostics.push({
        severity: "warning",
        message: `Found AGENTS.md at "${file}" that is not listed in the map. Consider adding it.`,
        entryPath: file,
      });
    }
  }

  const hasErrors = diagnostics.some((d) => d.severity === "error");
  return { valid: !hasErrors, diagnostics };
}
