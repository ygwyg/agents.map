#!/usr/bin/env node
/**
 * agentsmap — CLI tool for the AGENTS.map specification.
 *
 * Discover, validate, and resolve AGENTS.md instruction files.
 */

import { Command } from "commander";
import chalk from "chalk";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

import { parseMap, findMap } from "./parser.js";
import { validate } from "./validator.js";
import { resolveEntries, resolveByTag, formatMatch } from "./resolver.js";
import { discoverAgentFiles, discoverDependencyAgentFiles, inferPurpose } from "./discoverer.js";
import { createMap, toMarkdown } from "./generator.js";

const program = new Command();

program
  .name("agentsmap")
  .description("CLI tool for the AGENTS.map specification — discover, validate, and resolve AGENTS.md files.")
  .version("0.1.1");

// ──────────────────────────────────────────────────────────────────────────────
// init
// ──────────────────────────────────────────────────────────────────────────────

program
  .command("init")
  .description("Scan for AGENTS.md files and generate an AGENTS.map.md file.")
  .option("--non-interactive", "Skip interactive prompts; use inferred or placeholder purposes.")
  .option("--deps", "Include AGENTS.md files from installed dependencies (node_modules).")
  .action(async (opts: { nonInteractive?: boolean; deps?: boolean }) => {
    const cwd = process.cwd();

    console.log(chalk.blue("Scanning for AGENTS.md files..."));
    const files = discoverAgentFiles(cwd);

    if (opts.deps) {
      const depFiles = discoverDependencyAgentFiles(cwd);
      if (depFiles.length > 0) {
        console.log(chalk.blue(`Found ${depFiles.length} dependency AGENTS.md file(s).`));
        files.push(...depFiles);
      }
    }

    if (files.length === 0) {
      console.log(chalk.yellow("No AGENTS.md files found in this directory tree."));
      console.log(chalk.dim("Create an AGENTS.md file and run this command again."));
      process.exit(0);
    }

    console.log(chalk.green(`Found ${files.length} AGENTS.md file(s):\n`));
    for (const file of files) {
      console.log(`  ${chalk.cyan(file)}`);
    }
    console.log();

    const entries: Array<{ path: string; purpose: string }> = [];

    if (opts.nonInteractive) {
      // Non-interactive: infer purpose from file content
      for (const file of files) {
        const fullPath = path.join(cwd, file);
        const purpose = inferPurpose(fullPath);
        entries.push({ path: file, purpose });
        console.log(`  ${chalk.cyan(file)} ${chalk.dim("->")} ${purpose}`);
      }
    } else {
      // Interactive: prompt for each purpose
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const question = (prompt: string): Promise<string> =>
        new Promise((resolve) => rl.question(prompt, resolve));

      for (const file of files) {
        const fullPath = path.join(cwd, file);
        const inferred = inferPurpose(fullPath);
        const defaultText = inferred !== "TODO: Describe this file's purpose." ? inferred : "";
        const hint = defaultText ? chalk.dim(` (default: "${defaultText}")`) : "";

        const answer = await question(
          `${chalk.cyan(file)} - Purpose${hint}: `
        );
        const purpose = answer.trim() || defaultText || "TODO: Describe this file's purpose.";
        entries.push({ path: file, purpose });
      }

      rl.close();
    }

    const map = createMap(entries);
    const content = toMarkdown(map);
    const outputPath = path.join(cwd, "AGENTS.map.md");

    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(
        chalk.yellow(`\nAGENTS.map.md already exists. Overwriting.`)
      );
    }

    fs.writeFileSync(outputPath, content, "utf-8");
    console.log(chalk.green(`\nCreated ${chalk.bold("AGENTS.map.md")} with ${entries.length} entries.`));
    console.log(chalk.dim("Run `agentsmap validate` to check the generated file."));
  });

// ──────────────────────────────────────────────────────────────────────────────
// validate / check
// ──────────────────────────────────────────────────────────────────────────────

