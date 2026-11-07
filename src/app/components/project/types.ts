import type { ReactNode } from "react";

/** A block of the write-up. Leave `body` out and the page shows a
    "write-up in progress" placeholder in its place. */
export type Subsection = {
  title: string;
  /** Anchor id. Defaults to the title in kebab-case ("Testing & Validation" → "testing-validation"). */
  id?: string;
  /** The content, built from the blocks in blocks.tsx (P, Figure, Specs, Bullets). */
  body?: ReactNode;
};

/** A top-level section. Its subsections show indented, and collapsible, in the side nav. */
export type Section = Subsection & {
  subsections?: Subsection[];
};

export type CaseStudy = {
  /** URL: /projects/<slug> */
  slug: string;
  /** The gallery tile's id. The page takes its title, subtitle and art from it. */
  tile: string;
  /** Skills, shown as chips under the title. */
  skills?: string[];
  /** Label/value columns under the title, e.g. Role, Timeline, Team. */
  facts?: { label: string; value: string }[];
  /** Hero tweaks. `src`/`alt` swap in different art from the tile's; `scale`
      sizes the art as a % of the panel (default 78). */
  hero?: { src?: string; alt?: string; scale?: number };
  sections: Section[];
};

/** "Testing & Validation" → "testing-validation" */
export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const sectionId = (s: Subsection) => s.id ?? slugify(s.title);
