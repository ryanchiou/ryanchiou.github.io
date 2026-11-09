import type { CaseStudy } from "@/app/components/project/types";

// Custom-Fit Lattice VR Cushion. See robotArm.tsx for how sections are filled in.
export const vrCushion: CaseStudy = {
  slug: "vr-headset-cushion",
  tile: "vr-cushion",
  skills: ["FEA", "Resin 3D Printing", "Product Design"],
  sections: [
    { title: "Overview" },
    { title: "Design Approach" },
    { title: "Manufacturing" },
    { title: "Testing & Validation" },
  ],
};
