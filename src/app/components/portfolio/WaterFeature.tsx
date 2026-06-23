import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { type Pt, type RibbonNode, rng, ribbon, smoothPath } from "./shanshui";

// ── Shan-shui (山水) hero artwork ───────────────────────────────────────────
// A restrained, watercolor reading of classical Chinese landscape painting in
// the calligraphy's right-hand column. The piece is anchored to the measured
// calligraphy box (its base + right edge), but the canvas extends far ABOVE it
// into the hero's negative space: distant mountains and mist sit high and faint,
// a thin thread of water is born from an ink cloud up in the mist, then descends
// — widening, weaving, pooling — until it washes through the glyphs (the "rocks")
// and gathers in a pool at their base, where pines climb back up and twist around
// the typography. Lots of empty space; the calligraphy always leads. aria-hidden.
//
// Coordinate system: the SVG viewBox spans y ∈ [-ABOVE·H, H]; y ∈ [0, H] is the
// calligraphy box (so water/branches there land on the real characters) and
// everything above is sky. Layering: back (z-0) → calligraphy (z-10) → front
// branches (z-20).

const WIDTH_RATIO = 1.05; // art column width relative to the calligraphy height
const ABOVE = 1.9; // how many calligraphy-heights of sky sit above the glyphs

// muted, premium palette — luminous ink on black, one warm accent (the seals)
const C = {
  deep: "#27508c",
  indigo: "#343a86",
  grayblue: "#6f8cb0",
  hi: "#dceaff",
  mountain: "#22324f",
  mountainFar: "#1b2740",
  mist: "#cad9ee",
  cloud: "#202c5e",
  trunk: "#a48a5f",
  trunkFar: "#5d6a82",
  needle: "#8aa48f",
  needleFar: "#6a809a",
  seal: "#b2392e",
};

// Water centerline template over the FULL canvas: t = 0 (ink-cloud source, high
// in the mist) → 1 (base pool). dx is offset from the glyph axis, w the stream
// width — both in glyph units (u). The upper run is a faint, narrow thread; it
// only blooms once it reaches the characters (t ≳ 0.62, where y ≳ 0).
const FLOW = [
  { t: 0.0, dx: 0.0, w: 0.07 },
  { t: 0.12, dx: 0.22, w: 0.09 },
  { t: 0.24, dx: -0.28, w: 0.1 },
  { t: 0.36, dx: 0.32, w: 0.12 },
  { t: 0.48, dx: -0.22, w: 0.12 },
  { t: 0.58, dx: 0.16, w: 0.15 },
  { t: 0.66, dx: 0.24, w: 0.26 }, // entering 邱
  { t: 0.74, dx: -0.26, w: 0.2 },
  { t: 0.82, dx: 0.24, w: 0.34 }, // 永 pool
  { t: 0.9, dx: -0.18, w: 0.24 },
  { t: 1.0, dx: 0.04, w: 0.52 }, // base pool
];

export function WaterFeature() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setH(el.clientHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scene = useMemo(() => (h > 0 ? buildScene(h, reduced) : null), [h, reduced]);
  const w = scene?.w ?? 0;

  const layerClass =
    "pointer-events-none absolute right-0 top-0 bottom-0 hidden overflow-visible select-none md:block";

  return (
    <>
      {/* back layer — behind the calligraphy */}
      <div ref={boxRef} aria-hidden className={`${layerClass} z-0`} style={{ width: w || undefined }}>
        {scene?.back}
      </div>
      {/* front layer — branches that cross in front of the strokes */}
      <div aria-hidden className={`${layerClass} z-20`} style={{ width: w || undefined }}>
        {scene?.front}
      </div>
    </>
  );
}

