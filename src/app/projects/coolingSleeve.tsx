import type { CaseStudy } from "@/app/components/project/types";
import { Bullets, Eq, Figure, FigureGrid, P, Specs, Stats, Table } from "@/app/components/project/blocks";
import render from "@/assets/projects/cooling-sleeve/render.webp";
import helix from "@/assets/projects/cooling-sleeve/helix.webp";
import section from "@/assets/projects/cooling-sleeve/section.webp";
import lattice from "@/assets/projects/cooling-sleeve/lattice.webp";
import aiWorkflow from "@/assets/projects/cooling-sleeve/ai-workflow.webp";
import prototype from "@/assets/projects/cooling-sleeve/prototype.webp";
import buildPlate from "@/assets/projects/cooling-sleeve/build-plate.webp";

// Actuator Cooling Sleeve. Source: the Project 1 slides (P1_Chiou.pdf). See
// robotArm.tsx for how sections are filled in.
export const coolingSleeve: CaseStudy = {
  slug: "actuator-cooling-sleeve",
  tile: "cooling-sleeve",
  skills: ["DMLS", "AI Workflow"],
  facts: [
    { label: "Role", value: "Solo design project" },
    { label: "Process", value: "DMLS, AlSi10Mg" },
    { label: "Prototype", value: "FDM, PLA" },
    { label: "Tools", value: "Fusion 360, Claude Code, Codex" },
  ],
  sections: [
    {
      title: "Overview",
      body: (
        <>
          <Stats
            items={[
              { value: "4×", label: "Heat dissipation vs. a helical sleeve (est.)" },
              { value: "−30%", label: "Weight" },
              { value: "1.2 mm", label: "Nominal wall thickness" },
              { value: "$159", label: "In-house unit cost at 100 parts" },
            ]}
          />
          <P>
            Actuator cooling sleeves wrap a motor and carry coolant past its housing. Conventional
            sleeves route that coolant through a helical channel, because a helix is what machining and
            casting can make. I redesigned the sleeve around a gyroid lattice that only additive
            manufacturing can build, modeled it parametrically with AI agents driving the CAD, and costed
            it for metal production.
          </P>
          <Figure
            src={render}
            alt="Render of the black cooling sleeve mounted on an actuator face, with two coolant nozzles"
            caption="The redesigned sleeve on an actuator."
            aspect="948 / 856"
            fill
          />
        </>
      ),
    },
    {
      title: "Design Approach",
      subsections: [
        {
          title: "Concept Ideation",
          body: (
            <>
              <P>
                In the existing product the sleeve sits in direct contact with the motor to pull heat
                out of it. Coolant enters at one nozzle, loops through a helical channel and leaves at the
                other. The sleeves are CNC-machined or cast from aluminum alloy, cost roughly $50–500 a
                unit, and serve customers across robotics and automotive.
              </P>
              <FigureGrid
                items={[
                  { src: helix, alt: "Conventional cooling sleeve with a helical channel and brass fittings" },
                  { src: section, alt: "Section view of the redesigned sleeve showing the lattice-filled channel" },
                ]}
                fill
                caption="A conventional helical sleeve (left) and the redesign in section, its channel filled with lattice (right)."
              />
              <P>Additive manufacturing earns its cost here in four ways:</P>
              <Bullets
                items={[
                  "Performance: a gyroid-filled channel can't be machined or cast.",
                  "Weight: 1.2 mm nominal walls cut mass 30%.",
                  "Fit: one parametric model resizes to many actuators.",
                  "Volume: no tooling, so low-volume runs stay affordable.",
                ]}
              />
              <P>
                The target is humanoid robots, where actuator heat is a known bottleneck: a motor's
                continuous torque is limited by how fast its heat can be carried away.
              </P>
            </>
          ),
        },
        {
          title: "Heat Transfer Analysis",
          body: (
            <>
              <P>The sleeve's job is convection, from channel walls into coolant:</P>
              <Eq where="h the convection coefficient, A the wetted area, ΔT the wall-to-coolant temperature difference.">
                <i>Q</i> = <i>h</i> · <i>A</i> · Δ<i>T</i>
              </Eq>
              <P>
                A helical channel offers only its walls as wetted area, and its flow settles into a
                developed boundary layer that insulates the wall. Filling the channel with a gyroid raises
                both terms: thin lattice walls multiply <i>A</i>, and passages that turn continuously in
                three dimensions keep breaking up the thermal boundary layer, raising <i>h</i>. The design
                estimate is four times the heat dissipation of a helical sleeve. The thinner 1.2 mm wall
                also shortens the conduction path from motor to coolant, whose resistance scales as
                <i> t</i>/<i>kA</i>.
              </P>
              <P>
                The lattice is generated as an implicit field. Walls sit at a set distance from the gyroid
                surface, using the field's first-order distance estimate |<i>g</i>|/|∇<i>g</i>| over a
                12 × 8 × 8 mm cell:
              </P>
              <Eq
                where={
                  <>
                    <i>g</i> is the gyroid field and <i>g</i>
                    <sub>x</sub>, <i>g</i>
                    <sub>y</sub>, <i>g</i>
                    <sub>z</sub> its partial derivatives. Thresholding <i>d</i> instead of <i>g</i> keeps
                    wall thickness uniform where the surface curves sharply.
                  </>
                }
              >
                <i>d</i> = |<i>g</i>| / (2π √((<i>g</i>
                <sub>x</sub>/12)<sup>2</sup> + (<i>g</i>
                <sub>y</sub>/8)<sup>2</sup> + (<i>g</i>
                <sub>z</sub>/8)<sup>2</sup>))
              </Eq>
              <Figure
                src={lattice}
                alt="Gyroid lattice ring generated for the coolant channel"
                caption="The gyroid lattice body generated for the coolant channel."
                aspect="427 / 359"
                fill
              />
            </>
          ),
        },
        {
          title: "Design for Additive Manufacturing",
          body: (
            <>
              <P>
                The production process is direct metal laser sintering (DMLS) in AlSi10Mg, an aluminum
                alloy chosen for strength and thermal conductivity, since the sleeve is a heat exchanger
                first.
              </P>
              <P>
                It builds with the underside face down and the nozzles pointing up in Z. The flat underside
                anchors the part to the plate, the nozzles grow as vertical cylinders without overhangs,
                and the gyroid's walls are self-supporting, so no support material ends up trapped in the
                coolant channel where it couldn't be removed.
              </P>
              <P>
                The CAD is fully parametric: every constrained dimension is driven from a parameter table.
                Revolved sketches build the sleeve shell, the coolant cavity and the lattice region, and
                datum planes place the bosses, nozzles and gusseted mounting lugs, so the same model
                resizes to other actuators.
              </P>
              <P>
                To cost production, I compared a vendor quote against running the part in-house on an
                EOS M 290:
              </P>
              <Table
                numeric
                head={["Unit cost", "1 part", "100 parts"]}
                rows={[
                  ["Xometry quote", "$415.29", "$197.12"],
                  ["In-house, EOS M 290", "$318.90", "$159.40"],
                ]}
                highlight={[1]}
              />
              <Table
                head={["In-house, 1 part", "Cost", "Basis"]}
                rows={[
                  ["Material", "$126.60", "Powder bed: 25 × 25 × 5 cm at 1.5 g/cm³ tap density = 4.69 kg"],
                  ["Machine time", "$112.30", "$13.70/h × 8.2 h build"],
                  ["Labor", "$80.00", "$40/h loaded × 2 h"],
                  ["Overhead", "$0", "No post-processing assumed"],
                  ["Total", "$318.90", ""],
                ]}
                highlight={[4]}
              />
              <Eq where="Machine rate: a $700k printer depreciated over 10 years, plus $50k/yr maintenance, spread over every hour of the year.">
                ($70k + $50k) / 8,760 h ≈ $13.70/h
              </Eq>
              <P>
                In-house comes in 23% under the quote for one part and 19% under at 100. Other
                assumptions: AlSi10Mg powder at $90/kg and three parts per plate. The machine rate assumes
                round-the-clock utilization, so it is a best case.
              </P>
              <Figure
                src={buildPlate}
                alt="Three cooling sleeves nested on a 250 by 250 mm build plate"
                caption="Three sleeves nested on the EOS M 290's 250 × 250 mm build plate, nozzles up."
                aspect="16 / 9"
                scale={92}
              />
            </>
          ),
        },
      ],
    },
    {
      title: "AI Workflow",
      body: (
        <>
          <P>
            I drove Fusion 360 through an MCP server from two coding agents, Claude Code and Codex, and
            prompted both with specific design boundaries rather than open-ended requests.
          </P>
          <Specs
            rows={[
              ["Claude Code, Opus 5.5 (max)", "Three complete model iterations in under 20 minutes"],
              ["Codex, GPT-6.1 Sol (extra high)", "Lower-fidelity designs"],
            ]}
          />
          <Figure
            src={aiWorkflow}
            alt="Fusion 360 with the cooling sleeve model beside a terminal running a coding agent"
            caption="Fusion 360 (left) driven over MCP from a coding agent (right)."
            aspect="654 / 355"
            natural
          />
        </>
      ),
    },
    {
      title: "Prototyping",
      body: (
        <>
          <P>A full-scale FDM print in PLA served as the form prototype ahead of metal.</P>
          <Figure
            src={prototype}
            alt="Black PLA print of the cooling sleeve standing on its edge"
            caption="The PLA prototype."
            aspect="965 / 872"
            fill
          />
          <Specs
            rows={[
              ["Envelope", "127.5 × 121.06 × 46.40 mm, Ø121.1 mm OD"],
              ["Volume", "1.084 × 10⁵ mm³"],
              ["Material", "PLA filament"],
              ["Printer", "QIDI Q1 Pro, 0.2 mm nozzle"],
              ["Settings", "15% gyroid infill, mouse-ear brim"],
              ["Build time", "9 h 15 min"],
            ]}
          />
        </>
      ),
    },
  ],
};
