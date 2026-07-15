import { useEffect, useRef, useState } from "react";
import { Link } from "@/app/router";
import { navItems, handleNavClick } from "./navConfig";

// The single, fixed navbar: it rests at the top of the page and fades back in
// the moment the visitor scrolls up (or returns to the top). Scrolling down past
// its own height hides it instantly — the fade transition is only attached while
// the bar is visible, so revealing eases in over 300ms while hiding is a cut.
export function ScrollNav() {
  const [visible, setVisible] = useState(true);
  const barRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
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

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden={!visible}
      className={`fixed inset-x-0 top-0 z-50 transform-gpu bg-black/70 backdrop-blur-md [backface-visibility:hidden] ${
        visible
          ? "opacity-100 transition-opacity duration-300 ease-out"
          : "pointer-events-none opacity-0"
      }`}
    >
      {/* Constrain to the same max width as the page so the links line up with
          the hero's nav axis on wide screens. */}
      <div className="mx-auto max-w-[1512px]">
        <nav className="flex flex-wrap items-center gap-x-12 gap-y-2 px-[8%] py-[18px] sm:px-[10%] lg:px-[12%]">
          {navItems.map(({ label, href, active }) => (
            <Link
              key={label}
              to={href}
              onClick={(event) => handleNavClick(event, href)}
              aria-current={active ? "page" : undefined}
              tabIndex={visible ? undefined : -1}
              className={`font-roboto font-medium text-[14px] tracking-wide transition duration-150 ${
                active ? "text-accent-blue hover:text-[#ADD4FF]" : "text-white hover:opacity-70"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
