import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { Link } from "@/app/router";
import { caseStudyPath } from "@/app/projects";
import { column } from "./layout";
import { HvboxExplode } from "./HvboxExplode";
import teslaLogo from "@/assets/tiles_corp/tesla_logo.jpg";
import ibmLogo from "@/assets/tiles_corp/ibm_logo_blue.png";
// Project photos are CAD renders on white, pre-cropped to the object's bounding
// box with a uniform margin and centered (source padding was inconsistent
// across exports), so a single on-tile scale makes the objects read at a
// consistent size.
import guccibotImg from "@/assets/tiles_proj/guccibot_walker.png";
import flounderImg from "@/assets/tiles_proj/flounder_rov.png";
import triggerfishImg from "@/assets/tiles_proj/triggerfish_rov.png";
import hvboxImg from "@/assets/tiles_proj/hvbox.png";
import tesseractImg from "@/assets/tiles_proj/tesseract.png";
import undertrayImg from "@/assets/tiles_proj/undertray.png";
import scanningRobotImg from "@/assets/tiles_proj/3D-scanning_robotic-arm.png";
import vrCushionImg from "@/assets/tiles_proj/lattice-vr-cushion.png";
import coolingSleeveImg from "@/assets/tiles_proj/lattice_cooling-sleeve.png";
import hydraImg from "@/assets/tiles_proj/hydra.png";
import skinsImg from "@/assets/tiles_proj/skins.png";

/* ── Project data ──────────────────────────────────────────────────
   The gallery is rendered straight from this array — add, remove, or
   reorder entries here and the masonry reflows on its own. Nothing
   about column placement is hardcoded.

   `aspect` (width / height) drives each panel's height, which is what
   staggers the columns Pinterest-style. `kind` switches the panel
   between a flat brand-color fill with a centered mark and a
   product photo on white. */

type BaseProject = {
  id: string;
  title: string;
  subtitle: string;
  /** Where the card links. Defaults to the project's page when one exists
      (src/app/projects); with neither, the card renders unlinked. */
  href?: string;
  /** CSS aspect-ratio for the image panel, e.g. "16 / 9". */
  aspect: string;
  /** Which of the three columns this tile lives in (placement is explicit). */
  col: 1 | 2 | 3;
};

type BrandProject = BaseProject & {
  kind: "brand";
  /** Any valid CSS background (solid color or gradient). */
  background: string;
  logo: ReactNode;
};

type PhotoProject = BaseProject & {
  kind: "photo";
  /** Omit for an empty placeholder panel. */
  src?: string;
  alt: string;
  /** Max width/height of the centered art as a % of the tile (default 86). */
  scale?: number;
  /** Shown in place of the still image, in the same footprint (e.g. an animated teardown). */
  art?: ReactNode;
};

/* Reserved slot for a project that isn't built yet. Renders non-interactive
   with no caption. If `src` is set it shows that centered art (used for tiles
   whose project name/caption isn't wired up yet); otherwise a blank white
   panel just holds the column slot. */
type PlaceholderProject = {
  id: string;
  kind: "placeholder";
  aspect: string;
  col: 1 | 2 | 3;
  src?: string;
  alt?: string;
  scale?: number;
};

/** `hidden` keeps a tile in the code but out of the gallery. */
type Project = (BrandProject | PhotoProject | PlaceholderProject) & { hidden?: boolean };

/** A tile's data, for its project page (title, subtitle, art). Skills live on
    the page itself (src/app/projects). */
export function findTile(id: string): BrandProject | PhotoProject | undefined {
  const tile = projects.find((project) => project.id === id);
  return tile && tile.kind !== "placeholder" ? tile : undefined;
}

