import type { CaseStudy } from "@/app/components/project/types";

// HV System Enclosure. See robotArm.tsx for how sections are filled in.
export const hvbox: CaseStudy = {
  slug: "hv-system-enclosure",
  tile: "hvbox",
  skills: ["CAD", "Electronics Packaging"],
  // The enclosure rests assembled, small, and explodes on hover; give it room.
  hero: { scale: 92 },
  sections: [
    {
      title: "Overview",
      subsections: [{ title: "Background" }, { title: "System Trade" }],
    },
    {
      title: "Design Approach",
      subsections: [
        { title: "Design Criteria" },
        { title: "Components" },
        { title: "Enclosure" },
        { title: "Thermal Validation" },
      ],
    },
    { title: "Manufacturing" },
    { title: "Testing & Validation" },
  ],
};
