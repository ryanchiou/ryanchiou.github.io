import { useEffect, useRef, type CSSProperties } from "react";
import layout from "@/assets/tiles_proj/hvbox/layers.json";
import "./HvboxExplode.css";

const urls = import.meta.glob<string>("@/assets/tiles_proj/hvbox/*.webp", {
  eager: true,
  import: "default",
});
const url = (name: string) =>
  Object.entries(urls).find(([path]) => path.endsWith(`/${name}.webp`))?.[1];

const [CW, CH] = layout.canvas;
const asm = layout.assembled;
// At rest the assembled box is centred and enlarged to read like the other
// tiles; exploding eases back to the full canvas.
const REST_ZOOM = 1.12;
const restShift = 50 - (asm.top + asm.height / 2);

/**
 * The HV enclosure, cut from its exploded render into part layers (see
 * scripts/hvbox-layers.py). It rests assembled and explodes while its card is
 * hovered or focused; touch screens get one explode as it scrolls into view.
 * Takes its parent's height and the render's aspect ratio (centre it with flex).
 */
export function HvboxExplode({ alt }: { alt: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        root.dataset.exploded = "true";
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="hvx"
      role="img"
      aria-label={alt}
      style={
        {
          aspectRatio: `${CW} / ${CH}`,
          "--rest-zoom": REST_ZOOM,
          "--rest-shift": `${restShift}%`,
        } as CSSProperties
      }
    >
      <div className="hvx__stage">
        {layout.layers.map((l) => (
          <img
            key={l.name}
            className="hvx__part"
            data-group={l.group}
            src={url(l.name)}
            alt=""
            draggable={false}
            style={
              {
                left: `${l.left}%`,
                top: `${l.top}%`,
                width: `${l.width}%`,
                height: `${l.height}%`,
                "--ax": `${l.ax}%`,
                "--ay": `${l.ay}%`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
