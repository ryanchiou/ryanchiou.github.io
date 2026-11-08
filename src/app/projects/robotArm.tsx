import type { CaseStudy } from "@/app/components/project/types";
import { Bullets, Eq, Figure, FigureGrid, P, Specs, Stats, Table } from "@/app/components/project/blocks";
import concept from "@/assets/projects/robot-arm/concept.webp";
import workspace from "@/assets/projects/robot-arm/workspace.webp";
import armModel from "@/assets/projects/robot-arm/arm-model.webp";
import jointConcepts from "@/assets/projects/robot-arm/joint-concepts.webp";
import cadWk11 from "@/assets/projects/robot-arm/cad-wk11.webp";
import feaFbd from "@/assets/projects/robot-arm/fea-fbd.webp";
import feaStress from "@/assets/projects/robot-arm/fea-stress.webp";
import feaDeflection from "@/assets/projects/robot-arm/fea-deflection.webp";
import topoptSetup from "@/assets/projects/robot-arm/topopt-setup.webp";
import topoptResult from "@/assets/projects/robot-arm/topopt-result.webp";
import cameraMount from "@/assets/projects/robot-arm/camera-mount.webp";
import fov from "@/assets/projects/robot-arm/fov.webp";
import cleat from "@/assets/projects/robot-arm/cleat.webp";
import scanApp from "@/assets/projects/robot-arm/scan-app.webp";
import fusionPipeline from "@/assets/projects/robot-arm/fusion-pipeline.webp";
import poseSetup from "@/assets/projects/robot-arm/pose-setup.webp";
import bunny from "@/assets/projects/robot-arm/bunny.webp";
import crossSection from "@/assets/projects/robot-arm/cross-section.webp";
import waterjet from "@/assets/projects/robot-arm/waterjet.webp";
import prints from "@/assets/projects/robot-arm/prints.webp";
import softwareFlow from "@/assets/projects/robot-arm/software-flow.webp";
import dh from "@/assets/projects/robot-arm/dh.webp";
import ik from "@/assets/projects/robot-arm/ik.webp";
import scanViews from "@/assets/projects/robot-arm/scan-views.webp";
import scanFused from "@/assets/projects/robot-arm/scan-fused.webp";
import turntableTest from "@/assets/projects/robot-arm/turntable-test.webp";