// Placement is explicit: each tile names its column, and the gallery renders
// three independent columns (no auto-balancing). Reading left→right, top→bottom
// the tiles number 1..14:
//   Col 1: Tesla (1) / HV Electronics Packaging (4) / Tesseract (7) / Carbon Fiber Undertray (10)
//   Col 2: 3D Scanning Robotic Arm (2) / Guccibot (5) / Tally (8) / Triggerfish (11) / Project Hydra (13)
//   Col 3: Custom-Fit Lattice VR Cushion (3) / Actuator Cooling Sleeve (6) / IBM (9) / Skins (12) / Flounder (14)
// Coming soon is hidden; shown, it leads column 1 and the rest shift down a spot.
const projects: Project[] = [
  // ── Column 1 ────────────────────────────────────────────────────────────
  // Coming soon. Hidden for now; remove `hidden` to show it as the first tile.
  // The next project's slot: a soft multi-color wash (see GradientWash) with
  // the date as its subtitle, 16/10 like the rest of the first row.
  {
    id: "coming-soon",
    hidden: true,
    kind: "brand",
    col: 1,
    title: "Coming soon",
    subtitle: "2027",
    aspect: "16 / 10",
    background: "#fa8a9c",
    logo: <GradientWash />,
  },
  {
    id: "tesla",
    kind: "brand",
    col: 1,
    title: "Tesla",
    subtitle: "Battery & Energy Plastics",
    aspect: "16 / 9",
    // Logo JPG is tagged Display P3, so the browser color-manages its #CE3642
    // pixels to sRGB #E01D3C on screen. Match that here (not the raw pixel value)
    // so the scaled-down logo blends seamlessly into the block.
    background: "#E01D3C",
    logo: (
      <img
        src={teslaLogo}
        alt="Tesla logo"
        draggable={false}
        className="w-[68%] select-none"
      />
    ),
  },
  // HV Electronics Packaging (tile 4). Shortened from 3/4 to 1/1; the tall
  // exploded stack (object aspect ~0.75) still fits by height, centered, with
  // white margins on the sides.
  {
    id: "hvbox",
    kind: "photo",
    col: 1,
    title: "HV System Enclosure",
    subtitle: "Sensor Integration",
    aspect: "1 / 1",
    src: hvboxImg,
    // Tall object in a square tile reads small at the shared scale, so bump
    // this tile up.
    scale: 85,
    alt: "High-voltage electronics packaging exploded assembly",
    // Rests assembled and explodes into the render above on hover.
    art: <HvboxExplode alt="High-voltage electronics packaging, assembled and exploded" />,
  },
  {
    id: "tesseract",
    kind: "photo",
    col: 1,
    title: "Tesseract",
    subtitle: "Sub-7 Liter PC",
    // Short landscape tile, a touch taller than the 16/9 & 16/10 neighbours.
    aspect: "4 / 3",
    src: tesseractImg,
    // Matches the shared default cap.
    scale: 65,
    alt: "Tesseract sub-7-liter PC build, hardware assembly",
  },
  // Carbon Fiber Undertray (tile 10). Object is very wide (~3.3), so it frames
  // as a horizontal band with white margins above/below in this landscape tile.
  {
    id: "undertray",
    kind: "photo",
    col: 1,
    title: "Carbon Fiber Undertray",
    subtitle: "Airfoil Optimization",
    aspect: "16 / 10",
    src: undertrayImg,
    // Larger than the shared default cap to fill more of the wide tile.
    scale: 80,
    alt: "Carbon fiber undertray geometry optimization study",
  },
  // ── Column 2 ────────────────────────────────────────────────────────────
  // 3D Scanning Robotic Arm (tile 2). CAD render of the arm on its base, a
  // compact object (aspect 1.22), in a taller 4/3 tile than the 16/10 cushion
  // beside it so the arm can read larger.
  {
    id: "scanning-robot",
    kind: "photo",
    col: 2,
    title: "3D Scanning Robotic Arm",
    subtitle: "3D Reconstruction",
    aspect: "4 / 3",
    src: scanningRobotImg,
    // Still narrower than the tile, so it fits by height and grows with it;
    // above the shared cap so the arm is the first row's largest object.
    scale: 76,
    alt: "Robotic arm with a 3D scanner mounted on its end effector",
  },
  // Guccibot (tile 5). Tile aspect ~matches the trimmed object (1.42) so it
  // frames tightly.
  {
    id: "guccibot",
    kind: "photo",
    col: 2,
    title: "Single-Input 8-Legged Robot",
    subtitle: "Mechanisms",
    aspect: "7 / 5",
    src: guccibotImg,
    alt: "Guccibot single-DOF input walking robot",
  },
  {
    id: "tly",
    kind: "brand",
    col: 2,
    title: "Tally",
    subtitle: "Viral Social Accountability Platform",
    aspect: "16 / 9",
    background: "#161b2b",
    logo: (
      // Sized to the tile (10% of its width), so it reads the same on every
      // screen, like the Tesla and IBM marks.
      <span className="font-garamond text-[10cqw] leading-none text-white">
        tally.
      </span>
    ),
  },
  // Triggerfish (tile 11). The latest high-school ROV (object aspect 1.24,
  // including its ground shadow). Shorter 4/3 tile; scale 70 keeps the render
  // ~65% of the tile width.
  {
    id: "triggerfish",
    kind: "photo",
    col: 2,
    title: "Triggerfish",
    subtitle: "Deep Sea ROV",
    aspect: "4 / 3",
    src: triggerfishImg,
    scale: 70,
    alt: "Triggerfish deep sea ROV with thrusters, camera dome and gripper arm",
  },
  // Project Hydra (tile 13). Product photo, not a CAD render, near-square
  // (aspect 1.05). The tile is a touch shorter than square; scale 70 keeps the
  // photo ~65% of the tile width, as large as the other renders.
  {
    id: "hydra",
    kind: "photo",
    col: 2,
    title: "Project Hydra",
    subtitle: "Liquid-Cooled ITX PC",
    aspect: "9 / 8",
    src: hydraImg,
    scale: 70,
    alt: "Project Hydra liquid-cooled mini-ITX PC with custom water-cooling loop",
  },
  // ── Column 3 ────────────────────────────────────────────────────────────
  // Custom-Fit Lattice VR Cushion (tile 3). Lattice face cushion with its
  // ground shadow (object aspect 1.78), in the first row's 16/10 landscape tile.
  {
    id: "vr-cushion",
    kind: "photo",
    col: 3,
    title: "Custom-Fit Lattice VR Cushion",
    subtitle: "Additive Manufacturing",
    aspect: "16 / 10",
    src: vrCushionImg,
    alt: "3D-printed lattice face cushion for a VR headset",
  },
  // Actuator Cooling Sleeve (tile 6). Wide lattice ring (object aspect 1.61)
  // in a matching landscape tile.
  {
    id: "cooling-sleeve",
    kind: "photo",
    col: 3,
    title: "Actuator Cooling Sleeve",
    subtitle: "Additive Manufacturing",
    aspect: "16 / 10",
    src: coolingSleeveImg,
    alt: "Gyroid lattice cooling sleeve for an actuator",
  },
  {
    id: "ibm",
    kind: "brand",
    col: 3,
    title: "IBM",
    subtitle: "Data & Production Automation",
    aspect: "16 / 9",
    // Blue 8-bar mark (transparent PNG, trimmed to the mark) on white.
    background: "#FFFFFF",
    logo: (
      <img
        src={ibmLogo}
        alt="IBM logo"
        draggable={false}
        className="w-[31%] select-none"
      />
    ),
  },
  // Skins. Phone mockup of the app's home dashboard. Very tall object (aspect
  // ~0.56), so like the HV enclosure it sits in a square tile with a larger cap.
  {
    id: "skins",
    kind: "photo",
    col: 3,
    title: "Skins",
    subtitle: "AI Skincare Assistant",
    aspect: "1 / 1",
    src: skinsImg,
    scale: 85,
    alt: "Skins app home screen on a phone, showing a skin health score with hydration, texture and tone",
  },
  // Flounder (tile 14).
  {
    id: "flounder",
    kind: "photo",
    col: 3,
    title: "Flounder",
    subtitle: "Deep Sea ROV",
    // ~square crop framing the ROV thruster render (object aspect 1.16).
    aspect: "6 / 5",
    src: flounderImg,
    alt: "Flounder deep sea ROV thruster assembly, mechanical design",
  },
];

