import type { ComponentType } from "react";
import type { MouseEvent } from "react";
import EmailIcon from "@mui/icons-material/Email";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import resumePdf from "@/assets/Ryan_Chiou_Resume.pdf";

type NavItem = {
  label: string;
  href: string;
  // Whether the destination exists yet (drives the built-in styling).
  active: boolean;
  // External links open in a new tab and bypass the in-page router — used for
  // the resume, which is just the PDF, not a page on the site.
  external?: boolean;
};

// Projects is a section of the home page, so it stays an anchor on "/"; About is
// its own route (still a placeholder); Resume points straight at the PDF.
export const navItems: NavItem[] = [
  { label: "Projects", href: "/#projects", active: true },
  { label: "About", href: "/about", active: false },
  { label: "Resume", href: resumePdf, active: false, external: true },
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

// Smooth-scroll a nav click when its target is already on the page. The global
// CSS keeps scroll-behavior: auto (instant) for high-refresh displays, so we opt
// into smooth here per-click — and fall back to an instant jump when the visitor
// prefers reduced motion.
//
// Returning without preventDefault hands the click back to <Link>, which routes
// it: that covers /about and /resume, and Projects clicked from another page.
//
// The scroll is deliberately not written to the URL. Projects is part of the
// home page, not a destination of its own, so the address stays "/" while the
// href keeps the fragment — which is what makes cmd-click, "copy link address",
// and a no-JS load still land on the section.
export function handleNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
  const [path, hash] = href.split("#");
  if (!hash) return; // a plain route — let Link handle it
  if (path !== window.location.pathname) return; // different page — Link first, then scroll on arrival

  const target = document.getElementById(hash);
  if (!target) return;

  event.preventDefault();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
}
