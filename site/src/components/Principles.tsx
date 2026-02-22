const principles = [
  {
    title: "Hints, not rules",
    description:
      "AGENTS.map is informational. The individual AGENTS.md files remain the source of truth. The map helps agents find them faster.",
  },
  {
    title: "Markdown native",
    description:
      "Readable on GitHub, GitLab, any renderer. No tooling required, no JSON schema. If you can read a bulleted list, you can read the map.",
  },
  {
    title: "Fail-safe by default",
    description:
      "If the map is missing, stale, or invalid, agents fall back to scanning. You can't break anything by adopting AGENTS.map.",
  },
];

export function Principles() {
  return (
    <>
      <p className="text-[12px] uppercase tracking-[0.15em] text-white/50 mb-6">
        How It Works
      </p>

      <h2 className="text-[28px] font-semibold text-white tracking-[-0.02em] mb-4 leading-tight">
        Simple, safe, deterministic
      </h2>

      <p className="text-[15px] text-[#c4c4cc] leading-[1.8] mb-4">
        When an agent enters your repo, it checks the root for
        AGENTS.map.md. It matches entries by glob, ranks by
        specificity, and falls back to scanning if the map is absent.
      </p>

      <p className="text-[13px] text-white/60 mb-10">
        <span className="text-white/40">$</span>{" "}
        load → match → rank → fallback
      </p>

      <div className="space-y-6">
        {principles.map((p, i) => (
          <div key={p.title}>
            <h3 className="text-[15px] font-medium text-white/90 mb-1.5">
              <span className="text-white/40 mr-2">
                {String(i + 1).padStart(2, "0")}
              </span>
              {p.title}
            </h3>
            <p className="text-[14px] text-[#c4c4cc] leading-[1.7] pl-8">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