/* A soft multi-color wash (blue → lilac → coral/orange/magenta) for tiles
   without art yet. Layered gradients, then blurred so every edge melts; the
   layer overhangs the panel by 15% so the blur doesn't fade at the edges,
   which is why the color spots sit inward of the corners they light. */
const WASH =
  "radial-gradient(40% 56% at 88% 12%, #ffa31a 0%, rgb(255 163 26 / 0) 70%)," +
  "radial-gradient(30% 40% at 35% 88%, #ff1fd0 0%, rgb(255 31 208 / 0) 70%)," +
  "radial-gradient(26% 38% at 58% 85%, #ff7a10 0%, rgb(255 122 16 / 0) 70%)," +
  "radial-gradient(25% 38% at 88% 81%, #ff1ed9 0%, rgb(255 30 217 / 0) 70%)," +
  "radial-gradient(28% 34% at 16% 56%, #e6b8f5 0%, rgb(230 184 245 / 0) 70%)," +
  "radial-gradient(28% 36% at 72% 50%, #ff4470 0%, rgb(255 68 112 / 0) 70%)," +
  "linear-gradient(152deg, #0a8be9 0%, #0a8be9 11%, #1d9cf0 25%, #8fa6e4 38%, #e5a9d6 47%, #ff7088 56%, #ff4d6c 67%, #ff3d8a 88%)";

