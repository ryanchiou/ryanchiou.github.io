import { useEffect, useId, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import qiuData from "hanzi-writer-data/邱.json";
import yongData from "hanzi-writer-data/永.json";
import jianData from "hanzi-writer-data/建.json";

// 邱永建, drawn top→bottom to mirror the original vertical calligraphy. Data is
// bundled (imported) rather than fetched from hanzi-writer's CDN so the intro
// never waits on the network.
const CHARS = [
  { char: "邱", data: qiuData },
  { char: "永", data: yongData },
  { char: "建", data: jianData },
] as const;

const LEAD_IN_MS = 233; // beat before the first stroke
const BETWEEN_CHARS_MS = 107; // pause as the "hand" moves to the next character

const SVG_NS = "http://www.w3.org/2000/svg";

const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

// Hanzi-writer strokes are filled glyph shapes with no line-width, so to thicken
// them we apply a small feMorphology(dilate) to the generated <svg>. Amount
// scales with character size so it reads the same at any dimension.
const applyThickness = (svg: SVGSVGElement, filterId: string, size: number) => {
  const dilate = Math.max(0.5, size * 0.004); // a touch thicker (between none and 0.0075)
  const defs = document.createElementNS(SVG_NS, "defs");
  defs.innerHTML = `
    <filter id="${filterId}" x="-15%" y="-15%" width="130%" height="130%"
            color-interpolation-filters="sRGB">
      <feMorphology operator="dilate" radius="${dilate}" in="SourceGraphic"/>
    </filter>`;
  svg.appendChild(defs);
  svg.style.filter = `url(#${filterId})`;
  svg.style.overflow = "visible"; // let the dilated edges show
};

type Props = {
  /** Layout classes for the root. Its measured height drives character size. */
  className?: string;
};

/**
 * Renders the name as three stacked hanzi-writer SVGs and, on first mount,
 * animates each character stroke-by-stroke in reading order. Character size is
 * derived from the root's height (height / 3, square cells) so it slots into the
 * same space the old <img> occupied. Honors prefers-reduced-motion.
 */
export function CalligraphyWriter({ className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hasAnimated = useRef(false);
  const filterIdBase = useId().replace(/:/g, ""); // unique per mount, valid in url()
  const [size, setSize] = useState(0);

  // Track the root's height; per-character cells are square at height / 3.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setSize(Math.floor(el.clientHeight / CHARS.length));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // (Re)build the writers whenever the cell size changes. The intro animation
  // plays only on the first real size; later resizes just re-render full glyphs.
  useEffect(() => {
    if (!size) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const writers = CHARS.map(({ char, data }, i) => {
      const target = targetRefs.current[i];
      if (!target) return null;
      target.innerHTML = "";
      const writer = HanziWriter.create(target, char, {
        width: size,
        height: size,
        padding: Math.round(size * 0.05),
        showCharacter: false,
        showOutline: false,
        strokeColor: "#ffffff",
        strokeAnimationSpeed: 1.3, // 1.5× the previous 0.85
        delayBetweenStrokes: 87,
        charDataLoader: () => data as never,
      });
      const svg = target.querySelector("svg");
      if (svg) applyThickness(svg, `${filterIdBase}-${i}`, size);
      return writer;
    });

    if (reduced || hasAnimated.current) {
      writers.forEach((w) => w?.showCharacter({ duration: 0 }));
      return;
    }

    hasAnimated.current = true;
    let cancelled = false;
    (async () => {
      await wait(LEAD_IN_MS);
      for (const writer of writers) {
        if (cancelled || !writer) continue;
        await new Promise<void>((resolve) =>
          writer.animateCharacter({ onComplete: () => resolve() }),
        );
        await wait(BETWEEN_CHARS_MS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [size]);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label="邱永建"
      className={className}
    >
      {CHARS.map((c, i) => (
        <div
          key={c.char}
          aria-hidden
          ref={(el) => {
            targetRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
