import type { CaseStudy } from "@/app/components/project/types";
import { Eq, Figure, FigureGrid, P, Specs, Stats, Table } from "@/app/components/project/blocks";
import pdtFemale from "@/assets/projects/vr-cushion/pdt-female.webp";
import pdtMale from "@/assets/projects/vr-cushion/pdt-male.webp";
import sketch from "@/assets/projects/vr-cushion/sketch.webp";
import mockupSide from "@/assets/projects/vr-cushion/mockup-side.webp";
import mockupFront from "@/assets/projects/vr-cushion/mockup-front.webp";
import mockupCushion from "@/assets/projects/vr-cushion/mockup-cushion.webp";

// Custom-Fit Lattice VR Cushion ("Nimbus"). Source: the Project 2 pitch
// slides (P2-Pitch_Chiou). See robotArm.tsx for how sections are filled in.
export const vrCushion: CaseStudy = {
  slug: "vr-headset-cushion",
  tile: "vr-cushion",
  skills: ["FEA", "Resin 3D Printing", "Product Design"],
  facts: [
    { label: "Role", value: "Solo design project" },
    { label: "Process", value: "3D printing, TPU" },
    { label: "Research", value: "Interviews, 5 user groups" },
  ],
  sections: [
    {
      title: "Overview",
      body: (
        <>
          <Stats
            items={[
              { value: "5", label: "User groups interviewed" },
              { value: "~2M", label: "Owners who use VR 2+ hours a session" },
              { value: "~20K", label: "Initial market: sim racing, fitness, teleoperation" },
              { value: "1 part", label: "Printed in TPU, no foam or cover" },
            ]}
          />
          <P>
            Nimbus is a VR face cushion 3D-printed from a scan of the wearer's face. A one-size foam
            cushion makes long-session users choose between a loose headset and a sore face, and it
            traps sweat. Nimbus replaces it with a single TPU lattice whose contour matches the face, whose
            stiffness is tuned zone by zone to where the face can take pressure, and whose open cells let
            the skin breathe.
          </P>
        </>
      ),
      subsections: [
        {
          title: "Background",
          body: (
            <P>
              A VR headset rests on the face through a foam cushion, held there by strap tension. For a
              quick game that works. For sessions measured in hours, such as a sim-racing stint, a
              fitness workout or a teleoperation shift, the cushion becomes the limit on how long someone
              can keep the headset on.
            </P>
          ),
        },
        {
          title: "User Research",
          body: (
            <>
              <P>
                I interviewed five groups: casual VR users; three groups who wear headsets for long
                sessions (sim racers, fitness VR users and teleoperators); and headphone users, as an
                adjacent case of a cushion worn on the head for hours. Three complaints came up again
                and again:
              </P>
              <Specs
                rows={[
                  ["Fit is a trade-off", "“Too tight, or too loose without support.”"],
                  ["Moisture builds up", "The face becomes sweaty and “sticky.”"],
                  ["Cleaning is a chore", "“I don't even bother.”"],
                ]}
              />
              <P>
                Together they define the user need: long-session VR users need a headset with a secure
                fit that spreads pressure across the face and limits sweat buildup, to stay comfortable
                through multi-hour sessions.
              </P>
            </>
          ),
        },
        {
          title: "Market",
          body: (
            <>
              <Table
                head={["Tier", "Definition", "Size"]}
                rows={[
                  ["TAM", "All active VR headset owners", "~22M"],
                  ["SAM", "Owners who regularly use VR for 2+ hours a session", "~2M"],
                  ["SOM", "Sim racing, fitness and teleoperation VR users", "~20K (1% of SAM)"],
                ]}
                highlight={[2]}
              />
              <P>
                Of roughly 22M active headset owners, the serviceable market is the ~2M who regularly use
                VR for two hours or more a session, the users whose cushions fail first. The initial
                target is three of the interviewed groups, sim racers, fitness users and teleoperators,
                taken as 1% of that market: about 20K users. Each pushes a cushion harder than casual
                play, fitness through sweat and the other two through hours of continuous wear.
              </P>
            </>
          ),
        },
      ],
    },
    {
      title: "Design Approach",
      subsections: [
        {
          title: "Pressure Mapping",
          body: (
            <>
              <P>
                Where the cushion presses matters as much as how hard. Pressure threshold maps of the head
                (PDT: the mean pressure at which contact becomes uncomfortable) show the face is among
                its most sensitive regions, and that is exactly where a VR cushion sits.
              </P>
              {/* TODO: cite the study these PDT maps come from. */}
              <FigureGrid
                items={[
                  { src: pdtFemale, alt: "Pressure threshold map of a female head: lowest around the eyes, nose and cheeks" },
                  { src: pdtMale, alt: "Pressure threshold map of a male head: lowest around the eyes, nose and cheeks" },
                ]}
                aspect="1200 / 742"
                fill
                caption="Mean pressure threshold (PDT) maps for (a) female and (b) male heads, from 54 kPa (red) to 382 kPa (dark blue)."
              />
              <P>
                Around the eyes, along the nose bridge and across the cheeks, thresholds sit at the bottom
                of the 54–382 kPa scale, and lower for women than for men. The forehead tolerates more,
                and the back and crown of the head several times more. A one-size cushion ignores this:
                it contacts each face at its high points, the brow ends and cheekbones, which concentrates
                load where tolerance is lowest.
              </P>
              <P>
                That sets two rules for the design: carry the load on the forehead, and keep it off the
                cheekbones and the nose bridge.
              </P>
            </>
          ),
        },
        {
          title: "Concept",
          body: (
            <>
              <P>
                Nimbus is a face cushion 3D-printed in TPU from a scan of the wearer's face, with pressure
                tuned to each face and breathability built into its structure. Each of the four
                problems from the interviews maps to one feature, and each feature to a capability only
                additive manufacturing makes practical:
              </P>
              <Table
                head={["How might we…", "Feature", "Why additive"]}
                rows={[
                  ["Keep the headset steady with less force?", "Scan-fitted contour", "Customizable: every part is unique, with no tooling"],
                  ["Relieve pressure at sensitive points?", "Lattice graded by zone", "Variable stiffness from one material"],
                  ["Keep skin airy and dry?", "Open-cell lattice", "Complex geometry that can't be molded"],
                  ["Make cleaning easier?", "Single-part plastic", "Part consolidation"],
                ]}
              />
              <Figure
                src={sketch}
                alt="Concept sketches of the lattice cushion on a headset, being swapped in, and on its own"
                caption="Concept sketches: the cushion on a headset, swapping it in, and the graded lattice ring."
                aspect="1448 / 1086"
                natural
              />
            </>
          ),
        },
        {
          title: "Scan-Fitted Contour",
          body: (
            <>
              <P>
                Strap tension is the only fit adjustment on most headsets, which is why interviewees
                described fit as a trade-off. The strap has to hold the headset against slipping, and
                the cushion passes that same force into the face:
              </P>
              <Eq where="F the strap's clamping force, A the cushion's contact area with the face.">
                <i>p̄</i> = <i>F</i> / <i>A</i>
              </Eq>
              <P>
                A one-size cushion touches a face mostly at its high points, so <i>A</i> is small and
                pressure peaks there. Fitting the contour to a facial scan puts the whole band in contact,
                spreading the same <i>F</i> over a larger <i>A</i>. The fitted shape also keys into the
                face's contours, so it resists slipping by geometry rather than by friction alone, and
                the strap needs less tension to begin with.
              </P>
            </>
          ),
        },
        {
          title: "Graded Lattice",
          body: (
            <>
              <P>
                Even pressure isn't enough when the face's tolerance isn't even. With the contour fitted,
                the cushion compresses by about the same amount all around, so the pressure each zone
                passes to the skin scales with that zone's stiffness:
              </P>
              <Eq
                where={
                  <>
                    <i>E</i>* the lattice's effective modulus, <i>δ</i> its compression, <i>t</i> the
                    cushion's thickness.
                  </>
                }
              >
                <i>p</i> ≈ <i>E</i>* · <i>δ</i> / <i>t</i>
              </Eq>
              <P>
                A lattice's stiffness is set by its geometry. For the bending-dominated, open-cell
                lattices used in cushioning, it falls with the square of relative density
                (Gibson–Ashby):
              </P>
              <Eq
                where={
                  <>
                    <i>E</i>
                    <sub>s</sub> the solid TPU's modulus, <i>ρ</i>*/<i>ρ</i>
                    <sub>s</sub> the lattice's relative density, <i>C</i> ≈ 1.
                  </>
                }
              >
                <i>E</i>*/<i>E</i>
                <sub>s</sub> ≈ <i>C</i> (<i>ρ</i>*/<i>ρ</i>
                <sub>s</sub>)<sup>2</sup>
              </Eq>
              <P>
                Halving a zone's relative density cuts its stiffness, and the pressure it passes on, about
                fourfold, all from one material in one print. The pressure map sets the zones: firmer
                lattice across the forehead to carry the headset, softer over the cheekbones and nose
                bridge.
              </P>
            </>
          ),
        },
        {
          title: "Airflow & Cleaning",
          body: (
            <>
              <P>
                The other two complaints, sweat and cleaning, both come from what a standard cushion is:
                foam behind a fabric or leatherette cover. The cover holds moisture against the skin, the
                foam soaks up what gets through, and the layers can't be washed without damaging them.
              </P>
              <P>
                Nimbus answers both with its structure. The open-cell lattice is mostly open space, so air
                reaches the skin and moisture can escape instead of pooling. And because the cushion is
                one printed piece of TPU, with no foam, cover or adhesive, it can be rinsed and wiped down
                like any other plastic part.
              </P>
            </>
          ),
        },
        {
          title: "Form Studies",
          body: (
            <>
              <P>
                Cardboard mockups, with foam standing in for the cushion, gave the concept a physical
                footprint: how large the cushion is, and how it frames the eyes and clears the nose.
              </P>
              <FigureGrid
                items={[
                  { src: mockupSide, alt: "Cardboard headset mockup with a strap, seen from the side" },
                  { src: mockupFront, alt: "Cardboard headset mockup seen from the front" },
                  { src: mockupCushion, alt: "Face side of the cardboard mockup, showing the foam cushion ring" },
                ]}
                aspect="1 / 1"
                fill
                caption="Cardboard mockups: the headset from the side and front, and the cushion's face side."
              />
            </>
          ),
        },
      ],
    },
    { title: "Manufacturing" },
    { title: "Testing & Validation" },
  ],
};
