import { useEffect, useLayoutEffect, useRef } from "react";
import { savedScrollY, useLocation } from "@/app/router";
import { findCaseStudy } from "@/app/projects";
import { findTile } from "./portfolio/ProjectGallery";
import { ProjectPage } from "./project/ProjectPage";
import { AboutSection, HomeSection, ProjectGallery, ScrollNav } from "./portfolio/index";

// /projects/<slug> shows that project's page; every other path shows the
// home page.
export default function Portfolio() {
  const { path } = useLocation();
  const study = findCaseStudy(path);
  useScrollOnNavigate(path);

  const pageTitle = study && findTile(study.tile)?.title;
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} — Ryan Chiou` : "Ryan Chiou";
  }, [pageTitle]);

  return (
    <div className="bg-paper relative min-h-screen w-full" data-name="Landing">
      <ScrollNav />
      {study ? (
        <ProjectPage key={study.slug} study={study} />
      ) : (
        <div className="relative w-full">
          <HomeSection />
          <ProjectGallery />
          <AboutSection />
        </div>
      )}
    </div>
  );
}

// A client-side page change doesn't move the scroll position on its own, so
// each one lands where the browser would have put it: back/forward returns to
// where that page was left, a URL with an anchor lands on it, anything else
// starts at the top. Runs before paint so the old position never flashes. The
// first render keeps the browser's own scroll restore on reload, unless the
// URL names an anchor (sections mount with this render, so the browser
// couldn't have resolved it on a cold load).
function useScrollOnNavigate(path: string) {
  const firstRender = useRef(true);

  useLayoutEffect(() => {
    const isFirstRender = firstRender.current;
    firstRender.current = false;

    const saved = savedScrollY();
    if (!isFirstRender && saved !== undefined) {
      window.scrollTo(0, saved);
      return;
    }

    const hash = decodeURIComponent(window.location.hash.slice(1));
    const target = hash && document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ block: "start" });
      return;
    }

    if (!isFirstRender) window.scrollTo(0, 0);
  }, [path]);
}
