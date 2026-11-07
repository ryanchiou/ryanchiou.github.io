import type { CaseStudy } from "@/app/components/project/types";

// Single-Input 8-Legged Robot. See robotArm.tsx for how sections are filled in.
export const walker: CaseStudy = {
  slug: "8-legged-robot",
  tile: "guccibot",
  skills: ["CAD", "Mechanisms"],
  sections: [
    {
      title: "Overview",
      subsections: [{ title: "Background" }, { title: "Problem" }],
    },
    {
      title: "Design Approach",
      subsections: [
        { title: "Design Criteria" },
        { title: "Concept Ideation" },
        { title: "Linkage Synthesis" },
        { title: "Payload Mechanism" },
        { title: "Drivetrain" },
        { title: "Kinematics" },
        { title: "Dynamic Force Analysis" },
      ],
    },
    { title: "Manufacturing" },
    { title: "Testing & Validation" },
  ],
};
