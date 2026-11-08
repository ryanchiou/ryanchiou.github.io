import type { CaseStudy } from "@/app/components/project/types";
import { Bullets, Figure, P, Stats, Table } from "@/app/components/project/blocks";
import cad from "@/assets/projects/undertray/cad.webp";
import cfd from "@/assets/projects/undertray/cfd.webp";
import jig from "@/assets/projects/undertray/jig.webp";

// Carbon Fiber Undertray (Illini Electric Motorsports aero, 2023–24 season).
// Source: the ME 199 FSAE final report, section 1. See robotArm.tsx for how
// sections are filled in.
export const undertray: CaseStudy = {
  slug: "carbon-fiber-undertray",
  tile: "undertray",
  skills: ["CAD", "CFD", "Carbon Fiber Layups"],
  facts: [
    { label: "Role", value: "Aerodynamics: undertray, mounting jigs" },
    { label: "Team", value: "Illini Electric Motorsports" },
    { label: "Season", value: "2023–24" },
    { label: "Tools", value: "Creo, STAR-CCM+" },
  ],
  sections: [
    {
      title: "Overview",
      body: (
        <Stats
          items={[
            { value: "+28.8%", label: "Undertray downforce" },
            { value: "−11.9%", label: "Undertray weight" },
            { value: "+3.77", label: "Estimated competition points" },
            { value: "±0.015 in.", label: "Rear wing mounting repeatability" },
          ]}
        />
      ),
      subsections: [
        {
          title: "Background",
          body: (
            <>
              <P>
                On a Formula SAE car, aerodynamics sets both straight-line and cornering speed. On Illini
                Electric Motorsports' aero subsystem I spent most of my time optimizing the undertray's
                venturis and diffuser, the parts of the floor that accelerate air under the car to
                generate downforce, from CAD and CFD through carbon fiber manufacturing.
              </P>
              <Figure
                src={cad}
                alt="Undertray CAD model with the chassis shown transparent"
                caption="Undertray CAD in Creo, with the chassis shown transparent."
                aspect="16 / 7"
                scale={92}
              />
            </>
          ),
        },
        {
          title: "Design Goals",
          body: (
            <>
              <P>
                The aero sub-team's 2023–24 goals were a more predictable, stable car and a more efficient
                manufacturing process. For the undertray that meant:
              </P>
              <Bullets
                items={[
                  "More downforce from the venturi and diffuser geometry, at little drag cost.",
                  "Less component weight.",
                  "A body that integrates cleanly with the season's new vehicle architecture.",
                ]}
              />
            </>
          ),
        },
      ],
    },
    {
      title: "Design Approach",
      subsections: [
        {
          title: "CFD Workflow",
          body: (
            <>
              <P>
                I modeled the venturis and diffuser in Creo Parametric and simulated them in STAR-CCM+. The
                team's Java macros automate the full run, from meshing to post-processing, while exposing
                the input parameters, and report downforce, drag, center of pressure and the aerodynamic
                coefficients that drive design decisions and car-behavior sensitivity studies.
              </P>
              <P>
                Two choices kept the runs cheap enough to iterate locally: variable cell-size meshes,
                fine only where the flow needs it, and part-level macros that simulate one component
                instead of the whole car. Running sweeps on my own machine saved a lot of time across
                undertray iterations.
              </P>
              <Figure
                src={cfd}
                alt="CFD velocity magnitude contour on a longitudinal plane through the car"
                caption="Velocity magnitude on the y = −20 mm plane from one venturi sweep (0 to over 20.6 m/s)."
                aspect="912 / 453"
                natural
              />
            </>
          ),
        },
        {
          title: "Venturi Sweep",
          body: (
            <>
              <P>
                To find the best venturi, I swept one parameter at a time around the baseline (17.5 in.
                long, 14°): length from 11.5 to 21.5 in. at 14°, then angle from 14° to 20° at 17.5 in.
              </P>
              <Table
                numeric
                head={["Run", "Length (in.)", "Angle (°)", "Car DF (lbf)", "Car drag (lbf)", "Diffuser DF (lbf)", "Diffuser drag (lbf)", "CL", "CD"]}
                rows={[
                  ["Baseline", "17.50", "14", "124.1", "50.87", "32.83", "3.155", "3.809", "1.561"],
                  ["1", "21.50", "14", "119.3", "50.65", "27.30", "2.818", "3.659", "1.554"],
                  ["2", "19.50", "14", "119.0", "50.64", "27.53", "2.826", "3.651", "1.554"],
                  ["3", "15.50", "14", "121.4", "50.66", "28.93", "2.857", "3.725", "1.554"],
                  ["4", "13.50", "14", "119.3", "50.60", "28.41", "2.785", "3.661", "1.552"],
                  ["5", "11.50", "14", "119.7", "50.75", "28.62", "2.794", "3.673", "1.557"],
                  ["6", "17.50", "20", "121.2", "50.80", "29.59", "3.199", "3.718", "1.559"],
                  ["7", "17.50", "18", "120.0", "50.67", "28.62", "3.022", "3.681", "1.554"],
                  ["8", "17.50", "16", "119.3", "50.65", "27.80", "2.911", "3.660", "1.554"],
                ]}
                highlight={[0]}
                caption="Venturi parameter sweep. DF: downforce."
              />
              <P>
                The baseline sat at the optimum. Every change, longer or shorter by up to 6 in., or 2–6°
                steeper, cost 2.7–5.1 lbf of total downforce (2–4%) while drag stayed within 0.3 lbf, so
                lift-to-drag fell from 2.44 to 2.35–2.40. The diffuser was the sensitive part: its
                downforce dropped 10–17% in every variant, showing how strongly diffuser performance
                depends on the venturi feeding it. Of the geometries tested, the 17.5 in., 14° baseline
                was the best.
              </P>
            </>
          ),
        },
        {
          title: "Results",
          body: (
            <>
              <P>
                Against the previous undertray, simulated in the same CFD workflow, the optimized design
                scored as follows in the team's points estimate:
              </P>
              <Table
                numeric
                head={["Metric", "Previous", "Optimized", "Change", "Points"]}
                rows={[
                  ["Weight (lb)", "13.4", "11.8", "−11.9%", "+0.78"],
                  ["Downforce (lbf)", "27.7", "35.7", "+28.8%", "+2.93"],
                  ["Drag (lbf)", "2.87", "3.29", "+14.6%", "−0.06"],
                  ["Total", "", "", "", "+3.77"],
                ]}
                highlight={[3]}
              />
              <P>
                The design trades 0.42 lbf of drag for 8.0 lbf of downforce, a 19-to-1 return, while
                weighing less. Across the whole aero package, these changes cut component weight 9.48%.
              </P>
            </>
          ),
        },
      ],
    },
    {
      title: "Manufacturing",
      subsections: [
        {
          title: "Composite Layup",
          body: (
            <P>
              The aero parts are carbon fiber for its strength-to-weight ratio. Polyurethane foam molds,
              CNC-milled to hold CAD geometry, define each airfoil's shape. Prepreg layups with a controlled
              fiber volume fraction keep mechanical properties consistent from part to part. After curing,
              each part is sanded and bonded to correct cure imperfections and smooth the surface, which
              matters to aerodynamic efficiency, then inspected against its design specification.
            </P>
          ),
        },
        {
          title: "Mounting Jig",
          body: (
            <>
              <P>
                Mounting jigs locate each aero component on the car. They matter more than they look: a
                misplaced wing changes the downforce and balance the CFD predicted. I designed the rear
                wing's jig in Creo, capturing the exact curves of the biplane airfoils so the fixture holds
                the wing snugly against a datum, with its degrees of freedom constrained.
              </P>
              <Figure
                src={jig}
                alt="CAD of the plywood rear wing mounting jig with airfoil-shaped cradles"
                caption="Rear wing mounting jig: slotted plywood panels with cradles cut to the biplane airfoil profiles."
                aspect="4 / 3"
                scale={86}
              />
              <P>
                The jig is laser-cut plywood, chosen for precise cuts, speed and low cost, and it slots
                together with little effort.
              </P>
            </>
          ),
        },
      ],
    },
    {
      title: "Testing & Validation",
      body: (
        <>
          <P>
            On-car tests confirmed the rear wing jig places the wing precisely and repeatably, within
            ±0.015 in. Every finished carbon part was inspected against its design specification before
            it went on the car.
          </P>
          <P>
            The undertray's performance case rests on the CFD comparison: +28.8% downforce and −11.9%
            weight against the previous design, worth an estimated +3.77 competition points.
          </P>
        </>
      ),
    },
  ],
};
