import { column } from "./layout";

// The watercolor corgi (CorgiHero) used to sit on the right of this intro.
// It's kept in CorgiHero.tsx to be placed somewhere else later.

export function HomeSection() {
  return (
    <section
      id="home"
      data-name="Home"
      className={`${column} flex min-h-[71vh] flex-col justify-center pb-12 pt-32 lg:pt-50`}
    >
      {/* Nav lives in the fixed ScrollNav. The hero is a one-sentence intro over
          a one-line subtitle. The min height holds the gallery down toward the
          bottom of the first screen, and the content is centered in the space
          between the nav and the gallery. */}
      <div className="min-w-0 lg:max-w-[720px]">
        <h1 className="text-balance font-serif text-[clamp(32px,3.4vw,48px)] font-normal leading-[1.25] tracking-[-0.03em] text-ink">
          Ryan Chiou is a mechanical design engineer.
        </h1>

        <p className="mt-6 font-sans font-normal text-[14px] text-meta">
          MechE @ UIUC <span className="mx-1.5 text-ink/25">/</span> Prev. Tesla, IBM
        </p>
      </div>
    </section>
  );
}