const validateAction = () => {
  const cwd = process.cwd();

  const mapPath = findMap(cwd);
  if (!mapPath) {
    console.log(chalk.red("No AGENTS.map.md found."));
    console.log(chalk.dim("Run `agentsmap init` to create one."));
    process.exit(1);
  }

  console.log(chalk.blue(`Validating ${chalk.bold("AGENTS.map.md")}...\n`));

  let map;
  try {
    const result = parseMap(cwd);
    map = result.map;
  } catch (err) {
    console.log(chalk.red(`Parse error: ${(err as Error).message}`));
    process.exit(1);
  }

  const result = validate(map, cwd);

  const errors = result.diagnostics.filter((d) => d.severity === "error");
  const warnings = result.diagnostics.filter((d) => d.severity === "warning");

  for (const diag of errors) {
    console.log(`  ${chalk.red("error")}  ${diag.message}`);
  }
  for (const diag of warnings) {
    console.log(`  ${chalk.yellow("warn")}   ${diag.message}`);
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(chalk.green("All checks passed. No issues found."));
  } else {
    console.log();
    if (errors.length > 0) {
      console.log(chalk.red(`${errors.length} error(s)`));
    }
    if (warnings.length > 0) {
      console.log(chalk.yellow(`${warnings.length} warning(s)`));
    }
  }

  if (!result.valid) {
    process.exit(1);
  }
};

program
  .command("validate")
  .description("Validate the AGENTS.map.md file in the current directory.")
  .action(validateAction);

program
  .command("check")
  .description("Alias for validate.")
  .action(validateAction);

// ──────────────────────────────────────────────────────────────────────────────
// resolve
// ──────────────────────────────────────────────────────────────────────────────

program
  .command("resolve [target-path]")
  .description("Show which AGENTS.md files apply to a given path or tag.")
  .option("--json", "Output in JSON format.")
  .option("--tag <tags>", "Find entries by tag (comma-separated) instead of path.")
  .action((targetPath: string | undefined, opts: { json?: boolean; tag?: string }) => {
    const cwd = process.cwd();

    let map;
    try {
      const result = parseMap(cwd);
      map = result.map;
    } catch (err) {
      console.log(chalk.red((err as Error).message));
      process.exit(1);
    }

    // Tag-based resolution
    if (opts.tag) {
      const tags = opts.tag.split(",").map((t) => t.trim());
      const matches = resolveByTag(map, tags);

      if (opts.json) {
        const output = matches.map((m) => ({
          path: m.entry.path,
          purpose: m.entry.purpose,
          matchedPattern: m.matchedPattern,
          priority: m.entry.priority ?? "normal",
          owners: m.entry.owners,
          tags: m.entry.tags,
        }));
        console.log(JSON.stringify(output, null, 2));
        return;
      }

      if (matches.length === 0) {
        console.log(chalk.yellow(`No entries tagged "${opts.tag}".`));
        return;
      }

      console.log(
        chalk.blue(`${matches.length} entry(s) tagged ${chalk.bold(opts.tag)}:\n`)
      );

      for (const match of matches) {
        console.log(formatMatch(match));
        console.log();
      }
      return;
    }

    // Path-based resolution
    if (!targetPath) {
      console.log(chalk.red("Provide a target path or use --tag."));
      process.exit(1);
    }

    const matches = resolveEntries(map, targetPath);

    if (opts.json) {
      const output = matches.map((m) => ({
        path: m.entry.path,
        purpose: m.entry.purpose,
        matchedPattern: m.matchedPattern,
        specificity: m.specificity,
        priority: m.entry.priority ?? "normal",
        owners: m.entry.owners,
        tags: m.entry.tags,
      }));
      console.log(JSON.stringify(output, null, 2));
      return;
    }

    if (matches.length === 0) {
      console.log(chalk.yellow(`No AGENTS.md files apply to "${targetPath}".`));
      return;
    }

    console.log(
      chalk.blue(
        `${matches.length} AGENTS.md file(s) apply to ${chalk.bold(targetPath)}:\n`
      )
    );

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const rank = i + 1;
      const label = i === 0 ? chalk.green("(most specific)") : chalk.dim(`(#${rank})`);
      console.log(`${label}`);
      console.log(formatMatch(match));
      console.log();
    }
  });

