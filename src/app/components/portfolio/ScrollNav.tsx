import { useEffect, useRef, useState } from "react";
import { navItems, socialLinks, handleNavClick, homeAnchor } from "./navConfig";
import { column } from "./layout";
import { normalizePath, useLocation } from "@/app/router";

// The section that counts as "current" once its top passes this fraction of the
// viewport height.
const SPY_LINE = 1 / 3;

// Only in-page links have a section to track (the resume opens a PDF).
const sectionHrefs = navItems.map(({ href }) => href).filter((href) => href.startsWith("#"));

// The last nav section whose top has passed the spy line. Before any has, the
// first link stays highlighted. The last section is too short for its top to
// ever reach the line, so at the bottom of the page it wins.
const currentHref = () => {
  const line = window.innerHeight * SPY_LINE;
  const root = document.documentElement;
  const atBottom = window.scrollY > 0 && window.innerHeight + window.scrollY >= root.scrollHeight - 2;
  let current = sectionHrefs[0];
  for (const href of sectionHrefs) {
    const section = document.getElementById(href.slice(1));
    if (section && (atBottom || section.getBoundingClientRect().top <= line)) current = href;
  }
  return current;
};

// The single, fixed navbar: it rests at the top of the page and fades back in
// the moment the visitor scrolls up (or returns to the top). Scrolling down past
// its own height hides it instantly — the fade transition is only attached while
// the bar is visible, so revealing eases in over 300ms while hiding is a cut.
//
// Layout: name in the left corner, page links centered, socials in the right
// corner. Links are muted, turn blue on hover, and the current section's link
// stays blue. On a project page the links lead back to the home page's
// sections, and Projects stays blue.
export function ScrollNav() {
  const onHome = normalizePath(useLocation().path) === "/";
  const [visible, setVisible] = useState(true);
  const [activeHref, setActiveHref] = useState(sectionHrefs[0]);
  const barRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (onHome) setActiveHref(currentHref());

        const y = window.scrollY;
        const height = barRef.current?.offsetHeight ?? 0;
        const delta = y - lastY.current;
        // Ignore sub-pixel jitter so the bar doesn't flicker.
        if (Math.abs(delta) < 4) return;

        const atTop = y <= height;
        const scrollingUp = delta < 0;
        setVisible(atTop || scrollingUp);
        lastY.current = y;
      });
    };

    setActiveHref(onHome ? currentHref() : "#projects");
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [onHome]);

  const linkClass = "font-sans font-normal text-[14px] transition-colors duration-200 3xl:text-[16px]";

  return (
    <div
      ref={barRef}
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-0 z-50 transform-gpu bg-paper/90 backdrop-blur-md [backface-visibility:hidden] ${
        visible
          ? "opacity-100 transition-opacity duration-300 ease-out"
          : "pointer-events-none opacity-0"
      }`}
    >
      {/* Same column as the page, so the name and socials line up with the
          hero text and the gallery's edges. On phones (no socials) it's just
          the name on the left and the links on the right, so the row fits
          even a 320px screen. */}
      <nav
        className={`${column} flex items-center justify-between gap-x-4 py-[18px] sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-x-6`}
      >
        <a
          href={homeAnchor("#home", onHome)}
          onClick={(event) => handleNavClick(event, homeAnchor("#home", onHome))}
          tabIndex={visible ? undefined : -1}
          className={`${linkClass} justify-self-start whitespace-nowrap text-ink hover:text-accent-blue`}
        >
          Ryan Chiou
        </a>

        <div className="flex items-center gap-x-4 min-[360px]:gap-x-6 sm:gap-x-10">
          {navItems.map(({ label, href }) => {
            const active = href === activeHref;
            const inPage = href.startsWith("#");
            const to = inPage ? homeAnchor(href, onHome) : href;
            return (
              <a
                key={label}
                href={to}
                onClick={(event) => handleNavClick(event, to)}
                target={inPage ? undefined : "_blank"}
                rel={inPage ? undefined : "noreferrer"}
                aria-current={active ? "page" : undefined}
                tabIndex={visible ? undefined : -1}
                className={`${linkClass} ${active ? "text-accent-blue" : "text-meta hover:text-accent-blue"}`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Socials in the right corner, muted like the page links. Hidden on
            phones, where the name and links already fill the row. */}
        <div className="hidden items-center gap-x-4 justify-self-end sm:flex">
          {socialLinks.map(({ label, href, Icon }) => {
            const external = href.startsWith("http");
            return (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                tabIndex={visible ? undefined : -1}
                className="flex text-[18px] text-meta transition-colors duration-200 hover:text-accent-blue 3xl:text-[20px]"
              >
                <Icon fontSize="inherit" />
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
