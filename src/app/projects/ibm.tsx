import type { CaseStudy } from "@/app/components/project/types";

// IBM. See robotArm.tsx for how sections are filled in.
export const ibm: CaseStudy = {
  slug: "ibm",
  tile: "ibm",
  skills: ["CAD", "Python", "SQL"],
  sections: [
    { title: "Overview" },
    { title: "Projects" },
    { title: "Impact" },
  ],
};