// ── scene builder ───────────────────────────────────────────────────────────
function buildScene(H: number, reduced: boolean) {
  const W = Math.round(H * WIDTH_RATIO);
  const u = H / 3; // glyph size
  const cx = W - u / 2; // glyph centerline x (right-aligned column)
  const TOP = -ABOVE * H; // top of the canvas (sky)
  const SPAN = H - TOP; // full vertical span
  const svgH = SPAN; // svg drawn taller than its box; overflows upward

  // map the template to absolute coordinates
  const center: RibbonNode[] = FLOW.map((n) => ({ x: cx + n.dx * u, y: TOP + n.t * SPAN, w: n.w * u }));
  const centerPts: Pt[] = center.map((n) => ({ x: n.x, y: n.y }));
  const centerPath = smoothPath(centerPts);

  const wash = (widthMul: number, dx: number, seed: number, jitter = 0): string => {
    const rnd = rng(seed);
    const nodes: RibbonNode[] = center.map((n) => ({
      x: n.x + dx + (rnd() - 0.5) * jitter,
      y: n.y + (rnd() - 0.5) * jitter,
      w: Math.max(1.5, n.w * widthMul),
    }));
    return ribbon(nodes);
  };

  const dispScale = Math.max(4, H * 0.028);
  const blurWater = Math.max(0.8, H * 0.0045);
  const blurSoft = Math.max(1.4, H * 0.012);
  const blurBig = Math.max(8, H * 0.06);

  const defs = (
    <defs>
      <filter id="wc-b" x="-50%" y="-15%" width="200%" height="130%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={dispScale} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation={blurWater} />
      </filter>
      <filter id="soft-b" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation={blurSoft} />
      </filter>
      <filter id="big-b" x="-90%" y="-90%" width="280%" height="280%">
        <feGaussianBlur stdDeviation={blurBig} />
      </filter>
      <linearGradient id="water-b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.indigo} />
        <stop offset="60%" stopColor={C.deep} />
        <stop offset="100%" stopColor={C.grayblue} />
      </linearGradient>
    </defs>
  );

  // pools where the flow catches on brush strokes (within the glyphs) + base
  const poolNodes = [center[6], center[8], center[10]];
  const pools = poolNodes.map((p, i) => (
    <g key={i}>
      <ellipse cx={p.x} cy={p.y} rx={p.w * 1.2} ry={p.w * 0.42} fill={C.grayblue} opacity="0.28" filter="url(#soft-b)" />
      {!reduced &&
        [0, 1].map((k) => (
          <ellipse
            key={k}
            className="ss-ripple"
            cx={p.x}
            cy={p.y}
            rx={p.w * 1.1}
            ry={p.w * 0.38}
            fill="none"
            stroke={C.hi}
            strokeWidth={Math.max(0.5, u * 0.01)}
            opacity="0"
            style={{ transformBox: "view-box", transformOrigin: `${p.x}px ${p.y}px`, animationDelay: `${i * 0.9 + k * 2.2}s` } as CSSProperties}
          />
        ))}
    </g>
  ));

  // distant mountain ridge (atmospheric perspective: faint, low, cool)
  const ridge = (baseY: number, peak: number, fill: string, op: number, key: number) => {
    const d = `M ${-0.15 * W} ${baseY} C ${0.16 * W} ${baseY - peak} ${0.32 * W} ${baseY - peak * 0.55} ${0.5 * W} ${
      baseY - peak * 0.82
    } S ${0.84 * W} ${baseY - peak * 0.9} ${1.15 * W} ${baseY} Z`;
    return <path key={key} d={d} fill={fill} opacity={op} />;
  };

  const mistBand = (y: number, rx: number, op: number, key: number, delay: number) => (
    <ellipse
      key={key}
      className={reduced ? undefined : "ss-mist"}
      cx={W * 0.5}
      cy={y}
      rx={rx}
      ry={Math.max(3, H * 0.02)}
      fill={C.mist}
      opacity={op}
      style={reduced ? undefined : ({ "--o": op, animationDelay: `${delay}s` } as CSSProperties)}
    />
  );

  // red artist seal — a small cinnabar chop with abstract seal-script strokes
  const seal = (x: number, y: number, s: number, key: number, delay: number) => (
    <g
      key={key}
      className={reduced ? undefined : "ss-seal"}
      style={reduced ? undefined : { animationDelay: `${delay}s` }}
      transform={`translate(${x} ${y}) rotate(-2)`}
    >
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.1} fill={C.seal} opacity="0.9" />
      <g stroke="#f7e7e2" strokeWidth={Math.max(0.5, s * 0.055)} opacity="0.92" strokeLinecap="round" fill="none">
        <path d={`M ${-0.22 * s} ${-0.26 * s} V ${0.26 * s} M ${0.22 * s} ${-0.26 * s} V ${0.26 * s}`} />
        <path d={`M ${-0.22 * s} ${-0.26 * s} H ${0.22 * s} M ${-0.22 * s} ${0.02 * s} H ${0.22 * s} M 0 ${0.02 * s} V ${0.26 * s}`} />
      </g>
    </g>
  );

  const back = (
    <svg
      viewBox={`0 ${TOP} ${W} ${svgH}`}
      width={W}
      height={svgH}
      fill="none"
      className="absolute bottom-0 right-0 block overflow-visible"
      aria-hidden
    >
      {defs}

      {/* faint atmospheric ink wash for depth (kept low so it never dominates) */}
      <g filter="url(#big-b)">
        <ellipse cx={cx} cy={H * 0.66} rx={u * 0.95} ry={H * 0.42} fill={C.deep} opacity="0.08" />
        <ellipse cx={cx - u * 0.2} cy={TOP + SPAN * 0.2} rx={u * 1.1} ry={H * 0.36} fill={C.indigo} opacity="0.055" />
      </g>

      {/* distant mountains, high + faint */}
      <g filter="url(#soft-b)">
        {ridge(TOP + SPAN * 0.2, H * 0.34, C.mountainFar, 0.16, 1)}
        {ridge(TOP + SPAN * 0.27, H * 0.22, C.mountain, 0.2, 2)}
      </g>

      {/* drifting mist through the sky */}
      {mistBand(TOP + SPAN * 0.1, W * 0.4, 0.13, 1, 0)}
      {mistBand(TOP + SPAN * 0.32, W * 0.46, 0.1, 2, 4)}
      {mistBand(TOP + SPAN * 0.5, W * 0.42, 0.08, 3, 8)}

      {/* ink cloud the water is born from */}
      <g filter="url(#soft-b)">
        <ellipse cx={cx} cy={TOP + SPAN * 0.03} rx={u * 0.5} ry={u * 0.24} fill={C.cloud} opacity="0.55" />
        <ellipse cx={cx - u * 0.2} cy={TOP + SPAN * 0.01} rx={u * 0.36} ry={u * 0.16} fill={C.indigo} opacity="0.35" />
      </g>

      {/* distant pines up in the mist (small, cool, faint) */}
      <Pine x={cx - u * 0.5} y={TOP + SPAN * 0.34} h={H * 0.22} lean={1} seed={61} reduced={reduced} delay={0.1} far op={0.5} />
      <Pine x={cx + u * 0.35} y={TOP + SPAN * 0.46} h={H * 0.16} lean={-1} seed={62} reduced={reduced} delay={0.2} far op={0.42} />

      {/* WATER — layered watercolor washes under one displacement filter */}
      <g className={reduced ? undefined : "ss-wash"} filter="url(#wc-b)">
        <path d={wash(1.35, u * 0.02, 31, u * 0.05)} fill={C.deep} opacity="0.3" />
        <path d={wash(1.0, u * 0.04, 42)} fill="url(#water-b)" opacity="0.4" />
        <path d={wash(0.6, -u * 0.05, 53, u * 0.03)} fill={C.grayblue} opacity="0.4" />
        <path d={wash(0.24, 0, 67)} fill={C.hi} opacity="0.32" />
      </g>
      <g filter="url(#soft-b)">{pools}</g>

      {/* flowing pigment travelling the centerline */}
      {!reduced &&
        [0, 1].map((i) => (
          <ellipse key={i} rx={u * 0.1} ry={u * 0.06} fill={C.hi} opacity="0" filter="url(#soft-b)">
            <animateMotion dur="9s" begin={`${i * 4.5}s`} repeatCount="indefinite" path={centerPath} />
            <animate attributeName="opacity" values="0;0.4;0.3;0" keyTimes="0;0.2;0.85;1" dur="9s" begin={`${i * 4.5}s`} repeatCount="indefinite" />
          </ellipse>
        ))}

      {/* TREES — pines climbing from the base, varied scale (vertical journey) */}
      <Pine x={cx - u * 0.18} y={H} h={H * 1.15} lean={-1} seed={7} reduced={reduced} delay={0.3} />
      <Pine x={cx + u * 0.12} y={H} h={H * 0.62} lean={1} seed={14} reduced={reduced} delay={0.5} />
      <Pine x={cx - u * 0.05} y={H * 0.78} h={H * 0.34} lean={1} seed={21} reduced={reduced} delay={0.7} />
      <Pine x={cx + u * 0.08} y={H * 0.46} h={H * 0.26} lean={-1} seed={34} reduced={reduced} delay={0.9} />
      <Pine x={cx + u * 0.22} y={H * 0.12} h={H * 0.18} lean={1} seed={48} reduced={reduced} delay={1.0} />

      {/* seals — one by the upper glyph, one at the base pool */}
      {seal(cx - u * 0.62, H * 0.06, u * 0.24, 1, 1.1)}
      {seal(cx + u * 0.36, H * 0.93, u * 0.2, 2, 1.35)}
    </svg>
  );

  // foreground branches crossing in front of the strokes (integrate w/ type)
  const front = (
    <svg
      viewBox={`0 ${TOP} ${W} ${svgH}`}
      width={W}
      height={svgH}
      fill="none"
      className="absolute bottom-0 right-0 block overflow-visible"
      aria-hidden
    >
      <ForeBranch base={{ x: cx - u * 0.12, y: H * 0.62 }} len={u * 0.95} up={u * 0.55} lean={1} seed={12} reduced={reduced} delay={1.2} />
      <ForeBranch base={{ x: cx + u * 0.06, y: H * 0.3 }} len={u * 0.72} up={u * 0.42} lean={-1} seed={24} reduced={reduced} delay={1.4} />
    </svg>
  );

  return { w: W, back, front };
}

