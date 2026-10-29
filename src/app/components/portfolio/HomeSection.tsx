import { CorgiHero } from "./CorgiHero";
import { column } from "./layout";

export function HomeSection() {
  return (
    <section
      id="home"
      data-name="Home"
      className={`${column} flex min-h-[77vh] flex-col justify-center pb-12 pt-32 lg:pt-50`}
    >
      {/* Nav lives in the fixed ScrollNav. The hero is a one-sentence intro over
          a one-line subtitle, with the corgi on the right (desktop) or above
          the text (tablet and phone). The min height holds the gallery down
          toward the bottom of the first screen, and the content is centered in
          the space between the nav and the gallery. */}
      <div className="flex flex-col-reverse gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="min-w-0 lg:max-w-[720px]">
          <h1 className="text-balance font-serif text-[clamp(32px,3.4vw,48px)] font-normal leading-[1.25] tracking-[-0.03em] text-ink">
            Ryan Chiou is a mechanical design engineer.
          </h1>

          <p className="mt-6 font-sans font-normal text-[14px] text-meta">
            MechE @ UIUC <span className="mx-1.5 text-ink/25">/</span> Prev. Tesla, IBM
          </p>
        </div>

        {/* On desktop the row is bottom-aligned, so the corgi sits on the
            subtitle's baseline. */}
        <div className="shrink-0">
          <CorgiHero />
        </div>
      </div>
    </section>
  );
}
