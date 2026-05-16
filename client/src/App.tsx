import { useCallback, useState } from "react";
import { AmbientBackground } from "./components/AmbientBackground";
import { BitmapExpressions } from "./components/BitmapExpressions";
import { FilmChat } from "./components/FilmChat";
import { NavBar } from "./components/NavBar";
import { Scene3D } from "./components/Scene3D";
import { SplashScreen } from "./components/SplashScreen";
import { WorkSection } from "./components/WorkSection";

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <div className="app-shell">
      {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
      <Scene3D className="app-shell__scene" />
      <AmbientBackground className="app-shell__blobs" />
      <BitmapExpressions />
      <NavBar />
      <main className="app-main">
        <section className="hero" id="home" aria-labelledby="hero-heading">
          <div className="hero__content">
            <p className="hero__eyebrow">Creative direction · Film · Edit</p>
            <h1 id="hero-heading" className="glow-hover">Madhurjya Saikia</h1>
            <p className="hero__sub">
              I shape how stories look and move—direction, cinematography, and editorial craft
              for regional brands, podcasts, and long-form work rooted in Northeast India.
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="#work">
                View work
              </a>
              <a className="btn btn--ghost" href="#about">
                About
              </a>
            </div>
          </div>
        </section>

        <WorkSection />

        <section className="about" id="about" aria-labelledby="about-heading">
          <div className="about__inner">
            <h2 id="about-heading" className="glow-hover">About</h2>
            <div className="about__copy">
              <p>
                My practice sits at the intersection of creative direction and hands-on
                production—leading shoots, cutting picture, and building visual systems that
                feel modern without losing place.
              </p>
              <p>
                Recent focus includes agency-led social for regional brands, podcast identity
                and production, and selective film and documentary work. I care about rhythm,
                clarity, and the small decisions that make a frame feel intentional.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Madhurjya Saikia</p>
      </footer>

      <FilmChat />
    </div>
  );
}