// ── pine bonsai ─────────────────────────────────────────────────────────────
function Pine({
  x,
  y,
  h,
  lean,
  seed,
  reduced,
  delay = 0,
  far = false,
  op = 1,
}: {
  x: number;
  y: number;
  h: number;
  lean: number;
  seed: number;
  reduced: boolean;
  delay?: number;
  far?: boolean;
  op?: number;
}) {
  const rnd = rng(seed);
  const trunkCol = far ? C.trunkFar : C.trunk;
  const segs = 6;
  const pts: Pt[] = [];
  for (let i = 0; i <= segs; i++) {
    const f = i / segs;
    const bend = Math.sin(f * Math.PI * 0.9) * lean * h * 0.14;
    pts.push({ x: x + bend + (rnd() - 0.5) * h * 0.05, y: y - f * h });
  }
  const trunk = smoothPath(pts);
  const tw = Math.max(1, h * 0.022);

  const sample = (t: number): Pt => {
    const f = t * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(f));
    const k = f - i;
    return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * k, y: pts[i].y + (pts[i + 1].y - pts[i].y) * k };
  };

  const branchAt = [0.46, 0.62, 0.76, 0.88, 0.97];
  const branches: ReactNode[] = branchAt.map((bt, i) => {
    const b = sample(bt);
    const side = i % 2 === 0 ? 1 : -1;
    const L = h * (0.14 + 0.18 * (1 - bt));
    const tip = { x: b.x + side * L, y: b.y - L * 0.55 };
    const mid = { x: b.x + side * L * 0.5, y: b.y - L * 0.08 };
    const d = smoothPath([b, mid, tip]);
    return (
      <g key={i}>
        <path d={d} stroke={trunkCol} strokeWidth={Math.max(0.7, tw * 0.5)} strokeLinecap="round" fill="none" opacity="0.9" />
        <Foliage cx={tip.x} cy={tip.y} s={h * 0.11} seed={seed + i} far={far} />
      </g>
    );
  });

  const crown = sample(1);
  const pivot = { transformBox: "view-box", transformOrigin: `${x}px ${y}px` } as CSSProperties;
  const inner = (
    <g className={reduced ? undefined : "ss-sway"} style={pivot}>
      <path d={trunk} stroke={trunkCol} strokeWidth={tw} strokeLinecap="round" fill="none" />
      {branches}
      <Foliage cx={crown.x} cy={crown.y} s={h * 0.12} seed={seed + 9} far={far} />
    </g>
  );

  const wrapped = reduced ? (
    inner
  ) : (
    <g className="ss-grow" style={{ ...pivot, animationDelay: `${delay}s` }}>
      {inner}
    </g>
  );
  return op < 1 ? <g opacity={op}>{wrapped}</g> : wrapped;
}

