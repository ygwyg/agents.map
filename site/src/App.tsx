import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Principles } from "./components/Principles";
import { Format } from "./components/Format";
import { GetStarted } from "./components/GetStarted";
import { Footer } from "./components/Footer";
import PixelBlast from "./components/PixelBlast";

function App() {
  return (
    <div className="min-h-screen bg-black text-[#d4d4d8] relative">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#ffffff"
          patternScale={1.5}
          patternDensity={0.5}
          enableRipples={false}
          speed={0.3}
          transparent
          edgeFade={0}
        />
      </div>

      <div className="relative z-10">
        <Nav />

        <main className="max-w-[620px] mx-auto px-6 pt-36 pb-24">
          <div id="hero">
            <Hero />
          </div>

          <div id="principles" className="mt-24 pt-24 border-t border-white/[0.08]">
            <Principles />
          </div>

          <div id="format" className="mt-24 pt-24 border-t border-white/[0.08]">
            <Format />
          </div>

          <div id="get-started" className="mt-24 pt-24 border-t border-white/[0.08]">
            <GetStarted />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
