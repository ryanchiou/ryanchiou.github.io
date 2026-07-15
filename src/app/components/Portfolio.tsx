import { useEffect, useRef } from "react";
import { useLocation } from "@/app/router";
import { ComingSoon, HomeSection, ProjectGallery, ScrollNav } from "./portfolio/index";

// The only paths backed by real content. Everything else — every project tile
// (/tesla, /guccibot, …) and the unbuilt navbar pages (/about, /resume) — falls
// through to the Coming Soon screen, which doubles as the 404.
const CONTENT_PATHS = new Set(["/"]);

function hasContent(path: string) {
  // Tolerate a trailing slash so /about/ and /about resolve alike.
  const normalized = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return CONTENT_PATHS.has(normalized || "/");
}

export default function Portfolio() {
  const { path } = useLocation();
  const showComingSoon = !hasContent(path);
  const firstRender = useRef(true);

  // A client-side route change doesn't move the scroll position on its own, so
  // each navigation lands where the browser would have put it: at the anchor if
  // the URL names one, otherwise at the top. The first render is left alone so
  // the browser can restore scroll on reload.
  useEffect(() => {
    const isFirstRender = firstRender.current;
    firstRender.current = false;

    if (showComingSoon) {
      window.scrollTo(0, 0);
      return;
    }

    const { hash } = window.location;
    if (hash) {
      // Sections mount with this render, so the browser couldn't have resolved
      // the anchor itself on a cold load — do it here.
      document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
      return;
    }

    if (!isFirstRender) window.scrollTo(0, 0);
  }, [path, showComingSoon]);

  if (showComingSoon) return <ComingSoon />;

  return (
    <div className="bg-frame relative min-h-screen w-full cursor-auto" data-name="Landing">
      <ScrollNav />
      <div className="relative mx-auto w-full max-w-[1512px]">
        <HomeSection />
        <ProjectGallery />
      </div>
    </div>
  );
}
