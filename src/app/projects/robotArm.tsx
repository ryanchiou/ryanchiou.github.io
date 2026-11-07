import type { CaseStudy } from "@/app/components/project/types";

// 3D Scanning Robotic Arm. To write a section, give it a `body` built from
// the blocks in components/project/blocks.tsx; until then it shows a
// placeholder. Title, subtitle and hero art come from the gallery tile.
export const robotArm: CaseStudy = {
  slug: "3d-scanning-robotic-arm",
  tile: "scanning-robot",
  skills: ["CAD", "FEA", "Point Cloud Fusion"],
  sections: [
    {
      title: "Overview",
      subsections: [{ title: "Background" }, { title: "Problem" }],
    },
    {
      title: "Design Approach",
      subsections: [
        { title: "Design Criteria" },
        { title: "Reach Optimization Model" },
        { title: "Actuator Trade" },
        { title: "Joint Design" },
        { title: "Arm Segments" },
        { title: "Camera Integration" },
        { title: "Point Cloud Fusion" },
      ],
    },
    { title: "Manufacturing" },
    { title: "Controls" },
    { title: "Testing & Validation" },
  ],
};
