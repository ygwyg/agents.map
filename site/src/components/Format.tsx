import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";

/* ── File tree data ── */

interface TreeRow {
  name: string;
  type: "file" | "folder";
  depth: number;
  entryId?: string;
  isMap?: boolean;
}

const tree: TreeRow[] = [
  { name: "AGENTS.map.md", type: "file", depth: 0, isMap: true },
  { name: "AGENTS.md", type: "file", depth: 0, entryId: "root" },
  { name: "package.json", type: "file", depth: 0 },
  { name: "tsconfig.json", type: "file", depth: 0 },
  { name: "services", type: "folder", depth: 0 },
  { name: "payments", type: "folder", depth: 1 },
  { name: "AGENTS.md", type: "file", depth: 2, entryId: "payments" },
  { name: "stripe.ts", type: "file", depth: 2 },
  { name: "api", type: "folder", depth: 1 },
  { name: "routes.ts", type: "file", depth: 2 },
  { name: "packages", type: "folder", depth: 0 },
  { name: "ui", type: "folder", depth: 1 },
  { name: "AGENTS.md", type: "file", depth: 2, entryId: "ui" },
  { name: "Button.tsx", type: "file", depth: 2 },
  { name: "infra", type: "folder", depth: 0 },
  { name: "AGENTS.md", type: "file", depth: 1, entryId: "infra" },
  { name: "main.tf", type: "file", depth: 1 },
];

/* ── Map entry ranges ── */

interface MapEntry {
  id: string;
  lineRange: [number, number];
}

const mapEntries: MapEntry[] = [
  { id: "root", lineRange: [8, 12] },
  { id: "payments", lineRange: [14, 20] },
  { id: "ui", lineRange: [22, 27] },
  { id: "infra", lineRange: [29, 33] },
];

const getEntryForLine = (num: number): string | null => {
  for (const entry of mapEntries) {
    if (num >= entry.lineRange[0] && num <= entry.lineRange[1]) return entry.id;
  }
  return null;
};

/* ── Map file content ── */

interface Line {
  num: number;
  content: ReactNode;
}

