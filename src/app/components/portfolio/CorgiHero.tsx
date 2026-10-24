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
import "./CorgiHero.css";

const HAPPY_MS = 1600; // happy eyes + quick wag after a pet

/**
 * The sitting watercolor corgi from corgi.png on a painted patch of grass, cut
 * into layers (see scripts/corgi-layers.py) so small parts can move: the tail
 * wags, the jaw pants, the eyes blink and an ear flicks now and then. Petting
 * him squints his eyes happily and speeds up the wag.
 */
export function CorgiHero({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const happyTimer = useRef(0);
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

  // className positions the wrapper; .corgi keeps its own (unlayered) sizing.
  return (
    <div className={className}>
      <div ref={rootRef} className="corgi" data-happy={happy}>
        <button type="button" className="corgi__hit" aria-label="Pet the corgi" onClick={pet} />
        <div className="corgi__art" aria-hidden="true">
          <img src={grassSrc} alt="" draggable={false} />
          <img className="corgi__tail" src={tailSrc} alt="" draggable={false} />
          <img src={bodySrc} alt="" draggable={false} />
          <img className="corgi__ear corgi__ear--l" src={earLSrc} alt="" draggable={false} />
          <img className="corgi__ear corgi__ear--r" src={earRSrc} alt="" draggable={false} />
          <img className="corgi__jaw" src={jawSrc} alt="" draggable={false} />
          <img className="corgi__eyes corgi__eyes--blink" src={eyesBlinkSrc} alt="" draggable={false} />
          <img className="corgi__eyes corgi__eyes--happy" src={eyesHappySrc} alt="" draggable={false} />
          <img src={ballSrc} alt="" draggable={false} />
          <img src={grassFrontSrc} alt="" draggable={false} />
        </div>
      </div>
    </div>
  );
}
