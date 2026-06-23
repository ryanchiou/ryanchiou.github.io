import type { ReactNode } from "react";
import teslaLogo from "@/assets/tiles_corp/tesla_logo.jpg";
import ibmLogo from "@/assets/tiles_corp/ibmlogo.jpg";
// Project photos are CAD renders on white, pre-cropped to the object's bounding
// box with a uniform margin and centered (source padding was inconsistent
// across exports), so a single on-tile scale makes the objects read at a
// consistent size.
import guccibotImg from "@/assets/tiles_proj/guccibot.png";
import rovImg from "@/assets/tiles_proj/rov.png";
import hvboxImg from "@/assets/tiles_proj/hvbox.png";
import tesseractImg from "@/assets/tiles_proj/tesseract.png";
import undertrayImg from "@/assets/tiles_proj/undertray.png";

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
  href: string;
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
// the tiles number 1..9:
//   Col 1: Tesla (1) / Triggerfish (4) / Carbon Fiber Undertray (7)
//   Col 2: Guccibot (2) / Tally (5) / HV Electronics Packaging (8)
//   Col 3: Skins (3) / IBM (6) / Tesseract (9)
const projects: Project[] = [
  // ── Column 1 ────────────────────────────────────────────────────────────
  {
    id: "tesla",
    kind: "brand",
    col: 1,
    title: "Tesla",
    subtitle: "Battery & Energy Plastics",
    href: "#tesla",
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
  {
    id: "rov-1",
    kind: "photo",
    col: 1,
    title: "Triggerfish",
    subtitle: "Deep Sea ROV",
    href: "#deep-sea-rov",
    tags: ["FDM + Resin 3D Printing", "Raspberry Pi"],
    // ~square crop framing the ROV thruster render (object aspect 1.16).
    aspect: "6 / 5",
    src: rovImg,
    alt: "Deep sea ROV thruster assembly, mechanical design",
  },
  // Carbon Fiber Undertray (tile 7). Object is very wide (~3.3), so it frames
  // as a horizontal band with white margins above/below in this landscape tile.
  {
    id: "undertray",
    kind: "photo",
    col: 1,
    title: "Carbon Fiber Undertray",
    subtitle: "Geometry Optimization",
    href: "#undertray",
    tags: ["CFD", "Composite Mfg"],
    aspect: "16 / 10",
    src: undertrayImg,
    // Larger than the shared default cap to fill more of the wide tile.
    scale: 80,
    alt: "Carbon fiber undertray geometry optimization study",
  },
  // ── Column 2 ────────────────────────────────────────────────────────────
  // Guccibot (tile 2). Tile aspect ~matches the trimmed object (1.42) so it
  // frames tightly.
  {
    id: "guccibot",
    kind: "photo",
    col: 2,
    title: "Guccibot",
    subtitle: "Single DOF Input Robot",
    href: "#guccibot",
    tags: ["CAD", "Mechanism Design"],
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
    href: "#tally",
    tags: ["Product Mgmt", "Product Design"],
    aspect: "16 / 9",
    background: "#161b2b",
    logo: (
      <span className="font-garamond text-[clamp(20px,4.2vw,36px)] leading-none text-white">
        tally.
      </span>
    ),
  },
  // HV Electronics Packaging (tile 8). Shortened from 3/4 to 1/1; the tall
  // exploded stack (object aspect ~0.75) still fits by height, centered, with
  // white margins on the sides.
  {
    id: "hvbox",
    kind: "photo",
    col: 2,
    title: "HV System Enclosure",
    subtitle: "Inverter Discharge & Energy Meter",
    href: "#hvbox",
    tags: ["Electronics Packaging", "Sheet Metal Design"],
    aspect: "1 / 1",
    src: hvboxImg,
    // Tall object in a square tile reads small at the shared scale, so bump
    // this tile up.
    scale: 85,
    alt: "High-voltage electronics packaging exploded assembly",
  },
  // ── Column 3 ────────────────────────────────────────────────────────────
  {
    id: "skins",
    kind: "brand",
    col: 3,
    title: "Skins",
    subtitle: "Personalized Skin Care App",
    href: "#skins",
    tags: ["UI/UX", "Swift", "Figma"],
    aspect: "16 / 10",
    // Figma spec: horizontal linear gradient, 5 evenly-spaced stops
    // (0/25/50/75/100%). Each stop carries an opacity (0/50/75/88/100%) and
    // is overlaid on a white backsplash — so we paint the rgba stops as the
    // top layer and stack a solid white base beneath to composite correctly.
    background:
      "linear-gradient(to right, rgba(255,231,209,0) 0%, rgba(230,188,152,0.5) 25%, rgba(212,170,120,0.75) 50%, rgba(161,110,75,0.88) 75%, rgba(104,70,57,1) 100%), #FFFFFF",
    logo: (
      <span className="font-cal text-[clamp(20px,4.2vw,36px)] leading-none text-white">
        Skins
      </span>
    ),
  },
  {
    id: "ibm",
    kind: "brand",
    col: 3,
    title: "IBM",
    subtitle: "AI Enterprise Hardware",
    href: "#ibm",
    tags: ["Python", "SQL", "Quality Mgmt"],
    aspect: "16 / 9",
    // Image background is the same IBM blue, so it blends into the block
    // while letting us size the mark down from the full-bleed crop.
    background: "#0F62FE",
    logo: (
      <img
        src={ibmLogo}
        alt="IBM logo"
        draggable={false}
        className="w-[40%] select-none"
      />
    ),
  },
  {
    id: "tesseract",
    kind: "photo",
    col: 3,
    title: "Tesseract",
    subtitle: "Sub-7 Liter PC",
    href: "#tesseract",
    tags: ["Computer Hardware", "Cooling Optimization"],
    // Short landscape tile, a touch taller than the 16/9 & 16/10 neighbours.
    aspect: "4 / 3",
    src: tesseractImg,
    // Matches the shared default cap.
    scale: 65,
    alt: "Tesseract sub-7-liter PC build, hardware assembly",
  },
];

const panelClass =
  "relative flex h-full w-full items-center justify-center overflow-hidden rounded-sm";

/* A CAD render centered on a white tile. The art is trimmed to its object, so
   `scale` (a % cap on both width and height, via object-contain) directly sets
   how large the object reads — keep it uniform across tiles for a consistent
   object size. */
function CenteredArt({
  src,
  alt,
  scale = 65,
  tags,
}: {
  src: string;
  alt: string;
  scale?: number;
  tags?: string[];
}) {
  return (
    <div className={`${panelClass} bg-white`}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{ maxWidth: `${scale}%`, maxHeight: `${scale}%` }}
        className="select-none object-contain"
      />
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
      />
    );
  }

  // Placeholder panel until a real product photo is wired in.
  return (
    <div className={`${panelClass} bg-white`}>
      <span aria-hidden className="font-roboto font-medium text-[15px] text-black/20">
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
   Magda mono to match the captions. Sits above CardOverlay in the DOM so the
   boxes stay bright against the dimmed art. */
function TileTags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-1.5 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-sm bg-white px-3 py-1.5 font-mono text-[12px] leading-none text-black shadow-sm"
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
            <div className="h-full w-full rounded-sm bg-white" />
          )}
        </div>
      </div>
    );
  }

  return (
    <a
      href={project.href}
      className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <div className="w-full" style={{ aspectRatio: project.aspect }}>
        <ProjectPanel project={project} />
      </div>

      {/* Caption — left-aligned, directly below the panel. Title in
          Roboto (matches the nav); subtitle in Magda mono. */}
      <div className="pt-3">
        <h3 className="font-roboto font-medium text-[17px] tracking-wide leading-tight text-white">
          {project.title}
        </h3>
        <p className="mt-1.5 font-mono text-[13px] leading-snug text-meta">
          {project.subtitle}
        </p>
      </div>
    </a>
  );
}

export function ProjectGallery() {
  return (
    <section
      id="projects"
      data-name="Projects"
      className="w-full bg-panel px-[7.5%] pb-32 pt-4 sm:px-[9.5%] lg:px-[11.25%]"
    >
      {/* Explicit columns: each column is an independent top-aligned stack, so
          tiles land exactly where assigned and differing heights stagger the
          columns. Stacks to one column below lg. */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        {([1, 2, 3] as const).map((col) => (
          <div key={col} className="flex flex-1 flex-col gap-3">
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
