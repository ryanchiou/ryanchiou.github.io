import type { ReactNode } from "react";

/* ── Write-up blocks ───────────────────────────────────────────────
   What a section's `body` is made of. A body is a fragment of these,
   stacked with even spacing:

     body: (
       <>
         <P>The arm has to reach every face of a part on a 300 mm turntable…</P>
         <Specs rows={[["Reach", "600 mm"], ["Payload", "1.2 kg"]]} />
         <Figure src={reachPlot} alt="Reach envelope" caption="Reach envelope vs. link ratio" />
       </>
     ),

   Import images at the top of the project file
   (import reachPlot from "@/assets/projects/robot-arm/reach.png"). */

/** A paragraph of running text. */
export function P({ children }: { children: ReactNode }) {
  return <p className="max-w-[680px] text-pretty">{children}</p>;
}

/** A bulleted list. */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="max-w-[680px] list-disc space-y-1.5 pl-5 marker:text-ink/30">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** Label → value rows under hairlines: design criteria, specs, results. */
export function Specs({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="max-w-[680px] border-t border-ink/10 text-[15px]">
      {rows.map(([label, value], i) => (
        <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-6 border-b border-ink/10 py-2.5">
          <dt className="text-meta">{label}</dt>
          <dd className="text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** An image on a white panel, like the gallery tiles, with an optional
    caption. CAD renders on white (the default) sit centered with a margin
    (`scale`, % of the panel); photos and plots can `fill` the panel instead. */
export function Figure({
  src,
  alt,
  caption,
  aspect = "16 / 9",
  scale = 80,
  fill = false,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  /** CSS aspect-ratio of the panel. */
  aspect?: string;
  scale?: number;
  fill?: boolean;
}) {
  return (
    // Extra air around figures; the margins collapse with the body's spacing.
    <figure className="my-10 first:mt-0 last:mb-0">
      <div
        className="flex items-center justify-center overflow-hidden rounded-sm bg-white"
        style={{ aspectRatio: aspect }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={fill ? "h-full w-full object-cover" : "select-none object-contain"}
          style={fill ? undefined : { maxWidth: `${scale}%`, maxHeight: `${scale}%` }}
        />
      </div>
      {caption && (
        <figcaption className="pt-2 text-[12px] leading-[1.5] text-meta">{caption}</figcaption>
      )}
    </figure>
  );
}

/** Stand-in for a block that hasn't been written yet. */
export function Placeholder() {
  return (
    <div className="flex min-h-[148px] items-center justify-center rounded-sm border border-dashed border-ink/15 px-6 text-[13px] text-meta">
      Write-up in progress
    </div>
  );
}
