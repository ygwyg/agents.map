/**
 * Path resolution and scope matching for AGENTS.map entries.
 */

import picomatch from "picomatch";
import type { AgentsMap, ResolveMatch } from "./types.js";

/**
 * Calculate the specificity of a glob pattern.
 * More specific patterns have higher scores.
 *
 * Heuristic:
 * - Count non-wildcard path segments
 * - "**" alone is least specific
 * - Longer literal prefixes are more specific
 */
export function calculateSpecificity(pattern: string): number {
  // Remove leading slash if present
  const normalized = pattern.startsWith("/") ? pattern.slice(1) : pattern;

  // "**" alone matches everything — lowest specificity
  if (normalized === "**") return 0;

  const segments = normalized.split("/");
  let score = 0;

  for (const seg of segments) {
    if (seg === "**") {
      // Double wildcard doesn't add specificity
      score += 0;
    } else if (seg === "*") {
      // Single wildcard adds minimal specificity
      score += 1;
    } else if (seg.includes("*") || seg.includes("?")) {
      // Partial wildcard — somewhat specific
      score += 2;
    } else {
      // Literal segment — most specific
      score += 3;
    }
  }

  return score;
}

/**
 * Resolve which AGENTS.md entries apply to a given target path.
 * Returns matches sorted by specificity (most specific first).
 */
export function resolveEntries(map: AgentsMap, targetPath: string): ResolveMatch[] {
  // Normalize target path: strip leading slash and backslashes
  const normalized = targetPath
    .replace(/\\/g, "/")
    .replace(/^\//, "");

  const matches: ResolveMatch[] = [];

  for (const entry of map.entries) {
    for (const pattern of entry.scope) {
      // Normalize pattern: strip leading slash
      const normalizedPattern = pattern.startsWith("/") ? pattern.slice(1) : pattern;

      const isMatch = picomatch(normalizedPattern);
      if (isMatch(normalized)) {
        matches.push({
          entry,
          matchedPattern: pattern,
          specificity: calculateSpecificity(pattern),
        });
        // Only match the first (most specific) pattern per entry
        break;
      }
    }
  }

  // Sort by specificity (most specific first)
  matches.sort((a, b) => b.specificity - a.specificity);

  return matches;
}

/**
 * Format a resolved match for human-readable display.
 */
export function formatMatch(match: ResolveMatch): string {
  const lines: string[] = [];
  lines.push(`  ${match.entry.path}`);
  lines.push(`    Purpose: ${match.entry.purpose}`);
  lines.push(`    Matched pattern: ${match.matchedPattern}`);
  lines.push(`    Specificity: ${match.specificity}`);
  if (match.entry.owners && match.entry.owners.length > 0) {
    lines.push(`    Owners: ${match.entry.owners.join(", ")}`);
  }
  if (match.entry.tags && match.entry.tags.length > 0) {
    lines.push(`    Tags: ${match.entry.tags.join(", ")}`);
  }
  return lines.join("\n");
}
