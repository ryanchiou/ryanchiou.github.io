import { useEffect, useRef, useState } from "react";
import bodySrc from "@/assets/elements/corgi/body.webp";
import tailSrc from "@/assets/elements/corgi/tail.webp";
import earLSrc from "@/assets/elements/corgi/ear-l.webp";
import earRSrc from "@/assets/elements/corgi/ear-r.webp";
import jawSrc from "@/assets/elements/corgi/jaw.webp";
import eyesBlinkSrc from "@/assets/elements/corgi/eyes-blink.webp";
import eyesHappySrc from "@/assets/elements/corgi/eyes-happy.webp";
import ballSrc from "@/assets/elements/corgi/ball.webp";
import grassSrc from "@/assets/elements/corgi/grass.webp";
import grassFrontSrc from "@/assets/elements/corgi/grass-front.webp";
import { BALL_SPOTS, bounceBall } from "./ballBounce";
import "./CorgiHero.css";

const HAPPY_MS = 1600; // happy eyes + quick wag after a pet
const BALL_HIT = { left: 7.58, top: 77.03 }; // the ball's click target at its painted spot (canvas %)

/**
 * The sitting watercolor corgi from corgi.png on a painted patch of grass, cut
 * into layers (see scripts/corgi-layers.py) so small parts can move: the tail
 * wags, the jaw pants, the eyes blink and an ear flicks now and then. Petting
 * him squints his eyes happily and speeds up the wag; clicking the ball bounces
 * it (see ballBounce.ts) while he watches, ears up and tail going.
 */
export function CorgiHero({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const happyTimer = useRef(0);
  const ballHitRef = useRef<HTMLButtonElement>(null);
  const ballXRef = useRef<HTMLSpanElement>(null);
  const ballGroundRef = useRef<HTMLSpanElement>(null);
  const ballYRef = useRef<HTMLSpanElement>(null);
  const ballRef = useRef<HTMLImageElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const ball = useRef({ spot: 0, rotation: 0, bouncing: false });
  const [happy, setHappy] = useState(false);

  // Idle life: a blink every few seconds (sometimes a double), an ear flick now and then.
  useEffect(() => {
    const root = rootRef.current;
    const pending = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        pending.delete(id);
        fn();
      }, ms);
      pending.add(id);
    };
    if (root && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const blink = () => {
        root.dataset.blink = "true";
        later(() => (root.dataset.blink = "false"), 130);
        later(blink, Math.random() < 0.2 ? 320 : 2400 + Math.random() * 3600);
      };
      const flick = () => {
        root.dataset.flick = Math.random() < 0.5 ? "l" : "r";
        later(() => (root.dataset.flick = ""), 360);
        later(flick, 3500 + Math.random() * 5000);
      };
      later(blink, 1800);
      later(flick, 2600);
    }
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
      window.clearTimeout(happyTimer.current);
    };
  }, []);

  const pet = () => {
    setHappy(true);
    window.clearTimeout(happyTimer.current);
    happyTimer.current = window.setTimeout(() => setHappy(false), HAPPY_MS);
  };

  // Pop the ball up; it hops over to its other resting spot. A ball in the air
  // can't be clicked again, so clicks mid-bounce are ignored.
  const bounce = () => {
    const root = rootRef.current, hit = ballHitRef.current, state = ball.current;
    const parts = { x: ballXRef.current, ground: ballGroundRef.current, y: ballYRef.current, ball: ballRef.current, shadow: shadowRef.current };
    if (!root || !hit || state.bouncing || Object.values(parts).some((el) => !el)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = 1 - state.spot;
    state.bouncing = true;
    root.dataset.bounce = "true";
    bounceBall(parts as Parameters<typeof bounceBall>[0], state.spot, to, state.rotation)
      .then((rotation) => {
        state.spot = to;
        state.rotation = rotation;
        hit.style.left = `${BALL_HIT.left + BALL_SPOTS[to].x}%`;
        hit.style.top = `${BALL_HIT.top + BALL_SPOTS[to].y}%`;
      })
      .catch(() => {}) // cancelled by unmount
      .finally(() => {
        state.bouncing = false;
        root.dataset.bounce = "false";
      });
  };

  // className positions the wrapper; .corgi keeps its own (unlayered) sizing.
  return (
    <div className={className}>
      <div ref={rootRef} className="corgi" data-happy={happy}>
        <button type="button" className="corgi__hit" aria-label="Pet the corgi" onClick={pet} />
        <button ref={ballHitRef} type="button" className="corgi__ball-hit" aria-label="Bounce the tennis ball" onClick={bounce} />
        <div className="corgi__art" aria-hidden="true">
          <img src={grassSrc} alt="" draggable={false} />
          <img className="corgi__tail" src={tailSrc} alt="" draggable={false} />
          <img src={bodySrc} alt="" draggable={false} />
          <img className="corgi__ear corgi__ear--l" src={earLSrc} alt="" draggable={false} />
          <img className="corgi__ear corgi__ear--r" src={earRSrc} alt="" draggable={false} />
          <img className="corgi__jaw" src={jawSrc} alt="" draggable={false} />
          <img className="corgi__eyes corgi__eyes--blink" src={eyesBlinkSrc} alt="" draggable={false} />
          <img className="corgi__eyes corgi__eyes--happy" src={eyesHappySrc} alt="" draggable={false} />
          <span ref={ballXRef} className="corgi__ball-layer">
            <span ref={ballGroundRef} className="corgi__ball-layer">
              <span ref={shadowRef} className="corgi__ball-shadow" />
            </span>
            <span ref={ballYRef} className="corgi__ball-layer">
              <img ref={ballRef} className="corgi__ball" src={ballSrc} alt="" draggable={false} />
            </span>
          </span>
          <img src={grassFrontSrc} alt="" draggable={false} />
        </div>
      </div>
    </div>
  );
}
