import { CalligraphyWriter } from "./CalligraphyWriter";

const metaRows = [
  { label: "Location:", value: "san francisco bay area" },
  { label: "Current:", value: "b.s. mechanical engineering @ uiuc" },
];

export function HomeSection() {
  return (
    <section
      id="home"
      data-name="Home"
      className="relative flex min-h-[92vh] w-full flex-col bg-panel px-[8%] py-10 sm:px-[10%] lg:px-[12%]"
    >
      {/* Nav lives in the fixed ScrollNav; the hero only holds the name block. */}

      {/* Hero row — anchored toward the bottom */}
      <div className="flex flex-1 items-end pb-[18vh]">
        {/* The content block is the only in-flow child, so it defines the row's
            height. The calligraphy is absolutely positioned (top-0/bottom-0) so
            its height equals that block exactly, and the image derives its own
            width from its natural 1:3 ratio. */}
        <div className="relative w-full">
          {/* Content block — the Le-Labo-style self-describing label */}
          <div className="max-w-[640px]">
            <h1 className="font-display text-[48px] font-bold leading-none text-white max-[600px]:text-[32px]">
              Ryan Chiou
            </h1>
            <p className="mt-5 font-mono text-[14px] uppercase tracking-[0.18em] text-meta">
              Mechanical Engineer / Designer
            </p>
            <p className="mt-3 font-mono text-[14px] tracking-[0.1em] text-meta-bright">
              IBM / Tesla / tally
            </p>

            <dl className="mt-10 space-y-3">
              {metaRows.map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-x-5">
                  <dt className="w-[80px] shrink-0 font-condensed font-medium text-[16px] tracking-wide text-white sm:w-[92px]">
                    {label}
                  </dt>
                  <dd className="min-w-0 font-mono text-[13px] lowercase text-meta sm:text-[14px]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Calligraphy 邱永建 — height matched to the content block (desktop) */}
          <CalligraphyWriter className="absolute bottom-0 right-0 top-0 hidden flex-col items-end justify-center select-none md:flex" />
        </div>
      </div>

      {/* Calligraphy — scaled down, centered below content (mobile) */}
      <CalligraphyWriter className="mb-[6vh] flex h-[220px] flex-col items-center justify-center select-none md:hidden" />
    </section>
  );
}
