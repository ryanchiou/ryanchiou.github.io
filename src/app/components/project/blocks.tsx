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

   Blocks: P, Bullets, Specs (label/value rows), Table, Eq, Stats,
   Figure, FigureGrid. See robotArm.tsx for every one of them in use.

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

/** Headline numbers in a row: the big value over a short label. */
export function Stats({ items }: { items: { value: ReactNode; label: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-ink/10 py-6 sm:grid-cols-4">
      {items.map(({ value, label }, i) => (
        <div key={i} className="flex flex-col-reverse">
          <dt className="mt-2 text-[13px] leading-[1.4] text-meta">{label}</dt>
          <dd className="font-serif text-[26px] leading-none tracking-[-0.02em] text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** An equation on a white panel, with an optional "where …" line under it.
    Write it with Unicode and <i>/<sub>/<sup>, e.g. <i>Q</i> = <i>hA</i>Δ<i>T</i>. */
export function Eq({ children, where }: { children: ReactNode; where?: ReactNode }) {
  return (
    <div className="max-w-[680px] rounded-sm bg-white px-5 py-4">
      <div className="overflow-x-auto font-serif text-[17px] leading-[1.6] text-ink">{children}</div>
      {where && <p className="mt-2 text-[13px] leading-[1.55] text-meta">{where}</p>}
    </div>
  );
}

/** A data table under hairlines. The first column labels each row; `numeric`
    right-aligns the rest; `highlight` lifts rows (by index) onto white, e.g.
    the option that was chosen. Scrolls sideways on narrow screens. */
export function Table({
  head,
  rows,
  numeric = false,
  highlight = [],
  caption,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  numeric?: boolean;
  highlight?: number[];
  caption?: ReactNode;
}) {
  const cell = "px-3 py-2 align-top";
  const align = (col: number) => (numeric && col > 0 ? "text-right" : "text-left");
  return (
    <figure className="my-8 first:mt-0 last:mb-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-[14px] leading-[1.45] tabular-nums">
          <thead>
            <tr className="border-b border-ink/15">
              {head.map((h, c) => (
                <th key={c} scope="col" className={`${cell} ${align(c)} text-[12px] font-normal text-meta`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className={`border-b border-ink/10 ${highlight.includes(r) ? "bg-white" : ""}`}>
                {row.map((value, c) =>
                  c === 0 ? (
                    <th key={c} scope="row" className={`${cell} text-left font-normal text-ink`}>
                      {value}
                    </th>
                  ) : (
                    <td key={c} className={`${cell} ${align(c)}`}>
                      {value}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="pt-2 text-[12px] leading-[1.5] text-meta">{caption}</figcaption>}
    </figure>
  );
}

/** An image on a white panel, like the gallery tiles, with an optional
    caption. CAD renders on white (the default) sit centered with a margin
    (`scale`, % of the panel); photos can `fill` the panel instead; plots,
    diagrams and screenshots read best `natural`: full width at their own
    aspect ratio (`inset` adds white padding, in px). For `natural`, set
    `aspect` to the image's "width / height" in pixels so the page doesn't
    shift while it loads (which throws off links to sections below it). */
export function Figure({
  src,
  alt,
  caption,
  aspect,
  scale = 80,
  fill = false,
  natural = false,
  inset = 0,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  /** CSS aspect-ratio of the panel. */
  aspect?: string;
  scale?: number;
  fill?: boolean;
  natural?: boolean;
  inset?: number;
}) {
  return (
    // Extra air around figures; the margins collapse with the body's spacing.
    <figure className="my-10 first:mt-0 last:mb-0">
      {natural ? (
        <div className="overflow-hidden rounded-sm bg-white" style={{ padding: inset }}>
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="block h-auto w-full select-none object-contain"
            style={{ aspectRatio: aspect }}
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center overflow-hidden rounded-sm bg-white"
          style={{ aspectRatio: aspect ?? "16 / 9" }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={fill ? "h-full w-full object-cover" : "select-none object-contain"}
            style={fill ? undefined : { maxWidth: `${scale}%`, maxHeight: `${scale}%` }}
          />
        </div>
      )}
      {caption && (
        <figcaption className="pt-2 text-[12px] leading-[1.5] text-meta">{caption}</figcaption>
      )}
    </figure>
  );
}

/** Two or three images side by side (stacked on phones) under one caption,
    each on its own white panel of the same shape, gapped like the gallery. */
export function FigureGrid({
  items,
  caption,
  aspect = "4 / 3",
  scale = 90,
  fill = false,
}: {
  items: { src: string; alt: string }[];
  caption?: ReactNode;
  aspect?: string;
  scale?: number;
  fill?: boolean;
}) {
  return (
    <figure className="my-10 first:mt-0 last:mb-0">
      <div className={`grid gap-2 ${items.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {items.map(({ src, alt }) => (
          <div
            key={src}
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
        ))}
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
