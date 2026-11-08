import { column } from "./layout";

// The watercolor corgi in his sunset meadow (CorgiHero) used to sit beside this
// intro. It's set aside in CorgiHero.tsx for the About page.

export function HomeSection() {
  return (
    <section
      id="home"
      data-name="Home"
      className={`${column} flex min-h-[65vh] flex-col justify-center pb-12 pt-32 lg:pt-50`}
    >
      {/* Nav lives in the fixed ScrollNav. The hero is a one-sentence intro over
          a one-line subtitle. The min height holds the gallery down toward the
          bottom of the first screen, and the content is centered in the space
          between the nav and the gallery. */}
      {/* The headline tops out at 48px on laptops, then keeps growing with the
          window on big monitors (48px at 1920, 64px at 2560). Its width cap is
          in em so it wraps the same way at every size. */}
      <div className="min-w-0">
        <h1 className="text-balance font-serif text-[clamp(32px,3.4vw,48px)] font-normal leading-[1.25] tracking-[-0.03em] text-ink lg:max-w-[15em] 3xl:text-[min(2.5vw,72px)]">
          Ryan Chiou is a mechanical design engineer.
        </h1>

        <p className="mt-6 font-sans font-normal text-[14px] text-meta 3xl:text-[16px]">
          MechE @ UIUC <span className="mx-1.5 text-ink/25">/</span> Prev. Tesla, IBM
        </p>
      </div>
    </section>
  );
}