const lines: Line[] = [
  { num: 1, content: <span className="s-h1"># AGENTS.map</span> },
  { num: 2, content: null },
  { num: 3, content: <span className="s-comment">Index of all AGENTS.md files</span> },
  { num: 4, content: <span className="s-comment">in this repository.</span> },
  { num: 5, content: null },
  { num: 6, content: <span className="s-h2">## Entries</span> },
  { num: 7, content: null },
  { num: 8, content: <><span className="s-key">- Path: </span><span className="s-path">/AGENTS.md</span></> },
  { num: 9, content: <><span className="s-key">{"  Purpose: "}</span><span className="s-val">Repo-wide coding standards, PR rules, CI pipeline.</span></> },
  { num: 10, content: <><span className="s-key">{"  Applies to: "}</span><span className="s-glob">/**</span></> },
  { num: 11, content: <><span className="s-key">{"  Priority: "}</span><span className="s-priority">high</span></> },
  { num: 12, content: <><span className="s-key">{"  Last modified: "}</span><span className="s-date">2026-02-15</span></> },
  { num: 13, content: null },
  { num: 14, content: <><span className="s-key">- Path: </span><span className="s-path">/services/payments/AGENTS.md</span></> },
  { num: 15, content: <><span className="s-key">{"  Purpose: "}</span><span className="s-val">PCI-DSS constraints, Stripe integration, test fixtures.</span></> },
  { num: 16, content: <><span className="s-key">{"  Applies to: "}</span><span className="s-glob">/services/payments/**</span></> },
  { num: 17, content: <><span className="s-key">{"  Priority: "}</span><span className="s-priority">critical</span></> },
  { num: 18, content: <><span className="s-key">{"  Last modified: "}</span><span className="s-date">2026-02-20</span></> },
  { num: 19, content: <><span className="s-key">{"  Owners: "}</span><span className="s-owner">@payments-team</span></> },
  { num: 20, content: <><span className="s-key">{"  Tags: "}</span><span className="s-tag">backend, compliance</span></> },
  { num: 21, content: null },
  { num: 22, content: <><span className="s-key">- Path: </span><span className="s-path">/packages/ui/AGENTS.md</span></> },
  { num: 23, content: <><span className="s-key">{"  Purpose: "}</span><span className="s-val">Design tokens, WCAG 2.1 AA, Storybook conventions.</span></> },
  { num: 24, content: <><span className="s-key">{"  Applies to: "}</span><span className="s-glob">/packages/ui/**</span></> },
  { num: 25, content: <><span className="s-key">{"  Last modified: "}</span><span className="s-date">2026-01-10</span></> },
  { num: 26, content: <><span className="s-key">{"  Owners: "}</span><span className="s-owner">@design-systems</span></> },
  { num: 27, content: <><span className="s-key">{"  Tags: "}</span><span className="s-tag">frontend, shared</span></> },
  { num: 28, content: null },
  { num: 29, content: <><span className="s-key">- Path: </span><span className="s-path">/infra/AGENTS.md</span></> },
  { num: 30, content: <><span className="s-key">{"  Purpose: "}</span><span className="s-val">Terraform modules, deploy workflows, env promotion.</span></> },
  { num: 31, content: <><span className="s-key">{"  Applies to: "}</span><span className="s-glob">/infra/**</span></> },
  { num: 32, content: <><span className="s-key">{"  Last modified: "}</span><span className="s-date">2026-02-18</span></> },
  { num: 33, content: <><span className="s-key">{"  Owners: "}</span><span className="s-owner">@platform</span></> },
];

/* ── Component ── */

export function Format() {
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const handleHover = useCallback((id: string | null) => setActiveEntry(id), []);
  const treeRef = useRef<HTMLDivElement>(null);

  const activeRange = activeEntry
    ? mapEntries.find((e) => e.id === activeEntry)?.lineRange
    : null;

  const isLineActive = (num: number) =>
    activeRange != null && num >= activeRange[0] && num <= activeRange[1];

  // Auto-scroll tree to active entry
  useEffect(() => {
    if (!activeEntry || !treeRef.current) return;
    const node = treeRef.current.querySelector(`[data-entry="${activeEntry}"]`);
    if (node) {
      node.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeEntry]);

  return (
    <>
      <p className="text-[12px] uppercase tracking-[0.15em] text-white/50 mb-6">
        The Format
      </p>

      <h2 className="text-[28px] font-semibold text-white tracking-[-0.02em] mb-4 leading-tight">
        Your repo, indexed
      </h2>

      <p className="text-[15px] text-[#c4c4cc] mb-8 leading-[1.8]">
        AGENTS.map.md sits at the root and maps every instruction file
        in your codebase. Hover a file to see its entry.
      </p>

      {/* IDE container — break out of 620px column */}
      <div className="editor -mx-6 sm:-mx-10" onMouseLeave={() => handleHover(null)}>
        {/* Titlebar */}
        <div className="editor-titlebar">
          <div className="editor-dot" />
          <div className="editor-dot" />
          <div className="editor-dot" />
          <span className="ml-3 text-[11px] text-white/40">myrepo</span>
        </div>

        <div className="flex max-h-[480px]">
          {/* File tree panel */}
          <div
            ref={treeRef}
            className="w-[180px] flex-shrink-0 border-r border-white/[0.06] overflow-y-auto"
          >
            <div className="px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-white/30">
              Explorer
            </div>
            <div className="pb-3">
              {tree.map((node, i) => {
                const isActive = node.entryId != null && activeEntry === node.entryId;
                const isAgentsFile = !!node.entryId;

                return (
                  <div
                    key={i}
                    data-entry={node.entryId}
                    className={`flex items-center h-[22px] text-[11px] cursor-default transition-colors overflow-hidden whitespace-nowrap ${
                      node.isMap
                        ? "bg-white/[0.06] text-white/60"
                        : isActive
                          ? "bg-white/[0.08] text-white"
                          : isAgentsFile
                            ? "text-[#93c5fd] hover:bg-white/[0.04]"
                            : node.type === "folder"
                              ? "text-white/40"
                              : "text-white/25"
                    }`}
                    style={{ paddingLeft: 12 + node.depth * 14 }}
                    onMouseEnter={() =>
                      node.entryId
                        ? handleHover(node.entryId)
                        : node.isMap
                          ? undefined
                          : handleHover(null)
                    }
                  >
                    {node.type === "folder" && (
                      <span className="text-white/30 mr-1 text-[9px]">▾</span>
                    )}
                    {node.name}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map file content */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            <div className="px-3 py-1.5 border-b border-white/[0.06] sticky top-0 bg-black/80 backdrop-blur-sm z-10">
              <span className="text-[11px] text-white/50 bg-white/[0.05] px-2 py-0.5 rounded">
                AGENTS.map.md
              </span>
            </div>
            <div className="py-3 overflow-x-auto">
              {lines.map((line) => (
                <div
                  key={line.num}
                  className={`editor-line ${isLineActive(line.num) ? "editor-line-active" : ""}`}
                  onMouseEnter={() => handleHover(getEntryForLine(line.num))}
                >
                  <span className="editor-ln !w-[32px] !pr-3 !text-[11px]">{line.num}</span>
                  <span className="editor-lc !text-[12px] whitespace-nowrap">{line.content ?? "\u00A0"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