function GradientWash() {
  return <div aria-hidden className="absolute -inset-[15%] blur-[26px]" style={{ background: WASH }} />;
}

// No outline: the white tiles sit straight on the #f5f5f5 paper. A size
// container, so a logo can scale with its tile (cqw units).
const panelClass =
  "@container relative flex h-full w-full items-center justify-center overflow-hidden rounded-sm";

/* A CAD render centered on a white tile. The art is trimmed to its object, so
   `scale` (a % cap on both width and height, via object-contain) directly sets
   how large the object reads — keep it uniform across tiles for a consistent
   object size. */
function CenteredArt({
  src,
  alt,
  scale = 65,
  art,
}: {
  src: string;
  alt: string;
  scale?: number;
  art?: ReactNode;
}) {
  return (
    <div className={`${panelClass} bg-white`}>
      {art ? (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ maxWidth: `${scale}%`, maxHeight: `${scale}%` }}
        >
          {art}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{ maxWidth: `${scale}%`, maxHeight: `${scale}%` }}
          className="select-none object-contain"
        />
      )}
    </div>
  );
}

function ProjectPanel({ project }: { project: BrandProject | PhotoProject }) {
  if (project.kind === "brand") {
    return (
      <div className={panelClass} style={{ background: project.background }}>
        {project.logo}
      </div>
    );
  }

  if (project.src) {
    return <CenteredArt src={project.src} alt={project.alt} scale={project.scale} art={project.art} />;
  }

  // Placeholder panel until a real product photo is wired in.
  return (
    <div className={`${panelClass} bg-white`}>
      <span aria-hidden className="font-sans font-medium text-[15px] text-ink/20">
        {project.title}
      </span>
    </div>
  );
}

const chipClass =
  "rounded-sm bg-white px-3 py-1.5 font-sans text-[12px] font-normal leading-none text-ink 3xl:text-[13px]";

// Hidden until hover or keyboard focus. Devices without hover (phones) show
// it all the time, since there's no caption under the tile.
const revealClass =
  "pointer-events-none absolute inset-x-0 bottom-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100";

/* The tile's name: title and subtitle as two white chips pinned to the
   panel's bottom-left, over a faint shade that rises from the bottom edge so
   the white chips stand off the white tiles. Only the strip behind the chips
   shades; the rest of the tile stays as is. */