// ──────────────────────────────────────────────────────────────────────────────
// discover
// ──────────────────────────────────────────────────────────────────────────────

program
  .command("discover")
  .description("Scan for all AGENTS.md files and show their listing status.")
  .option("--deps", "Include AGENTS.md files from installed dependencies (node_modules).")
  .action((opts: { deps?: boolean }) => {
    const cwd = process.cwd();

    console.log(chalk.blue("Scanning for AGENTS.md files...\n"));
    const files = discoverAgentFiles(cwd);

    if (opts.deps) {
      const depFiles = discoverDependencyAgentFiles(cwd);
      if (depFiles.length > 0) {
        console.log(chalk.blue(`Dependencies with AGENTS.md (${depFiles.length}):\n`));
        for (const f of depFiles) {
          const purpose = inferPurpose(path.join(cwd, f));
          console.log(`  ${chalk.magenta("⬡")} ${f}`);
          console.log(`    ${chalk.dim(purpose)}`);
        }
        console.log();
        files.push(...depFiles);
      }
    }

    if (files.length === 0) {
      console.log(chalk.yellow("No AGENTS.md files found."));
      return;
    }

    // Try to load existing map
    let listedPaths = new Set<string>();
    let hasMap = false;
    try {
      const result = parseMap(cwd);
      listedPaths = new Set(result.map.entries.map((e) => e.path));
      hasMap = true;
    } catch {
      // No map file or parse error — treat everything as unlisted
    }

    const listed: string[] = [];
    const unlisted: string[] = [];

    for (const file of files) {
      if (listedPaths.has(file)) {
        listed.push(file);
      } else {
        unlisted.push(file);
      }
    }

    if (hasMap) {
      if (listed.length > 0) {
        console.log(chalk.green(`Listed in AGENTS.map.md (${listed.length}):`));
        for (const f of listed) {
          console.log(`  ${chalk.green("+")} ${f}`);
        }
        console.log();
      }

      if (unlisted.length > 0) {
        console.log(chalk.yellow(`Not listed in AGENTS.map.md (${unlisted.length}):`));
        for (const f of unlisted) {
          const purpose = inferPurpose(path.join(cwd, f));
          console.log(`  ${chalk.yellow("?")} ${f}`);
          console.log(`    ${chalk.dim(`Suggested purpose: ${purpose}`)}`);
        }
        console.log();
        console.log(
          chalk.dim(
            'Run `agentsmap init` to regenerate the map, or manually add entries.'
          )
        );
      } else {
        console.log(chalk.green("All AGENTS.md files are listed in the map."));
      }
    } else {
      console.log(`Found ${files.length} AGENTS.md file(s):\n`);
      for (const f of files) {
        const purpose = inferPurpose(path.join(cwd, f));
        console.log(`  ${chalk.cyan(f)}`);
        console.log(`    ${chalk.dim(purpose)}`);
      }
      console.log();
      console.log(
        chalk.dim(
          "No AGENTS.map.md found. Run `agentsmap init` to create one."
        )
      );
    }

    // Also check for entries in the map that point to missing files
    if (hasMap) {
      const result = parseMap(cwd);
      const missingEntries = result.map.entries.filter(
        (e) => !files.includes(e.path)
      );
      if (missingEntries.length > 0) {
        console.log();
        console.log(chalk.red(`Stale entries in AGENTS.map.md (file missing):`));
        for (const e of missingEntries) {
          console.log(`  ${chalk.red("x")} ${e.path}`);
        }
      }
    }
  });

// ──────────────────────────────────────────────────────────────────────────────
// Run
// ──────────────────────────────────────────────────────────────────────────────

program.parse();