// A single foreground branch with foliage (front of the calligraphy).
function ForeBranch({
  base,
  len,
  up,
  lean,
  seed,
  reduced,
  delay,
}: {
  base: Pt;
  len: number;
  up: number;
  lean: number;
  seed: number;
  reduced: boolean;
  delay: number;
}) {
  const tip = { x: base.x + lean * len, y: base.y - up };
  const mid = { x: base.x + lean * len * 0.5, y: base.y - up * 0.2 };
  const d = smoothPath([base, mid, tip]);
  const pivot = { transformBox: "view-box", transformOrigin: `${base.x}px ${base.y}px` } as CSSProperties;
  const inner = (
    <g className={reduced ? undefined : "ss-sway"} style={pivot}>
      <path d={d} stroke={C.trunk} strokeWidth={Math.max(1, len * 0.035)} strokeLinecap="round" fill="none" opacity="0.9" />
      <Foliage cx={tip.x} cy={tip.y} s={len * 0.2} seed={seed} />
      <Foliage cx={mid.x} cy={mid.y - up * 0.12} s={len * 0.15} seed={seed + 3} />
    </g>
  );
  if (reduced) return inner;
  return (
    <g className="ss-grow" style={{ ...pivot, animationDelay: `${delay}s` }}>
      {inner}
    </g>
  );
}

// Sparse pine-needle cluster: a soft celadon mass with a few radiating needles.
function Foliage({ cx, cy, s, seed, far = false }: { cx: number; cy: number; s: number; seed: number; far?: boolean }) {
  const rnd = rng(seed);
  const col = far ? C.needleFar : C.needle;
  const needles = Array.from({ length: far ? 4 : 6 }, () => -120 + rnd() * 130);
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={s * 1.5} ry={s * 0.9} fill={col} opacity={far ? 0.12 : 0.16} filter="url(#soft-b)" />
      <g stroke={col} strokeWidth={Math.max(0.45, s * 0.07)} strokeLinecap="round" opacity={far ? 0.4 : 0.62}>
        {needles.map((deg, i) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const len = s * (0.9 + rnd() * 0.5);
          return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(rad) * len} y2={cy + Math.sin(rad) * len} />;
        })}
      </g>
    </g>
  );
}
