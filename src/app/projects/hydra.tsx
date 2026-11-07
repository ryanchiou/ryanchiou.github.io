import type { CaseStudy } from "@/app/components/project/types";

// Project Hydra. See robotArm.tsx for how sections are filled in.
export const hydra: CaseStudy = {
  slug: "project-hydra",
  tile: "hydra",
  skills: ["Computer Hardware", "Liquid Cooling"],
  sections: [
    { title: "Overview" },
    { title: "Design Approach" },
    { title: "Build" },
    { title: "Testing & Validation" },
  ],
};
