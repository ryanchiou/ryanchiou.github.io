import { Link } from "@/app/router";

// Placeholder page for any destination that isn't built yet — every project
// tile and the inactive navbar items (About, Resume) route here. A blank black
// screen with the wordmark centered in the site's display face (Roboto
// Condensed), plus a discreet way back so the visitor is never stranded.
export function ComingSoon() {
  return (
    <div className="relative flex min-h-screen w-full cursor-auto items-center justify-center bg-panel px-6">
      {/* The wrapper's height is the heading alone, so the outer flex centers
          the heading on the exact midpoint of the page. The link is pulled out
          of the flow (absolute, top-full) to hang below without shifting it. */}
      <div className="relative flex flex-col items-center">
        <h1 className="font-display text-[clamp(21px,3vw,36px)] font-bold leading-none tracking-tight text-white">
          Coming Soon
        </h1>

        <Link
          to="/"
          className="absolute left-1/2 top-full mt-8 -translate-x-1/2 whitespace-nowrap font-mono text-[13px] uppercase tracking-[0.18em] text-meta transition-opacity duration-150 hover:opacity-60"
        >
          ← Back
        </Link>
      </div>
    </div>
  );
}
