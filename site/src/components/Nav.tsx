import { useState, useEffect } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-black/60 backdrop-blur-2xl border-b border-white/[0.06]"
          : ""
      }`}
    >
      <div className="mx-auto max-w-[620px] px-6 h-14 flex items-center justify-between">
        <a href="#" className="text-[13px] font-medium text-white/90">
          AGENTS<span className="text-white/40">.</span>map
        </a>
        <a
          href="https://github.com/anthropics/agents-map"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-white/50 hover:text-white/80 transition-colors"
        >
          GitHub
        </a>
      </div>
    </nav>
  );
}
