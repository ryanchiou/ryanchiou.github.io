import { normalizePath } from "@/app/router";
import type { CaseStudy } from "@/app/components/project/types";
import { tesla } from "./tesla";
import { robotArm } from "./robotArm";
import { vrCushion } from "./vrCushion";
import { hvbox } from "./hvbox";
import { walker } from "./walker";
import { coolingSleeve } from "./coolingSleeve";
import { tesseract } from "./tesseract";
import { tally } from "./tally";
import { ibm } from "./ibm";
import { undertray } from "./undertray";
import { triggerfish } from "./triggerfish";
import { skins } from "./skins";
import { hydra } from "./hydra";
import { flounder } from "./flounder";

/* ── Project pages ─────────────────────────────────────────────────
   One file per project. Listing one here gives it a page at
   /projects/<slug>, links its gallery tile there, and puts it in the
   "next project" loop at the foot of each page, in this order (the
   gallery's reading order, left to right and top to bottom). */
export const caseStudies: CaseStudy[] = [
  tesla,
  robotArm,
  vrCushion,
  hvbox,
  walker,
  coolingSleeve,
  tesseract,
  tally,
  ibm,
  undertray,
  triggerfish,
  skins,
  hydra,
  flounder,
];

export const caseStudyHref = (study: CaseStudy) => `/projects/${study.slug}`;

/** The page for a gallery tile, if it has one. */
export function caseStudyPath(tileId: string) {
  const study = caseStudies.find((s) => s.tile === tileId);
  return study && caseStudyHref(study);
}

/** The case study a URL path points at, if any. */
export function findCaseStudy(path: string) {
  const match = normalizePath(path).match(/^\/projects\/([^/]+)$/);
  return match ? caseStudies.find((s) => s.slug === match[1]) : undefined;
}
