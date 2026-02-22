/**
 * Discover AGENTS.md files by scanning the filesystem.
 */

import * as fs from "node:fs";
import * as path from "node:path";

/** Directories to always skip when scanning. */
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".hg",
  ".svn",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "__pycache__",
  ".venv",
  "venv",
  ".tox",
  "vendor",
  ".bundle",
  "target",
  "coverage",
  ".cache",
  ".turbo",
]);

/**
 * Recursively scan a directory for AGENTS.md files.
 * Returns POSIX-style relative paths from rootDir.
 */
export function discoverAgentFiles(rootDir: string): string[] {
  const results: string[] = [];
  scanDir(rootDir, rootDir, results);
  return results.sort();
}

function scanDir(currentDir: string, rootDir: string, results: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    // Permission denied or other read error — skip
    return;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) {
        // Allow .github but skip other dot directories
        if (entry.name !== ".github") continue;
      }
      scanDir(path.join(currentDir, entry.name), rootDir, results);
    } else if (entry.isFile() && entry.name === "AGENTS.md") {
      const relativePath = path
        .relative(rootDir, path.join(currentDir, entry.name))
        .replace(/\\/g, "/");
      results.push(relativePath);
    }
  }
}

/**
 * Scan node_modules for AGENTS.md files shipped by dependencies.
 * Only checks the root of each package (not recursive).
 */
export function discoverDependencyAgentFiles(rootDir: string): string[] {
  const results: string[] = [];
  const nmDir = path.join(rootDir, "node_modules");

  if (!fs.existsSync(nmDir)) return results;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(nmDir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    if (entry.name.startsWith("@")) {
      // Scoped packages: @scope/package
      const scopeDir = path.join(nmDir, entry.name);
      let scopedEntries: fs.Dirent[];
      try {
        scopedEntries = fs.readdirSync(scopeDir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const pkg of scopedEntries) {
        if (!pkg.isDirectory()) continue;
        checkPackageForAgentsMd(
          path.join(scopeDir, pkg.name),
          `node_modules/${entry.name}/${pkg.name}`,
          results
        );
      }
    } else if (!entry.name.startsWith(".")) {
      checkPackageForAgentsMd(
        path.join(nmDir, entry.name),
        `node_modules/${entry.name}`,
        results
      );
    }
  }

  return results.sort();
}

function checkPackageForAgentsMd(
  pkgDir: string,
  relativePkgPath: string,
  results: string[]
): void {
  const agentsPath = path.join(pkgDir, "AGENTS.md");
  if (fs.existsSync(agentsPath)) {
    results.push(`${relativePkgPath}/AGENTS.md`);
  }
}

/**
 * Read the first meaningful line from an AGENTS.md file to infer a purpose.
 * Skips blank lines and heading markers.
 */
export function inferPurpose(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip empty lines
      if (!trimmed) continue;

      // If it's a heading, extract the heading text
      const headingMatch = trimmed.match(/^#+\s+(.+)$/);
      if (headingMatch) {
        const heading = headingMatch[1].trim();
        // Skip generic headings
        if (/^agents(\.md)?$/i.test(heading)) continue;
        return heading;
      }

      // Skip horizontal rules
      if (/^[-=*]{3,}$/.test(trimmed)) continue;

      // Skip HTML comments
      if (trimmed.startsWith("<!--")) continue;

      // Use first meaningful text line (truncated)
      const maxLen = 120;
      if (trimmed.length > maxLen) {
        return trimmed.slice(0, maxLen) + "...";
      }
      return trimmed;
    }
  } catch {
    // Can't read file — fall through to placeholder
  }

  return "TODO: Describe this file's purpose.";
}