function TileLabel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <div aria-hidden className={`${revealClass} h-24 rounded-b-sm bg-linear-to-t from-black/10 to-transparent`} />
      <div className={`${revealClass} flex flex-wrap gap-1.5 p-1.5`}>
        <h3 className={chipClass}>{title}</h3>
        <span className={chipClass}>{subtitle}</span>
      </div>
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  // Reserved slot: non-interactive, no caption. Shows centered art if it has a
  // src (a real project whose name/caption isn't wired up yet), else a blank
  // white panel holding the column slot.
  if (project.kind === "placeholder") {
    return (
      <div aria-hidden>
        <div className="w-full" style={{ aspectRatio: project.aspect }}>
          {project.src ? (
            <CenteredArt src={project.src} alt={project.alt ?? ""} scale={project.scale} />
          ) : (
            <div className="h-full w-full rounded-sm bg-white" />
          )}
        </div>
      </div>
    );
  }

  // Hover shrink: the panel eases down to 96% under the cursor and springs
  // back on leave. transform-gpu keeps the scale on the compositor so the tile
  // stays crisp. No caption underneath: the name shows on the tile on hover.
  const card = (
    <div
      className="relative w-full transform-gpu transition-transform duration-300 ease-out will-change-transform group-hover:scale-[0.96]"
      style={{ aspectRatio: project.aspect }}
    >
      <ProjectPanel project={project} />
      <TileLabel title={project.title} subtitle={project.subtitle} />
    </div>
  );

  // No page yet: same card and hover, just not a link.
  const href = project.href ?? caseStudyPath(project.id);
  if (!href) return <div className="group">{card}</div>;

  return (
    <Link
      to={href}
      className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
    >
      {card}
    </Link>
  );
}

/* ── Responsive columns ─────────────────────────────────────────────
   Three columns from lg (1024px) exactly as placed above, two on tablets and
   narrow windows from md (768px), one on phones. With fewer than three, tiles
   go in reading order (1..14 in the map above), each into whichever column is
   currently shortest, so the two columns end close to even. */
const columnQueries = [
  { count: 3, query: "(min-width: 64rem)" },
  { count: 2, query: "(min-width: 48rem)" },
];

const currentColumnCount = () =>
  columnQueries.find(({ query }) => window.matchMedia(query).matches)?.count ?? 1;

function subscribeToColumnCount(onChange: () => void) {
  const lists = columnQueries.map(({ query }) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

const useColumnCount = () => useSyncExternalStore(subscribeToColumnCount, currentColumnCount);

/** Tile height per unit of width, from an aspect like "16 / 9". */
function heightPerWidth(aspect: string) {
  const [w, h] = aspect.split("/").map(Number);
  return h / w;
}

function layoutColumns(count: number): Project[][] {
  const shown = projects.filter((project) => !project.hidden);
  const placed = ([1, 2, 3] as const).map((col) => shown.filter((project) => project.col === col));
  if (count === 3) return placed;

  // Read across the placed columns row by row.
  const readingOrder: Project[] = [];
  const rows = Math.max(...placed.map((col) => col.length));
  for (let row = 0; row < rows; row++) {
    for (const col of placed) if (col[row]) readingOrder.push(col[row]);
  }

  const columns: Project[][] = Array.from({ length: count }, () => []);
  const heights: number[] = Array(count).fill(0);
  for (const project of readingOrder) {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(project);
    heights[shortest] += heightPerWidth(project.aspect);
  }
  return columns;
}

export function ProjectGallery() {
  const count = useColumnCount();
  const columns = useMemo(() => layoutColumns(count), [count]);

  return (
    <section
      id="projects"
      data-name="Projects"
      className={`${column} pb-32 pt-10`}
    >
      {/* Each column is an independent top-aligned stack, so differing tile
          heights stagger the columns. The gap widens a touch on big monitors
          to keep pace with the larger tiles. */}
      <div className="flex items-start gap-2 3xl:gap-3">
        {columns.map((tiles, i) => (
          <div key={i} className="flex min-w-0 flex-1 flex-col gap-2 3xl:gap-3">
            {tiles.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
