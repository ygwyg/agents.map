export function Hero() {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-[0.15em] text-white/50 mb-6">
        Open Standard / v1
      </p>

      <h1 className="text-[40px] sm:text-[52px] font-semibold tracking-[-0.03em] leading-[1.1] mb-6 text-white">
        AGENTS<span className="text-white/40">.</span>map
      </h1>

      <p className="text-[16px] text-[#c4c4cc] leading-[1.8]">
        A sitemap for your repo's agent instructions. One Markdown
        file at the root — every agent instruction file, indexed.
      </p>

      <div className="flex items-center gap-3 mt-8">
        <button
          className="px-4 py-2 bg-white text-black text-[13px] font-medium rounded-md hover:bg-white/90 transition-colors cursor-pointer"
          onClick={() =>
            document
              .getElementById("get-started")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Get Started
        </button>
        <button
          className="px-4 py-2 border border-white/[0.2] text-white/70 text-[13px] font-medium rounded-md hover:border-white/[0.4] hover:text-white transition-all cursor-pointer"
          onClick={() =>
            document
              .getElementById("format")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          See the Format
        </button>
      </div>
    </div>
  );
}
