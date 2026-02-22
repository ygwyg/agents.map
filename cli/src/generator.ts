/**
 * Generate AGENTS.map.md files.
 */

import * as path from "node:path";
import type { AgentsMap, AgentsMapEntry } from "./types.js";

/** Build a default scope from the path of an AGENTS.md file. */
export function defaultScope(agentsPath: string): string[] {
  const dir = path.posix.dirname(agentsPath);
  if (dir === ".") {
    // Root AGENTS.md applies to everything
    return ["**"];
  }
  return [`${dir}/**`];
}

/** Create a new AgentsMap structure from discovered files. */
export function createMap(
  entries: Array<{
    path: string;
    purpose: string;
    priority?: "critical" | "high" | "normal" | "low";
    last_modified?: string;
    owners?: string[];
    tags?: string[];
  }>
): AgentsMap {
  return {
    schema_version: 1,
    entries: entries.map((e) => {
      const entry: AgentsMapEntry = {
        path: e.path,
        scope: defaultScope(e.path),
        purpose: e.purpose,
      };
      if (e.priority && e.priority !== "normal") entry.priority = e.priority;
      if (e.last_modified) entry.last_modified = e.last_modified;
      if (e.owners && e.owners.length > 0) entry.owners = e.owners;
      if (e.tags && e.tags.length > 0) entry.tags = e.tags;
      return entry;
    }),
  };
}

/** Serialize an AgentsMap to Markdown format. */
export function toMarkdown(map: AgentsMap): string {
  const lines: string[] = [];
  lines.push("# AGENTS.map");
  lines.push("");
  lines.push("This file lists where nested AGENTS.md files live and what they're for.");
  lines.push("The AGENTS.md files themselves are authoritative for their subtrees.");
  lines.push("");
  lines.push("## Entries");
  lines.push("");

  for (const entry of map.entries) {
    lines.push(`- Path: /${entry.path}`);
    lines.push(`  - Purpose: ${entry.purpose}`);
    lines.push(`  - Applies to: ${entry.scope.map((s) => `/${s}`).join(", ")}`);
    if (entry.priority && entry.priority !== "normal") {
      lines.push(`  - Priority: ${entry.priority}`);
    }
    if (entry.last_modified) {
      lines.push(`  - Last modified: ${entry.last_modified}`);
    }
    if (entry.owners && entry.owners.length > 0) {
      lines.push(`  - Owners: ${entry.owners.join(", ")}`);
    }
    if (entry.tags && entry.tags.length > 0) {
      lines.push(`  - Tags: ${entry.tags.join(", ")}`);
    }
    if (entry.last_reviewed) {
      lines.push(`  - Last reviewed: ${entry.last_reviewed}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
