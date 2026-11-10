import type { CaseStudy } from "@/app/components/project/types";
import { Bullets, Eq, Figure, FigureGrid, P, Specs, Stats, Table } from "@/app/components/project/blocks";
import stackup from "@/assets/projects/hvbox/stackup.webp";
import enclosureV1 from "@/assets/projects/hvbox/enclosure-v1.webp";
import wallFlat from "@/assets/projects/hvbox/wall-flat.webp";
import lidFlat from "@/assets/projects/hvbox/lid-flat.webp";
import exploded from "@/assets/projects/hvbox/exploded.webp";
import assembled from "@/assets/projects/hvbox/assembled.webp";
import internals from "@/assets/projects/hvbox/internals.webp";

// HV System Enclosure (Illini Electric Motorsports, FSAE Electric). Source:
// the ME 199 FSAE final report, section 2. See robotArm.tsx for how sections
// are filled in.
export const hvbox: CaseStudy = {
  slug: "hv-system-enclosure",
  tile: "hvbox",
  skills: ["CAD", "Electronics Packaging"],
  facts: [
    { label: "Role", value: "HV integration, enclosure lead" },
    { label: "Team", value: "Illini Electric Motorsports" },
    { label: "Competition", value: "Formula SAE Electric" },
    { label: "Tools", value: "Creo, MATLAB, Excel" },
  ],
  // The enclosure rests assembled, small, and explodes on hover; give it room.
  hero: { scale: 92 },
  sections: [
    {
      title: "Overview",
      body: (
        <>
          <Stats
            items={[
              { value: "−12%", label: "Enclosure mass-to-volume ratio" },
              { value: "< 30 s", label: "Target to remove e-meter or MSD" },
              { value: "3.45 s", label: "HV discharge to 60 V" },
              { value: "41.6 °C", label: "Peak busbar temperature" },
            ]}
          />
          <P>
            The HV box packages the electronics that monitor and safely manage an electric race car's
            tractive system: discharge circuit, energy meter, current sensor and service disconnect, all
            in one sealed aluminum enclosure. I led its design from component stack-up through
            manufacturing.
          </P>
        </>
      ),
      subsections: [
        {
          title: "Background",
          body: (
            <P>
              Illini Electric Motorsports is UIUC's Formula SAE Electric team. On the HV integration
              subsystem I led development of the HV electronics box, which houses both high-voltage and
              low-voltage (LV) components, among them the HV discharge circuit and the LV current sensor.
              These components are how the car monitors its powertrain and makes it safe, so the box has
              to pass the rules' electrical inspection as well as fit the car.
            </P>
          ),
        },
        {
          title: "System Trade",
          body: (
            <>
              <P>Four goals pulled against each other:</P>
              <Bullets
                items={[
                  "Mass vs. volume: a smaller box is lighter, but HV–LV separation and connector access set a floor on its size.",
                  "Thermal headroom vs. compactness: the discharge resistors dump the DC link's energy as heat into a small, closed volume.",
                  "Serviceability vs. sealing: the energy meter and service disconnect must come out quickly, yet the box must stay sealed and insulated.",
                  "Manufacturability: every flange and tab has to cut and bend within the sheet-metal vendor's limits, and the box has to come apart quickly for service (DFMA).",
                ]}
              />
              <P>
                The rules then moved the target mid-design: FSAE changed the energy meter, substantially
                increasing its size, on top of the physical separation already required between HV and LV
                components.
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
          title: "Design Criteria",
          body: (
            <Specs
              rows={[
                ["Primary metric", "Minimize the enclosure's mass-to-volume ratio"],
                ["Serviceability", "Energy meter (e-meter) and manual service disconnect (MSD) out in under 30 s"],
                ["Voltage separation", "HV and LV physically separated per FSAE rules; Nomex and Kapton insulation"],
                ["Discharge", "Rated for full tractive-system voltage and power; approved in the Electrical Systems Form"],
                ["Thermal", "Heat-generating parts below their limits, with a defined path to ambient"],
                ["Manufacturing", "Sheet metal within SendCutSend's bend and flange limits; fast to disassemble"],
              ]}
            />
          ),
        },
        {
          title: "Components",
          body: (
            <>
              <P>
                Stack-up was the main driver of the box's shape, given how much it had to hold: the HV
                board, inverter discharge resistors, energy meter, manual service disconnect, current
                sensor, 2-pin HVDC pole connectors, a 4-pin tractive system measuring point (TSMP)
                connector, a 22-pin LV connector, a heatsink and busbars. I arranged them in Creo against
                three criteria: voltage separation, thermal paths and service access.
              </P>
              <Figure
                src={stackup}
                alt="Top-down CAD view of the HV box component stack-up with wiring"
                caption="Component stack-up at the final design review (FDR)."
                aspect="16 / 10"
                scale={92}
              />
              <P>
                The 8 AWG wire used for tractive connections needs a bend radius the box doesn't have
                room for, so the tightest HV runs use copper busbars instead. I sized them in MATLAB by
                adiabatic temperature rise at the HV current:
              </P>
              <Eq
                where={
                  <>
                    <i>I</i> current, <i>ρ</i>
                    <sub>e</sub> copper resistivity, <i>t</i> duration, <i>ρ</i> density, <i>c</i> specific
                    heat, <i>w</i> × <i>h</i> busbar cross-section.
                  </>
                }
              >
                Δ<i>T</i> = <i>I</i>
                <sup>2</sup>
                <i>ρ</i>
                <sub>e</sub>
                <i>t</i> / (<i>ρ c</i> (<i>w h</i>)<sup>2</sup>)
              </Eq>
              <Table
                numeric
                head={["Busbar", "Mass (kg)", "Power (W)", "Energy (J)", "ΔT (°C)", "Final temp. (°C)"]}
                rows={[
                  ["1", "0.0423", "0.2285", "106.9", "6.56", "41.56"],
                  ["2", "0.0713", "0.3848", "180.1", "6.56", "41.56"],
                  ["3", "0.0504", "0.2722", "127.4", "6.56", "41.56"],
                ]}
              />
              <P>
                Length cancels out of the adiabatic model (heat generated and heat capacity both scale
                with it), so three busbars of one cross-section rise the same 6.6 °C, to 41.6 °C from a
                35 °C ambient. Nomex paper and Kapton tape insulate the busbars, components and wiring.
              </P>
            </>
          ),
        },
        {
          title: "Enclosure",
          body: (
            <>
              <P>
                The enclosure is 5052 aluminum sheet, chosen for its thermal conductivity (the walls are a
                secondary heat path) and strength-to-weight ratio. It is two pieces: a folded wall piece
                and a lid, held together with M3 bolts and nylon-insert locknuts for positive retention
                under vibration.
              </P>
              <Figure
                src={enclosureV1}
                alt="Initial HV box enclosure CAD: an open folded aluminum box"
                caption="Initial enclosure: the folded wall piece with its lid removed."
                aspect="16 / 10"
                scale={84}
              />
              <FigureGrid
                items={[
                  { src: wallFlat, alt: "Flat pattern of the sheet-metal wall piece" },
                  { src: lidFlat, alt: "Flat pattern of the sheet-metal lid piece" },
                ]}
                aspect="16 / 9"
                caption="Flat patterns of the initial wall piece (left) and lid (right)."
              />
              <P>
                After the initial design review (IDR), a DFM pass against SendCutSend's sheet-metal
                constraints fixed flange and bend problems on several of the wall piece's tabs.
                Manufacturing changes then shifted a few components from the FDR layout, as the final
                exploded view shows.
              </P>
              <Figure
                src={exploded}
                alt="Exploded CAD view of the final HV box with all components"
                caption="Final assembly, exploded."
                aspect="1 / 1"
                scale={92}
              />
              <P>
                The final design cut the enclosure's mass-to-volume ratio by 12%, which comes straight off
                the car's weight. Moving the e-meter and MSD interfaces to the car's wet side brought each
                within a 30-second removal target.
              </P>
            </>
          ),
        },
        {
          title: "Thermal Validation",
          body: (
            <>
              <P>
                The discharge resistors are the box's main heat source. I compared two paths for their
                heat with a series thermal-resistance model, computed in Excel:
              </P>
              <Eq
                where={
                  <>
                    <i>T</i>
                    <sub>J</sub> junction temperature, <i>T</i>
                    <sub>A</sub> ambient, <i>Q</i> peak heat load, and the junction-to-case, case-to-sink
                    and sink-to-ambient resistances.
                  </>
                }
              >
                (<i>T</i>
                <sub>J</sub> − <i>T</i>
                <sub>A</sub>) / <i>Q</i> = <i>R</i>
                <sub>JC</sub> + <i>R</i>
                <sub>CS</sub> + <i>R</i>
                <sub>SA</sub>
              </Eq>
              <Table
                numeric
                head={["Heat path", "Thermal resistance (°C/W)", "Discharge temp. (°C)"]}
                rows={[
                  ["Dedicated heatsink", "0.9334", "137.7"],
                  ["Enclosure wall", "1.228", "159.0"],
                ]}
                highlight={[0]}
              />
              <P>
                The dedicated heatsink cuts the path's resistance 24% and the discharge temperature by
                21 °C compared with sinking into the enclosure wall, so the design uses it. (Solving the
                two cases together recovers the heat load: about 72 W, the discharge circuit's peak
                dissipation.)
              </P>
              <P>
                The discharge circuit itself was sized in MATLAB and approved in the team's Electrical
                Systems Form (ESF):
              </P>
              <Specs
                rows={[
                  ["Resistors", "2 × Ohmite TGHMV2K50JE in series, 5 kΩ total"],
                  ["Resistor rating", "600 W continuous, 1,000 W for 15 s, 2,000 V"],
                  ["Peak load", "0.12 A, 72 W"],
                  ["Relay", "Coto 5504-24-1, 3,500 V, 5 A, normally closed"],
                  ["Discharge time to 60 V", "3.45 s"],
                ]}
              />
              <P>
                At the 600 V peak bus voltage the 5 kΩ string draws 0.12 A, so its 72 W peak is under 8%
                of the resistors' 15-second rating. The normally closed relay fails safe: the discharge
                path engages whenever the relay loses power. The bus then decays exponentially through
                the resistors:
              </P>
              <Eq where="R the discharge resistance, C the DC-link capacitance, V₀ the starting bus voltage.">
                <i>t</i> = <i>RC</i> · ln(<i>V</i>
                <sub>0</sub> / 60 V)
              </Eq>
            </>
          ),
        },
      ],
    },
    {
      title: "Manufacturing",
      body: (
        <>
          <P>
            The sheet metal was cut and bent by SendCutSend, with additional waterjet cutting for
            accurate dimensional control. Assembly integrated Nomex and Kapton insulation, the connectors,
            and a rubber gasket that seals the lid.
          </P>
          <FigureGrid
            items={[
              { src: assembled, alt: "Assembled HV box with orange HV connectors and the energy meter" },
              { src: internals, alt: "Inside the HV box: wiring and components wrapped in Kapton and Nomex" },
            ]}
            fill
            caption="The assembled box (left) and its insulated internal stack-up (right)."
          />
        </>
      ),
    },
    {
      title: "Testing & Validation",
      body: (
        <>
          <P>The box was validated by analysis, rules review and fit on the car:</P>
          <Bullets
            items={[
              "Electrical: discharge resistor and relay sizing passed review in the team's approved Electrical Systems Form.",
              "Thermal: worst-case temperatures of 137.7 °C on the heatsink path and 41.6 °C at the busbars, from the models above.",
              "Serviceability: e-meter and MSD reachable from the car's wet side, against a 30-second removal target.",
              "Mass: a 12% lower mass-to-volume ratio for the final enclosure.",
            ]}
          />
        </>
      ),
    },
  ],
};
