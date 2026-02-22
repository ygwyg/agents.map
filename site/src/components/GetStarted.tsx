import { useState, useCallback } from "react";

function Terminal({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [command]);

  return (
    <div className="terminal group">
      <span className="terminal-prompt">$</span>
      <span className="terminal-cmd">{command}</span>
      <button
        onClick={handleCopy}
        className="ml-auto flex-shrink-0 text-[11px] text-white/30 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
        title="Copy to clipboard"
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

export function GetStarted() {
  return (
    <>
      <p className="text-[12px] uppercase tracking-[0.15em] text-white/50 mb-6">
        Quick Start
      </p>

      <h2 className="text-[28px] font-semibold text-white tracking-[-0.02em] mb-4 leading-tight">
        Start mapping in 30&nbsp;seconds
      </h2>

      <p className="text-[15px] text-[#c4c4cc] mb-8 leading-[1.8]">
        Generate from existing AGENTS.md files, or create one by hand.
      </p>

      <div className="space-y-3 mb-8">
        <div>
          <p className="text-[12px] text-white/50 mb-1.5">
            Generate the map
          </p>
          <Terminal command="npx agentsmap init" />
        </div>
        <div>
          <p className="text-[12px] text-white/50 mb-1.5">
            Validate it
          </p>
          <Terminal command="npx agentsmap validate" />
        </div>
        <div>
          <p className="text-[12px] text-white/50 mb-1.5">
            Resolve by tag
          </p>
          <Terminal command="npx agentsmap resolve --tag frontend" />
        </div>
        <div>
          <p className="text-[12px] text-white/50 mb-1.5">
            Add to CI
          </p>
          <Terminal command="npx agentsmap validate --strict" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[13px]">
        <a
          href="https://github.com/ygwyg/agents.map/blob/main/spec/v1.md"
          className="text-white/50 hover:text-white/80 transition-colors"
        >
          Read the spec
        </a>
        <span className="text-white/25">·</span>
        <a
          href="https://github.com/ygwyg/agents.map"
          className="text-white/50 hover:text-white/80 transition-colors"
        >
          GitHub
        </a>
        <span className="text-white/25">·</span>
        <a
          href="https://www.npmjs.com/package/agentsmap"
          className="text-white/50 hover:text-white/80 transition-colors"
        >
          npm
        </a>
        <span className="text-white/25">·</span>
        <a
          href="https://github.com/ygwyg/agents.map/discussions"
          className="text-white/50 hover:text-white/80 transition-colors"
        >
          Discussions
        </a>
      </div>
    </>
  );
}
