import type { CaseStudy } from "@/app/components/project/types";

// Tesseract. See robotArm.tsx for how sections are filled in.
export const tesseract: CaseStudy = {
  slug: "tesseract",
  tile: "tesseract",
  skills: ["Computer Hardware"],
  sections: [
    { title: "Overview" },
    { title: "Design Approach" },
    { title: "Build" },
    { title: "Testing & Validation" },
  ],
};
