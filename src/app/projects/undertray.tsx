import type { CaseStudy } from "@/app/components/project/types";

// Carbon Fiber Undertray. See robotArm.tsx for how sections are filled in.
export const undertray: CaseStudy = {
  slug: "carbon-fiber-undertray",
  tile: "undertray",
  skills: ["CAD", "CFD", "Carbon Fiber Layups"],
  sections: [
    { title: "Overview" },
    { title: "Design Approach" },
    { title: "Manufacturing" },
    { title: "Testing & Validation" },
  ],
};
