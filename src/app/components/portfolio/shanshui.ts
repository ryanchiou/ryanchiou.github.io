// Geometry helpers for the shan-shui (山水) hero artwork. Pure math only — given
// the measured calligraphy box these build the organic SVG path strings for the
// watercolor stream and the pine bonsai, so the composition stays responsive and
// art-directed around the actual character positions.

export type Pt = { x: number; y: number };

// Deterministic PRNG so a given seed always yields the same "hand-drawn" forms.
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Catmull-Rom → cubic-bezier segments through the points (no leading move).
function curveThrough(pts: Pt[]): string {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${r(c1x)} ${r(c1y)} ${r(c2x)} ${r(c2y)} ${r(p2.x)} ${r(p2.y)}`;
  }
  return d;
}

const r = (n: number) => Math.round(n * 10) / 10;

// Smooth open path through points.
export function smoothPath(pts: Pt[]): string {
  if (pts.length < 2) return "";
  return `M ${r(pts[0].x)} ${r(pts[0].y)}${curveThrough(pts)}`;
}

// A closed "ribbon": a centerline of nodes, each with a half-width, turned into a
// soft filled band that widens and narrows. Used for the layered water washes.
export type RibbonNode = Pt & { w: number };
export function ribbon(nodes: RibbonNode[]): string {
  if (nodes.length < 2) return "";
  const left = nodes.map((n) => ({ x: n.x - n.w / 2, y: n.y }));
  const right = nodes.map((n) => ({ x: n.x + n.w / 2, y: n.y })).reverse();
  return (
    `M ${r(left[0].x)} ${r(left[0].y)}` +
    curveThrough(left) +
    ` L ${r(right[0].x)} ${r(right[0].y)}` +
    curveThrough(right) +
    " Z"
  );
}

// Sample a point + tangent-side offset along a node list at parameter t (0..1),
// linearly between nodes (good enough for placing pools / tree roots on the flow).
export function sampleNodes(nodes: Pt[], t: number): Pt {
  const f = Math.max(0, Math.min(1, t)) * (nodes.length - 1);
  const i = Math.min(nodes.length - 2, Math.floor(f));
  const k = f - i;
  return {
    x: nodes[i].x + (nodes[i + 1].x - nodes[i].x) * k,
    y: nodes[i].y + (nodes[i + 1].y - nodes[i].y) * k,
  };
}
