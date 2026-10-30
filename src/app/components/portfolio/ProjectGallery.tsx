import type { ReactNode } from "react";
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
  /** The project's page. Omit until it exists; the card then renders unlinked. */
  href?: string;
  /** CSS aspect-ratio for the image panel, e.g. "16 / 9". */
  aspect: string;
  /** Which of the three columns this tile lives in (placement is explicit). */
  col: 1 | 2 | 3;
  /** Skill/scope chips revealed as white boxes on hover. One box per entry. */
  tags?: string[];
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

type Project = BrandProject | PhotoProject | PlaceholderProject;

// Placement is explicit: each tile names its column, and the gallery renders
// three independent columns (no auto-balancing). Reading left→right, top→bottom
// the tiles number 1..13:
//   Col 1: Tesla (1) / HV Electronics Packaging (4) / Tesseract (7) / Carbon Fiber Undertray (10)
//   Col 2: 3D Scanning Robotic Arm (2) / Guccibot (5) / Tally (8) / Triggerfish (11)
//   Col 3: Actuator Cooling Sleeve (3) / IBM (6) / Skins (9) / Project Hydra (12) / Flounder (13)
const projects: Project[] = [
  // ── Column 1 ────────────────────────────────────────────────────────────
  {
    id: "tesla",
    kind: "brand",
    col: 1,
    title: "Tesla",
    subtitle: "Battery & Energy Plastics",
    tags: ["Injection Molding", "DFMA", "RCA"],
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
    tags: ["Electronics Packaging", "Sheet Metal Design"],
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
    tags: ["Computer Hardware", "Cooling Optimization"],
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
    tags: ["CFD", "Composite Mfg"],
    aspect: "16 / 10",
    src: undertrayImg,
    // Larger than the shared default cap to fill more of the wide tile.
    scale: 80,
    alt: "Carbon fiber undertray geometry optimization study",
  },
  // ── Column 2 ────────────────────────────────────────────────────────────
  // 3D Scanning Robotic Arm (tile 2). CAD render of the arm reaching out to the
  // side, a wide object (aspect 1.70), so it gets the same 16/10 landscape tile
  // as the cooling sleeve beside it.
  {
    id: "scanning-robot",
    kind: "photo",
    col: 2,
    title: "3D Scanning Robotic Arm",
    subtitle: "3D Reconstruction",
    aspect: "16 / 10",
    src: scanningRobotImg,
    // The arm runs corner to corner and leaves the other corners empty, so
    // at the shared cap it reads smaller than the solid sleeve beside it.
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
    tags: ["CAD", "Mechanisms"],
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
    tags: ["Product Mgmt", "Product Design"],
    aspect: "16 / 9",
    background: "#161b2b",
    logo: (
      <span className="font-garamond text-[clamp(20px,4.2vw,36px)] leading-none text-white">
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
  // ── Column 3 ────────────────────────────────────────────────────────────
  // Actuator Cooling Sleeve (tile 3). Wide lattice ring (object aspect 1.61)
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
    tags: ["Python", "SQL", "Quality Mgmt"],
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
    tags: ["UI/UX", "Swift", "Figma"],
    aspect: "1 / 1",
    src: skinsImg,
    scale: 85,
    alt: "Skins app home screen on a phone, showing a skin health score with hydration, texture and tone",
  },
  // Project Hydra (tile 12). Product photo, not a CAD render, near-square
  // (aspect 1.05). The tile is a touch shorter than square; scale 70 keeps the
  // photo ~65% of the tile width, as large as the other renders.
  {
    id: "hydra",
    kind: "photo",
    col: 3,
    title: "Project Hydra",
    subtitle: "Liquid-Cooled ITX PC",
    aspect: "9 / 8",
    src: hydraImg,
    scale: 70,
    alt: "Project Hydra liquid-cooled mini-ITX PC with custom water-cooling loop",
  },
  // Flounder (tile 13).
  {
    id: "flounder",
    kind: "photo",
    col: 3,
    title: "Flounder",
    subtitle: "Deep Sea ROV",
    tags: ["FDM + Resin 3D Printing", "Raspberry Pi"],
    // ~square crop framing the ROV thruster render (object aspect 1.16).
    aspect: "6 / 5",
    src: flounderImg,
    alt: "Flounder deep sea ROV thruster assembly, mechanical design",
  },
];

// The inset hairline keeps the pure-white CAD tiles (and Skins' white edge)
// crisp against the paper; on the brand colors it's all but invisible.
const panelClass =
  "relative flex h-full w-full items-center justify-center overflow-hidden rounded-sm ring-1 ring-inset ring-ink/8";

/* A CAD render centered on a white tile. The art is trimmed to its object, so
   `scale` (a % cap on both width and height, via object-contain) directly sets
   how large the object reads — keep it uniform across tiles for a consistent
   object size. */
function CenteredArt({
  src,
  alt,
  scale = 65,
  tags,
  art,
}: {
  src: string;
  alt: string;
  scale?: number;
  tags?: string[];
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
      <CardOverlay />
      <TileTags tags={tags} />
    </div>
  );
}

function ProjectPanel({ project }: { project: BrandProject | PhotoProject }) {
  if (project.kind === "brand") {
    return (
      <div className={panelClass} style={{ background: project.background }}>
        {project.logo}
        <CardOverlay />
        <TileTags tags={project.tags} />
      </div>
    );
  }

  if (project.src) {
    return (
      <CenteredArt
        src={project.src}
        alt={project.alt}
        scale={project.scale}
        tags={project.tags}
        art={project.art}
      />
    );
  }

  // Placeholder panel until a real product photo is wired in.
  return (
    <div className={`${panelClass} bg-white`}>
      <span aria-hidden className="font-sans font-medium text-[15px] text-ink/20">
        {project.title}
      </span>
      <CardOverlay />
    </div>
  );
}

/* Hover darken — the only interaction. A black layer over the panel
   fades 0 → 0.45 on hover. Caption sits outside, so it's untouched. */
function CardOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-200 ease-out group-hover:bg-black/15" />
  );
}

