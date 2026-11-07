import type { CaseStudy } from "@/app/components/project/types";

// Triggerfish. See robotArm.tsx for how sections are filled in.
export const triggerfish: CaseStudy = {
  slug: "triggerfish",
  tile: "triggerfish",
  skills: ["CAD", "Arduino", "Raspberry Pi"],
  sections: [
    { title: "Overview" },
    { title: "Design Approach" },
    { title: "Manufacturing" },
    { title: "Testing & Validation" },
  ],
};
