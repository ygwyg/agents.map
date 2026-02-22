/**
 * Parse AGENTS.map.md files.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { AgentsMap, AgentsMapEntry } from "./types.js";

const MAP_FILENAME = "AGENTS.map.md";

/** Find the AGENTS.map.md file in the given directory. */
export function findMap(dir: string): string | null {
  const mapPath = path.join(dir, MAP_FILENAME);
  if (fs.existsSync(mapPath)) {
    return mapPath;
  }
  return null;
}

/** Parse an AGENTS.map.md file from a given directory. */
export function parseMap(dir: string): { map: AgentsMap; filePath: string } {
  const filePath = findMap(dir);
  if (!filePath) {
    throw new Error(
      `No AGENTS.map.md found in ${dir}. Run \`agentsmap init\` to create one.`
    );
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const map = parseMarkdown(content);
  return { map, filePath };
}

/** Parse AGENTS.map.md content into an AgentsMap structure. */
export function parseMarkdown(content: string): AgentsMap {
  const entries: AgentsMapEntry[] = [];
  const lines = content.split("\n");

  let currentEntry: Partial<AgentsMapEntry> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match "- Path: /some/path" or "- Path: some/path"
    const pathMatch = trimmed.match(/^-\s+Path:\s+\/?(.+)$/i);
    if (pathMatch) {
      // Save previous entry if complete
      if (currentEntry && currentEntry.path) {
        entries.push(finalizeEntry(currentEntry));
      }
      currentEntry = { path: pathMatch[1].trim() };
      continue;
    }

    if (!currentEntry) continue;

    // Match "- Purpose: ..."
    const purposeMatch = trimmed.match(/^-\s+Purpose:\s+(.+)$/i);
    if (purposeMatch) {
      currentEntry.purpose = purposeMatch[1].trim();
      continue;
    }

    // Match "- Applies to: ..." (one or more comma-separated globs)
    const scopeMatch = trimmed.match(/^-\s+Applies\s+to:\s+(.+)$/i);
    if (scopeMatch) {
      currentEntry.scope = scopeMatch[1]
        .split(",")
        .map((s) => s.trim())
        .map((s) => (s.startsWith("/") ? s.slice(1) : s));
      continue;
    }

    // Match "- Owners: ..."
    const ownersMatch = trimmed.match(/^-\s+Owners?:\s+(.+)$/i);
    if (ownersMatch) {
      currentEntry.owners = ownersMatch[1]
        .split(",")
        .map((o) => o.trim());
      continue;
    }

    // Match "- Tags: ..."
    const tagsMatch = trimmed.match(/^-\s+Tags?:\s+(.+)$/i);
    if (tagsMatch) {
      currentEntry.tags = tagsMatch[1]
        .split(",")
        .map((t) => t.trim());
      continue;
    }

    // Match "- Last reviewed: ..."
    const reviewedMatch = trimmed.match(/^-\s+Last\s+reviewed:\s+(.+)$/i);
    if (reviewedMatch) {
      currentEntry.last_reviewed = reviewedMatch[1].trim();
      continue;
    }
  }

  // Don't forget the last entry
  if (currentEntry && currentEntry.path) {
    entries.push(finalizeEntry(currentEntry));
  }

  return {
    schema_version: 1,
    entries,
  };
}

/** Finalize a partially-parsed entry with defaults for missing fields. */
function finalizeEntry(partial: Partial<AgentsMapEntry>): AgentsMapEntry {
  const entry: AgentsMapEntry = {
    path: partial.path!,
    scope: partial.scope ?? ["**"],
    purpose: partial.purpose ?? "",
  };
  if (partial.owners) entry.owners = partial.owners;
  if (partial.tags) entry.tags = partial.tags;
  if (partial.last_reviewed) entry.last_reviewed = partial.last_reviewed;
  return entry;
}
