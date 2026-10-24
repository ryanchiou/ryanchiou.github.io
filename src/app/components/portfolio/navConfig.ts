import type { ComponentType } from "react";
import type { MouseEvent } from "react";
import EmailIcon from "@mui/icons-material/Email";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";

// In page order. "#" links scroll to their section and ScrollNav highlights the
// one in view; any other href opens in a new tab. The resume is served from
// public/Ryan_Chiou_Resume.pdf.
export const navItems = [
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Resume", href: "/Ryan_Chiou_Resume.pdf" },
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
