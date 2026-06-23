import type { ComponentType } from "react";
import type { MouseEvent } from "react";
import EmailIcon from "@mui/icons-material/Email";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";

export const navItems = [
  { label: "Projects", href: "#projects", active: true },
  { label: "About", href: "#about", active: false },
  { label: "Resume", href: "#resume", active: false },
];

type SocialLink = {
  label: string;
  href: string;
  Icon: ComponentType<{ fontSize?: "inherit"; className?: string }>;
};

// Compact social row that sits at the right edge of the navbar.
export const socialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ryannchiou", Icon: LinkedInIcon },
  { label: "X", href: "https://x.com/ryann_chiou", Icon: XIcon },
  { label: "Email", href: "mailto:ryann.chiou@gmail.com", Icon: EmailIcon },
];

// Smooth-scroll in-page nav clicks to their section. The global CSS keeps
// scroll-behavior: auto (instant) for high-refresh displays, so we opt into
// smooth here per-click — and fall back to an instant jump when the visitor
// prefers reduced motion or the target isn't on the page.
export function handleNavClick(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
) {
  if (!href.startsWith("#")) return;

  const target = document.getElementById(href.slice(1));
  if (!target) return; // unknown anchor — let the browser handle it

  event.preventDefault();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  history.pushState(null, "", href);
}
