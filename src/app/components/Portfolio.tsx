import { useEffect, useState } from "react";
import { ComingSoon, HomeSection, ProjectGallery, ScrollNav } from "./portfolio/index";

// The only hashes that map to real, in-page content. Everything else — every
// project tile (#tesla, #guccibot, …) and the inactive navbar items (#about,
// #resume) — has no page yet, so it falls through to the Coming Soon screen.
const CONTENT_HASHES = new Set(["", "#", "#home", "#projects"]);

function hasContent(hash: string) {
  return CONTENT_HASHES.has(hash);
}

export default function Portfolio() {
  const [hash, setHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash,
  );

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (!hasContent(hash)) {
    return <ComingSoon />;
  }

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
