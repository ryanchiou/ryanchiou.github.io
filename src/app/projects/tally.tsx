import type { CaseStudy } from "@/app/components/project/types";

// Tally. See robotArm.tsx for how sections are filled in.
export const tally: CaseStudy = {
  slug: "tally",
  tile: "tly",
  skills: ["Product Design", "Vibe-Coding"],
  sections: [
    { title: "Overview" },
    { title: "Design" },
    { title: "Build" },
    { title: "Results" },
  ],
};
