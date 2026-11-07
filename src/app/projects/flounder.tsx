import type { CaseStudy } from "@/app/components/project/types";

// Flounder. See robotArm.tsx for how sections are filled in.
export const flounder: CaseStudy = {
  slug: "flounder",
  tile: "flounder",
  skills: ["Resin 3D Printing", "Raspberry Pi"],
  sections: [
    { title: "Overview" },
    { title: "Design Approach" },
    { title: "Manufacturing" },
    { title: "Testing & Validation" },
  ],
};