/* Skill chips — small white boxes pinned to the panel's bottom-left, one per
   tag. Hidden until the card is hovered, then fade in over the darken layer.
   Inter, like the captions. Sits above CardOverlay in the DOM so the
   boxes stay bright against the dimmed art. */
function TileTags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-1.5 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-sm bg-white px-3 py-1.5 font-sans text-[12px] leading-none text-ink shadow-sm"
        >
          {tag}
        </span>
      ))}
    </div>
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
            <div className="h-full w-full rounded-sm bg-white ring-1 ring-inset ring-ink/8" />
          )}
        </div>
      </div>
    );
  }

  const card = (
    <>
      <div className="w-full" style={{ aspectRatio: project.aspect }}>
        <ProjectPanel project={project} />
      </div>

      {/* Caption — one line under the panel, like a credit: title in ink
          (medium), a faint slash, then the subtitle in meta grey (regular).
          Long ones wrap as running text. */}
      <div className="pt-2 font-sans font-normal text-[12px] leading-[1.5]">
        <h3 className="inline text-[12px] font-medium leading-[1.5] text-ink">{project.title}</h3>
        <span aria-hidden className="mx-1 text-ink/25">/</span>
        <span className="text-meta">{project.subtitle}</span>
      </div>
    </>
  );

  // No page yet: same card and hover, just not a link.
  if (!project.href) return <div className="group">{card}</div>;

  return (
    <a
      href={project.href}
      className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
    >
      {card}
    </a>
  );
}

export function ProjectGallery() {
  return (
    <section
      id="projects"
      data-name="Projects"
      className={`${column} pb-32 pt-10`}
    >
      {/* Explicit columns: each column is an independent top-aligned stack, so
          tiles land exactly where assigned and differing heights stagger the
          columns. Stacks to one column below lg. */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-2">
        {([1, 2, 3] as const).map((col) => (
          <div key={col} className="flex flex-1 flex-col gap-5">
            {projects
              .filter((project) => project.col === col)
              .map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        ))}
      </div>
    </section>
  );
}
