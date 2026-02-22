/**
 * AGENTS.map type definitions (v1 spec).
 */

/** A single entry in the AGENTS.map.md file. */
export interface AgentsMapEntry {
  /** POSIX path relative to repo root. Must not contain ".." or start with "/". */
  path: string;
  /** Glob patterns indicating which paths this entry applies to. */
  scope: string[];
  /** 1-3 sentences explaining why/when to use this file. */
  purpose: string;
  /** Optional team handles, CODEOWNERS aliases, etc. */
  owners?: string[];
  /** Optional categorical labels. */
  tags?: string[];
  /** Optional date in YYYY-MM-DD format. */
  last_reviewed?: string;
}

/** The parsed AGENTS.map structure. */
export interface AgentsMap {
  /** Must be 1 for this version of the spec. */
  schema_version: number;
  /** Array of entry objects. */
  entries: AgentsMapEntry[];
}

/** Validation severity levels. */
export type Severity = "error" | "warning";

/** A single validation diagnostic. */
export interface ValidationDiagnostic {
  severity: Severity;
  message: string;
  /** The entry path this diagnostic relates to, if applicable. */
  entryPath?: string;
}

/** Result of validation. */
export interface ValidationResult {
  valid: boolean;
  diagnostics: ValidationDiagnostic[];
}

/** Result of resolving a target path against the map. */
export interface ResolveMatch {
  entry: AgentsMapEntry;
  /** The specific scope pattern that matched. */
  matchedPattern: string;
  /** Specificity score (higher = more specific). */
  specificity: number;
}

/** A discovered AGENTS.md file on disk. */
export interface DiscoveredFile {
  /** Relative POSIX path from the repo root. */
  path: string;
  /** Whether this file is listed in the current AGENTS.map. */
  listed: boolean;
  /** First meaningful line content, used for purpose inference. */
  firstLine?: string;
}
