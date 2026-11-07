import type { CaseStudy } from "@/app/components/project/types";

// Tesla. See robotArm.tsx for how sections are filled in.
export const tesla: CaseStudy = {
  slug: "tesla",
  tile: "tesla",
  skills: ["DFM", "DFA", "Moldflow", "GD&T"],
  sections: [
    { title: "Overview" },
    { title: "Projects" },
    { title: "Impact" },
  ],
};
