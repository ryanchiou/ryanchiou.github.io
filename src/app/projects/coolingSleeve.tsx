import type { CaseStudy } from "@/app/components/project/types";

// Actuator Cooling Sleeve. See robotArm.tsx for how sections are filled in.
export const coolingSleeve: CaseStudy = {
  slug: "actuator-cooling-sleeve",
  tile: "cooling-sleeve",
  skills: ["DMLS", "AI Workflow"],
  sections: [
    { title: "Overview" },
    {
      title: "Design Approach",
      subsections: [
        { title: "Concept Ideation" },
        { title: "Heat Transfer Analysis" },
        { title: "Design for Additive Manufacturing" },
      ],
    },
    { title: "AI Workflow" },
    { title: "Prototyping" },
  ],
};