// 3D Scanning Robotic Arm (ME 470 senior design, Fall 2026). Sources: the
// revised proposal report and the weekly update decks. To write a section,
// give it a `body` built from the blocks in components/project/blocks.tsx;
// until then it shows a placeholder. Title, subtitle and hero art come from
// the gallery tile.
export const robotArm: CaseStudy = {
  slug: "3d-scanning-robotic-arm",
  tile: "scanning-robot",
  skills: ["CAD", "FEA", "Point Cloud Fusion"],
  facts: [
    { label: "Role", value: "Arm & camera end-effector design, scan software" },
    { label: "Team", value: "5 engineers, ME 470 senior design" },
    { label: "Sponsor", value: "UIUC IMTS Laboratory" },
    { label: "Timeline", value: "Fall 2026" },
  ],
  sections: [
    {
      title: "Overview",
      body: (
        <>
          <Stats
            items={[
              { value: "≤ 1.0 mm", label: "Pose repeatability target" },
              { value: "< $2,000", label: "Build budget, camera excluded" },
              { value: "≤ 60 s", label: "To scan one side of a part" },
              { value: "0.94 m", label: "Design reach, with safety factor" },
            ]}
          />
          <P>
            A six-axis arm that carries a time-of-flight depth camera around a part, captures a point
            cloud at each viewpoint, and fuses the views into one measured model. The question is how
            close an affordable system can get to commercial robotic scanners.
          </P>
        </>
      ),
      subsections: [
        {
          title: "Background",
          body: (
            <>
              <P>
                A 3D scan records a part's geometry as a point cloud, which can be checked against CAD or
                a tolerance band for inspection. A depth camera only sees the surfaces facing it, so
                measuring a whole part takes views from several angles. Robotic scanning automates this:
                an arm moves the camera through programmed viewpoints and records its pose at each one,
                so the views can be aligned into a single model. That makes the arm's positioning
                repeatability a direct input to scan quality.
              </P>
              <P>
                Commercial systems prove the concept at industrial prices. The ZEISS ScanBox 4105
                measures parts up to 500 mm; Creaform's robot-mounted MetraSCAN-R lists 0.025 mm accuracy
                over a 310 × 350 mm area. Our sponsor, UIUC's Intelligent Manufacturing and Thermal
                Systems Laboratory, wanted to know how much of that capability an affordable system can
                deliver.
              </P>
              <Figure
                src={concept}
                alt="Sketch of the arm holding a camera above a 300 mm cube, with working distance D and horizontal reach R"
                caption="Concept: the arm holds the camera at working distance D over a 300 mm part envelope, at a horizontal reach R ≥ 500 mm."
                aspect="4 / 3"
                scale={88}
              />
            </>
          ),
        },
        {
          title: "Problem",
          body: (
            <>
              <P>
                Build a 6-axis arm for under $2,000 (camera and computer excluded) that scans one side of
                a 10–11 in. part in under a minute with 1 mm repeatability, then fuses the views into one
                model and checks it against caliper and laser-scan references using GD&amp;T.
              </P>
              <P>
                The hard part is reach. A longer arm scans larger parts, but any angular error at a joint
                grows with the distance to the camera:
              </P>
              <Eq
                where={
                  <>
                    At 0.05° of joint error, a 300 mm link moves the camera 0.26 mm; a 600 mm link moves it
                    0.52 mm, half the 1 mm budget from one joint alone.
                  </>
                }
              >
                Δ<i>x</i> ≈ <i>L</i> · Δ<i>θ</i>
              </Eq>
              <P>
                Gravity deflection compounds this in extended poses, where the cantilever moment is
                largest. Every decision below trades workspace against stiffness and joint error, on
                low-cost hardware.
              </P>
            </>
          ),
        },
      ],
    },
    {
      title: "Design Approach",
      body: (
        <P>
          Requirements first; then the shortest links that cover the scan workspace; then actuators,
          joints and structure sized to hold 1 mm at that reach. The scan software was developed in
          parallel against simulated and bench captures.
        </P>
      ),
      subsections: [
        {
          title: "Design Criteria",
          body: (
            <>
              <P>
                We turned the brief into a 24-requirement product design specification. These targets
                drove the design and define the validation tests.
              </P>
              <Table
                head={["Requirement", "Target", "Rationale"]}
                rows={[
                  ["Cost (camera, computer excluded)", "≤ $2,000", "Sponsor budget; drives actuator choice"],
                  ["Pose repeatability", "≤ 1.0 mm", "Matched to the camera's resolution"],
                  ["Scan time, one side", "≤ 60 s", "Practical cycle; limits drift during capture"],
                  ["Horizontal reach", "≥ 500 mm", "Sets the largest scannable part"],
                  ["Payload (camera + mount)", "≥ 0.75 kg", "Helios2+ and end effector"],
                  ["Scan envelope", "300 mm cube, ≥ 85% coverage", "Top and sides of the largest part"],
                  ["Structural factor of safety", "≥ 1.5", "Known loads; printed PLA varies with layers and infill"],
                  ["Scan accuracy", "±1.0 mm vs. calipers", "End-to-end check of the pipeline"],
                  ["Repeatability test", "ISO 9283, 5 poses × 30 cycles", "Standardized, statistically meaningful"],
                ]}
              />
              <P>
                Repeatability was set by the camera, not picked arbitrarily: pose error larger than the
                smallest feature the camera resolves degrades alignment no matter how good the camera
                is. And since structural deflection is itself a positioning error, the safety-factor
                target protects repeatability as well as strength.
              </P>
            </>
          ),
        },
        {
          title: "Reach Optimization Model",
          body: (
            <>
              <P>
                Maximum extension alone doesn't define a useful workspace: the camera has to reach each
                viewpoint at the right orientation and standoff. Following Spudić et al., we discretized
                the target workspace into points and checked whether the arm could reach each one at the
                required camera pose, scoring candidate link ratios by the share of points reachable.
              </P>
              <P>
                The arm is modeled with Denavit–Hartenberg parameters (six revolute joints) with the
                camera as the end effector. A MATLAB optimization swept link ratios against an
                upper-hemisphere workspace of 0.80 m radius, sized from the part envelope plus camera
                standoff. In the model the camera's line of sight counts as part of the final link, so
                the reach includes the standoff to the part.
              </P>
              <FigureGrid
                items={[
                  { src: workspace, alt: "Reachable points sampled across a 0.80 m upper hemisphere" },
                  { src: armModel, alt: "MATLAB arm model posed beside a 300 mm cube with the camera footprint" },
                ]}
                caption="Left: reachable points sampled over the 0.80 m upper-hemisphere target. Right: a candidate arm posed around the 300 mm envelope; the green rectangle is the camera's footprint on the part."
              />
              <P>
                The optimum puts most of the length in the upper arm. With a safety factor applied, the
                design reach is 0.94 m, nearly double the 500 mm minimum, since maximizing reach was the
                project's stretch goal:
              </P>
              <Specs
                rows={[
                  ["Upper arm", "617 mm (65%)"],
                  ["Forearm", "185 mm (20%)"],
                  ["Wrist to camera", "142 mm (15%)"],
                  ["Total reach", "0.94 m, with safety factor"],
                ]}
              />
            </>
          ),
        },
        {
          title: "Actuator Trade",
          body: (
            <>
              <P>
                We first benchmarked open-source arms with 23–25 in. of reach in the $1,000–2,000 range,
                to pick a performance baseline and a reference for the electronics.
              </P>
              <Table
                numeric
                head={["Criterion", "Weight", "AR4", "reBot", "Faze4", "Arctos"]}
                rows={[
                  ["Complexity", "4", "4", "5", "2", "2"],
                  ["Weight distribution", "4", "5", "3", "5", "5"],
                  ["Vendor credibility", "5", "5", "5", "5", "1"],
                  ["Vendor catalog", "4", "5", "3", "5", "5"],
                  ["Specs reported", "3", "5", "5", "1", "3"],
                  ["Weighted total", "", <strong className="font-medium text-ink">96</strong>, "84", "76", "62"],
                ]}
                highlight={[5]}
              />
              <P>
                Faze4 and Arctos rely on custom cycloidal gearboxes and don't report repeatability, and
                Arctos sources its electronics from AliExpress. Of the two left, both rated at 0.2 mm
                repeatability, the AR4 wins on mass distribution: its steppers drive the joints through
                belts, so motor mass sits near the base, while the reBot's joint-mounted servos carry mass
                outboard and raise the torque every inboard joint must hold. The reBot line also only
                offers 3 and 9 N·m servos. We adopted the AR4's Teensy 4.1 controller, drivers and motor
                supplier.
              </P>
              <P>
                Torque is what limits reach, so we then compared actuator sets by worst-case horizontal
                reach at a 1.5 safety factor:
              </P>
              <Table
                head={["Actuators", "Reach", "Motor cost"]}
                rows={[
                  ["Steppers throughout", "35.7 in.", "$557"],
                  ["Steppers + harmonic gearboxes", "37.1 in.", "$2,636"],
                  ["Damiao servos, steppers on J1/J2", "37.1 in.", "$719"],
                  ["CubeMars servos, steppers on J1/J2", "37.1 in.", "$1,402"],
                  ["MyActuator X servos, steppers on J1/J2", "37.4 in.", "$2,095"],
                ]}
                highlight={[2]}
              />
              <P>
                The hybrid puts steppers on the heavily loaded base and shoulder and compact Damiao servos
                on the four outboard joints. It matches the harmonic-gearbox reach at 27% of the cost, and
                buys 1.4 in. over an all-stepper arm for $162. The MyActuator set gains 0.3 in. more but
                would consume the whole budget.
              </P>
            </>
          ),
        },
        {
          title: "Joint Design",
          body: (
            <>
              <P>
                Backlash and compliance in a joint show up directly as Δθ, multiplied by everything
                outboard of it. Three rules followed from that: keep the drive train low-backlash, support
                every shaft rigidly, and sense position as close to the joint output as possible.
              </P>
              <Figure
                src={jointConcepts}
                alt="Joint concept diagrams showing belts, pulleys, tapered roller bearings, a thrust bearing and the camera wrist"
                caption="Joint concepts: belt-driven pivots on opposed tapered roller bearings (left, center), a direct-drive joint (bottom left), and the wrist stack carrying the camera, with a thrust bearing at the roll joint (right)."
                aspect="1800 / 873"
                natural
                inset={16}
              />
              <P>
                Opposed tapered roller bearings carry the combined radial and axial loads at the main
                pivots; a needle-roller thrust bearing takes the axial load at the roll joint. Belts let
                motors sit inboard of the joints they drive, which cuts the arm's moment of inertia and
                the torque its shoulder must hold. Lobed drive profiles cut into the aluminum link plates
                key them to the joint hubs. The assembly is driven from a master sketch, so link lengths
                from the reach model propagate to every part.
              </P>
            </>
          ),
        },
        {
          title: "Arm Segments",
          body: (
            <>
              <P>
                The upper arm is a pair of ¼ in. 6061 aluminum plates tied together by plate supports: a
                deep, light section placed where the bending moment is largest. Printed PLA forms the joint
                housings and base.
              </P>
              <Figure
                src={cadWk11}
                alt="CAD of the arm with twin aluminum link plates and lightening slots"
                caption="Current CAD: twin-plate upper arm with plate supports, added lugs and lightening slots."
                aspect="4 / 3"
                scale={86}
              />
              <P>
                For FEA, each component's weight was lumped at its centroid with the arm horizontal at
                full extension, the worst case for bending:
              </P>
              <Table
                numeric
                head={["Load", "Weight (N)", "Distance from J2 (mm)"]}
                rows={[
                  ["Base (J1, fixed)", "54.4", "−112"],
                  ["Shoulder, W0 (J2)", "45.8", "−12"],
                  ["Upper arm, W1 (J3)", "17.9", "244"],
                  ["Elbow (J4)", "6.3", "614"],
                  ["Forearm, W2 (J4)", "9.3", "682"],
                  ["Wrist, W3 (J5)", "5.2", "810"],
                  ["Camera, Wc (J6)", "7.8", "909"],
                  ["Total", "146.6", ""],
                ]}
              />
              <P>
                The loads outboard of the shoulder sum to a static moment of Σ<i>W</i>·<i>d</i> ≈ 25.9 N·m
                about J2, which is the torque its actuator must hold before any dynamic load. The model
                bonds all contacts, treats bearings as solid rings, models PLA as solid and isotropic with
                a layer knockdown, and fixes the base without bolt preload.
              </P>
              <FigureGrid
                items={[
                  { src: feaFbd, alt: "Free-body diagram of the arm loads" },
                  { src: feaStress, alt: "Von Mises stress plot of the arm" },
                ]}
                caption="Left: free-body diagram of the lumped loads. Right: von Mises stress at full extension."
              />
              <Eq
                where={
                  <>
                    Margin of safety at a design factor of 2.0; negative means the part fails the
                    criterion.
                  </>
                }
              >
                <i>MS</i> = <i>σ</i>
                <sub>y</sub> / (<i>FoS</i> · <i>σ</i>) − 1
              </Eq>
              <Table
                numeric
                head={["Part", "σ, 1g (MPa)", "MS, 1g", "σ, 2g (MPa)", "MS, 2g"]}
                rows={[
                  ["Link plates (6061, σy 275 MPa)", "64.0", "+1.15", "128.0", "+0.07"],
                  ["Plates at joint hubs", "191.3", "−0.28", "382.6", "−0.64"],
                  ["PLA parts (σy 25 MPa)", "3.4", "+2.68", "6.8", "+0.84"],
                  ["Forearm and wrist brackets", "3.0", "+44.83", "", ""],
                ]}
              />
              <P>
                The plates pass even at 2g. The joint hubs don't: stress concentrates where joint torque
                enters the plate, leaving negative margin at 1g. Hub stress is the open item; the current
                iteration adds lugs, with their geometry and count still being tuned. An
                earlier iteration predicted 0.97 mm of static sag at the camera at full extension.
                Gravity sag repeats, so the kinematics can compensate for it, but it shows how little
                stiffness margin there is at this reach.
              </P>
              <Figure
                src={feaDeflection}
                alt="Displacement plot showing 0.968 mm maximum deflection at the camera"
                caption="Earlier iteration: 0.968 mm maximum static deflection, at the camera."
                aspect="1800 / 836"
                natural
              />
              <P>
                Mass at the end of a long arm costs both torque and deflection, so we ran a shape
                optimization on the link plate under its joint loads (4 mm mesh, 75% mass target). It
                kept the load paths around the bearing bores and mounting holes and cleared the
                low-stress spans between them, cutting plate mass 25%, from 0.306 to 0.230 kg. The result
                was translated into slots the waterjet can cut.
              </P>
              <Figure
                src={topoptSetup}
                alt="Topology optimization setup on the link plate with loads and constraints"
                aspect="1632 / 275"
                natural
                inset={12}
              />
              <Figure
                src={topoptResult}
                alt="Topology optimization result on the link plate"
                caption="Link plate shape optimization: loads and keep-out regions (top), and the material the optimizer kept (bottom, red)."
                aspect="1800 / 295"
                natural
                inset={12}
              />
            </>
          ),
        },
        {
          title: "Camera Integration",
          body: (
            <>
              <P>
                The camera sets the ceiling on scan accuracy, so we checked the sponsor-provided Helios2+
                Narrow against four time-of-flight alternatives with a weighted Pugh matrix. Precision and
                accuracy carried the most weight, because camera error adds directly to arm error.
                Working distance and field of view carried the least, because the arm can move the camera.
              </P>
              <Table
                head={["Criterion", "Weight", "Helios2+ Narrow (datum)", "Helios2+", "Helios2 Narrow", "Helios2 Wide", "Femto Bolt", "Gemini 335"]}
                rows={[
                  ["Resolution", "3", "0", "S", "S", "S", "+", "+"],
                  ["Working distance", "1", "0", "S", "S", "S", "+", "+"],
                  ["Field of view", "1", "0", "+", "S", "+", "+", "+"],
                  ["HDR", "3", "0", "S", "−", "−", "−", "S"],
                  ["Frame rate", "2", "0", "S", "−", "−", "−", "−"],
                  ["Precision", "5", "0", "S", "S", "−", "−", "−"],
                  ["Accuracy", "5", "0", "−", "S", "−", "−", "−"],
                  ["Net score", "", "0", "−4", "−5", "−14", "−10", "−7"],
                ]}
                highlight={[7]}
              />
              <P>
                No alternative beat the datum. Its narrow illumination reduces multipath error, and it
                offers HDR and high-speed modes. Its 31° × 24° field of view covers a full 300 mm face in
                one frame once the camera stands far enough back for the narrow axis to span it:
              </P>
              <Eq where="Within the camera's 1,250 mm operating mode.">
                <i>d</i> ≥ 150 mm / tan 12° ≈ 0.71 m
              </Eq>
              <FigureGrid
                items={[
                  { src: fov, alt: "Helios2 camera family fields of view at 5 m" },
                  { src: cameraMount, alt: "Helios2+ camera on its printed end-effector bracket" },
                ]}
                caption="Left: Helios2 fields of view at 5 m; the Narrow variant (green) covers 2.8 × 2.1 m. Right: the camera end effector."
              />
              <P>
                A single 5 m M12-to-RJ45 Cat6a cable carries both power and data to the camera from a
                30 W PoE+ injector, so only one line runs through the joints. A bench capture of a soccer
                cleat was an early check of reconstruction quality.
              </P>
              <Figure src={cleat} alt="Point cloud of a soccer cleat" caption="Helios2+ Narrow point cloud of a soccer cleat." natural aspect="812 / 392" />
              <P>
                We tuned the camera in our own Python capture app, built on LUCID's Arena SDK.
                Accumulating frames and filtering trade capture time for lower depth noise; this set gave
                the cleanest clouds of our test parts:
              </P>
              <Specs
                rows={[
                  ["Operating mode", "1,250 mm, single frequency"],
                  ["Exposure", "62.5 µs"],
                  ["Gain / HDR", "Low / off"],
                  ["Accumulation", "16 frames"],
                  ["Filters", "Spatial; flying pixel (20 mm); confidence (min. 500)"],
                  ["Minimum distance", "500 mm"],
                ]}
              />
              <Figure
                src={scanApp}
                alt="Python capture app showing a point cloud of three test parts and camera settings"
                caption="The capture app: live 3D view of three test parts, with camera settings on the right."
                aspect="1405 / 980"
                natural
              />
            </>
          ),
        },
        {
          title: "Point Cloud Fusion",
          body: (
            <>
              <P>
                Each capture lands in its own camera frame. The software places it in the robot's base
                frame by chaining two transforms: forward kinematics gives the end-effector pose from the
                joint angles, and a one-time hand-eye calibration in OpenCV gives the camera's pose on the
                end effector.
              </P>
              <Eq>
                <i>T</i>
                <sub>base→cam</sub> = <i>T</i>
                <sub>base→ee</sub>(<i>q</i>) · <i>T</i>
                <sub>ee→cam</sub>
              </Eq>
              <P>
                Kinematic pose alone isn't accurate enough below a millimeter, so ICP (iterative closest
                point) refines each alignment. ICP only converges from a good initial guess, which is
                exactly what the kinematic pose supplies, so each method covers the other's weakness.
              </P>
              <Figure
                src={fusionPipeline}
                alt="Fusion pipeline: load, preprocess, pose-based initialization, pairwise registration, pose graph optimization, merge"
                caption="The Open3D fusion pipeline."
                aspect="1800 / 698"
                natural
                inset={8}
              />
              <Bullets
                items={[
                  "Preprocess: crop to the region of interest, remove the turntable plane and outliers, downsample, estimate normals.",
                  "Register: run ICP between overlapping neighbors and reject low-overlap pairs.",
                  "Optimize: a pose graph links the last view back to the first and solves every pose at once, spreading accumulated drift across the scan instead of letting it pile up at the seam.",
                  "Merge: concatenate the aligned views and remove duplicate points.",
                ]}
              />
              <P>
                We validated the pipeline in simulation on the Stanford bunny before the arm existed.
                Pose-only registration leaves roughly a millimeter of gap between overlapping views; ICP
                pulls it down to a few tenths.
              </P>
              <Figure
                src={poseSetup}
                alt="Simulated camera poses arranged around the Stanford bunny"
                caption="Simulated capture poses around the Stanford bunny."
                aspect="4 / 3"
                scale={90}
              />
              <FigureGrid
                items={[
                  { src: bunny, alt: "Bunny point clouds colored by gap to overlapping views, pose-only versus pose plus ICP" },
                  { src: crossSection, alt: "Cross-section of the fused bunny against the true surface, pose-only versus pose plus ICP" },
                ]}
                aspect="1 / 1"
                scale={94}
                caption="Left: gap from each point to overlapping views, pose-only vs. pose + ICP (0–2 mm scale). Right: cross-section at z = 58 mm against the true surface (grey)."
              />
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
            The build is shaped by the budget. Custom parts are FDM-printed in PLA (filament from the
            sponsor, printers on campus and our own), and the load-bearing link plates are 6061 aluminum
            waterjet-cut at the campus Engineering Student Design Center at no cost. Hardware comes from
            McMaster-Carr. Printed fits carry manufacturing tolerances in the CAD.
          </P>
          <FigureGrid
            items={[
              { src: waterjet, alt: "Aluminum link plates cut on the waterjet" },
              { src: prints, alt: "First printed PLA joint housings and pulleys" },
            ]}
            fill
            caption="Left: link plates on the waterjet, with lobed drive profiles and lightening slots. Right: the first printed joint housings and pulleys."
          />
          <P>
            As of early November, the aluminum parts are cut, printing is underway, the steppers have
            arrived and the servos are in transit; J1–J3 assembly is next. The proposal-stage estimate was $1,526
            of the $2,000 budget, with the camera and laptop provided by the sponsor.
          </P>
        </>
      ),
    },
    {
      title: "Controls",
      body: (
        <>
          <P>
            Python on the host laptop coordinates each scan: it moves the arm and turntable, waits for
            both to settle, triggers a capture and pairs the frame with its pose. It commands a Teensy
            4.1 running C++ motor-control firmware, following the AR4's electronics architecture.
          </P>
          <Figure
            src={softwareFlow}
            alt="Scan control and software flow diagram"
            caption="Scan control and software flow."
            aspect="1315 / 484"
            natural
            inset={8}
          />
          <P>
            The kinematics start from Denavit–Hartenberg frames. Symbolic forward kinematics gives the
            camera pose for any joint state; it sized the workspace and tags every capture with its
            pose. Inverse kinematics solves for the joint angles that put the camera at each planned
            viewpoint, at working distance and aimed at the part.
          </P>
          <Table
            head={["Joint", "θ", "d", "a", "α"]}
            rows={[
              ["1", <><i>q</i><sub>1</sub></>, <><i>d</i><sub>1</sub></>, <><i>a</i><sub>1</sub></>, "−π/2"],
              ["2", <><i>q</i><sub>2</sub> − π/2</>, "0", <><i>a</i><sub>2</sub></>, "0"],
              ["3", <><i>q</i><sub>3</sub></>, "0", "0", "−π/2"],
              ["4", <><i>q</i><sub>4</sub></>, <><i>d</i><sub>4</sub></>, "0", "π/2"],
              ["5", <><i>q</i><sub>5</sub></>, "0", "0", "−π/2"],
              ["6", <><i>q</i><sub>6</sub></>, <><i>d</i><sub>6</sub></>, "0", "0"],
            ]}
            caption="Denavit–Hartenberg parameters: a six-revolute arm with a spherical wrist."
          />
          <FigureGrid
            items={[
              { src: dh, alt: "Hand-drawn DH frame assignment for the six joints" },
              { src: ik, alt: "MATLAB inverse kinematics solution aiming the camera at a target plane" },
            ]}
            caption="Left: DH frame assignment. Right: an inverse-kinematics solution aiming the camera at a target plane."
          />
          <P>
            The specification also requires Cartesian jogging of the camera at 0.05 m/s from at least one
            operator input device, and a hardwired E-stop that halts the arm within 5 s without letting
            it fall.
          </P>
        </>
      ),
    },
    {
      title: "Testing & Validation",
      body: (
        <>
          <P>
            Testing is staged so each error source is isolated before the next one is added: the camera
            alone, then multi-view fusion on a turntable, then the arm.
          </P>
          <P>
            The turntable tests captured a printed bracket from five angles, −60° to +60°. The second
            run produced far cleaner single views and a much tighter fused model than the first.
          </P>
          <Figure
            src={scanViews}
            alt="Five single-view point clouds of the bracket from −60° to +60°"
            caption="Test 2: single views at −60°, −30°, 0°, +30° and +60°."
            aspect="1800 / 292"
            natural
            inset={8}
          />
          <FigureGrid
            items={[
              { src: turntableTest, alt: "Printed bracket on the turntable under the camera" },
              { src: scanFused, alt: "Fused five-view point cloud of the bracket" },
            ]}
            fill
            caption="The test part on the turntable (left) and its fused five-view cloud (right)."
          />
          <P>
            Arm-level tests run after assembly, ahead of the November 17 trade show. Repeatability follows
            ISO 9283: the arm returns to each of 5 poses 30 times with the camera installed, at operating
            speed, and repeatability is the mean scatter about the poses' barycenter plus three standard
            deviations:
          </P>
          <Eq
            where={
              <>
                <span className="overline">l</span> is the mean distance of the attained positions from
                their barycenter and <i>S</i>
                <sub>l</sub> its standard deviation. Pass: <i>RP</i> ≤ 1.0 mm.
              </>
            }
          >
            <i>RP</i> = <span className="overline">l</span> + 3<i>S</i>
            <sub>l</sub>
          </Eq>
          <Specs
            rows={[
              ["Pose repeatability", "ISO 9283, 5 poses × 30 cycles, RP ≤ 1.0 mm"],
              ["Dimensional accuracy", "Scan vs. calipers, within ±1.0 mm"],
              ["Surface accuracy", "Scan vs. reference laser scan, ≥ 85% of points within ±1.0 mm"],
              ["Reporting", "GD&T characteristics with defined datums and tolerances"],
            ]}
          />
        </>
      ),
    },
  ],
};
