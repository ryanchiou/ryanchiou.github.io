/**
 * The tennis ball's bounce. A click pops it straight up from rest; it lands
 * where it started, and that first impact (spin, uneven grass) kicks it toward
 * its other resting spot in two shrinking hops and a short roll. The next click
 * sends it back, so it stays on the grass.
 *
 * Offsets are canvas percentages from where the ball is painted (see
 * scripts/corgi-layers.py). The parts are nested full-canvas layers so each
 * axis can ease on its own: x travels steadily while y rises and falls.
 */
export const BALL_SPOTS = [
  { x: 0, y: 0 },         // beside him, where it's painted
  { x: 23.3, y: 3.71 },   // in front of his paws (lower: it's nearer to us)
];

export type BallParts = {
  x: HTMLElement;       // horizontal travel (ball + shadow)
  ground: HTMLElement;  // the shadow's ground line
  y: HTMLElement;       // ground line + hop height
  ball: HTMLElement;    // rotation about its own centre
  shadow: HTMLElement;  // shrinks while the ball is up
};

const ROLL_DEG = 240;  // the trip's distance / ball radius, in degrees
const HOP = [20, 8, 3]; // hop heights, % of canvas height: the pop, then two kicks
// Flight time goes as sqrt(height); the roll eases out to a stop.
const MS = { hop1: 560, hop2: 340, hop3: 210, roll: 380 };
const TOTAL = MS.hop1 + MS.hop2 + MS.hop3 + MS.roll;
const at = (ms: number) => ms / TOTAL;
const T = {
  apex1: at(MS.hop1 / 2),
  land1: at(MS.hop1),
  apex2: at(MS.hop1 + MS.hop2 / 2),
  land2: at(MS.hop1 + MS.hop2),
  apex3: at(MS.hop1 + MS.hop2 + MS.hop3 / 2),
  land3: at(MS.hop1 + MS.hop2 + MS.hop3),
};
const RISE = "cubic-bezier(.2, .6, .35, 1)"; // slowing toward the top
const FALL = "cubic-bezier(.6, 0, .85, .4)"; // speeding toward the ground
const ROLL = "cubic-bezier(.25, .6, .4, 1)";

export const BOUNCE_MS = TOTAL;

/** Bounce from one spot to the other; resolves when the ball is at rest. */
export function bounceBall(parts: BallParts, from: number, to: number, rotation: number) {
  const a = BALL_SPOTS[from], b = BALL_SPOTS[to];
  const dx = b.x - a.x, dy = b.y - a.y;
  const spin = Math.sign(dx) * ROLL_DEG; // rolling right turns it clockwise
  // horizontal progress at each landing: none on the pop, then most of the way
  const along = (f: number) => ({ x: a.x + f * dx, ground: a.y + f * dy, rot: rotation + f * spin });
  const p2 = along(0.55), p3 = along(0.8), end = along(1);
  const tx = (v: number) => `translateX(${v}%)`;
  const ty = (v: number) => `translateY(${v}%)`;
  const rot = (v: number) => `rotate(${v}deg)`;

  // Rest at the destination once the animations end (they don't fill).
  parts.x.style.transform = tx(end.x);
  parts.ground.style.transform = ty(end.ground);
  parts.y.style.transform = ty(end.ground);
  parts.ball.style.transform = rot(end.rot);

  // x, the shadow's ground line and the roll share one timeline: still during
  // the pop, steady through the kicked hops, easing out as it rolls to a stop.
  const travel = (v: (p: { x: number; ground: number; rot: number }) => string) => [
    { offset: 0, transform: v(along(0)) },
    { offset: T.land1, transform: v(along(0)), easing: "linear" },
    { offset: T.land2, transform: v(p2), easing: "linear" },
    { offset: T.land3, transform: v(p3), easing: ROLL },
    { offset: 1, transform: v(end) },
  ];
  const timing = { duration: TOTAL };
  const runs = [
    parts.x.animate(travel((p) => tx(p.x)), timing),
    parts.ground.animate(travel((p) => ty(p.ground)), timing),
    parts.ball.animate(travel((p) => rot(p.rot)), timing),
    parts.y.animate([
      { offset: 0, transform: ty(a.y), easing: RISE },
      { offset: T.apex1, transform: ty(a.y - HOP[0]), easing: FALL },
      { offset: T.land1, transform: ty(a.y), easing: RISE },
      { offset: T.apex2, transform: ty(along(0.275).ground - HOP[1]), easing: FALL },
      { offset: T.land2, transform: ty(p2.ground), easing: RISE },
      { offset: T.apex3, transform: ty(along(0.675).ground - HOP[2]), easing: FALL },
      { offset: T.land3, transform: ty(p3.ground), easing: ROLL },
      { offset: 1, transform: ty(end.ground) },
    ], timing),
    parts.shadow.animate([
      { offset: 0, transform: "scale(1)", opacity: 1, easing: RISE },
      { offset: T.apex1, transform: "scale(.5)", opacity: 0.35, easing: FALL },
      { offset: T.land1, transform: "scale(1)", opacity: 1, easing: RISE },
      { offset: T.apex2, transform: "scale(.8)", opacity: 0.75, easing: FALL },
      { offset: T.land2, transform: "scale(1)", opacity: 1, easing: RISE },
      { offset: T.apex3, transform: "scale(.93)", opacity: 0.92, easing: FALL },
      { offset: T.land3, transform: "scale(1)", opacity: 1 },
      { offset: 1, transform: "scale(1)", opacity: 1 },
    ], timing),
  ];
  return Promise.all(runs.map((run) => run.finished)).then(() => end.rot);
}
