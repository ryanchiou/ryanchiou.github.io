import { Fragment, useMemo, type ReactNode } from "react";
import { Link } from "@/app/router";
import { column } from "@/app/components/portfolio/layout";
import { findTile } from "@/app/components/portfolio/ProjectGallery";
import { caseStudies, caseStudyHref } from "@/app/projects";
import { Placeholder } from "./blocks";
import { SectionNav, type NavGroup } from "./SectionNav";
import { sectionId, type CaseStudy } from "./types";

type Tile = NonNullable<ReturnType<typeof findTile>>;

/* A project's page, laid out like a case study: the sticky section nav on
   the left, and in the column beside it the hero art, the title, then the
   write-up section by section, ending on a link to the next project. Below
   lg the side nav is dropped and the column runs full width. */
export function ProjectPage({ study }: { study: CaseStudy }) {
  const tile = findTile(study.tile);
  const groups = useMemo<NavGroup[]>(
    () =>
      study.sections.map((section) => ({
        id: sectionId(section),
        title: section.title,
        children: (section.subsections ?? []).map((sub) => ({
          id: sectionId(sub),
          title: sub.title,
        })),
      })),
    [study],
  );

  return (
    <article data-name="Project" className={`${column} pb-32 pt-28 lg:pt-32`}>
      <div className="lg:grid lg:grid-cols-[168px_minmax(0,1fr)] lg:gap-x-16">
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
          <SectionNav groups={groups} />
        </aside>

        {/* Capped so the hero and write-up keep a readable size on big
            monitors, where the page column keeps widening (no effect on a
            1440px laptop, where the column is already narrower). */}
        <div className="min-w-0 lg:max-w-[1120px]">
          <Hero study={study} tile={tile} />
          <Header study={study} tile={tile} />

          <div className="font-sans text-[16px] leading-[1.7] text-meta-bright">
            {study.sections.map((section) => {
              const subsections = section.subsections ?? [];
              return (
                <section
                  key={sectionId(section)}
                  id={sectionId(section)}
                  className="mt-16 scroll-mt-28 border-t border-ink/10 pt-12"
                >
                  <h2 className="font-sans text-[24px] font-medium leading-[1.25] tracking-[-0.015em] text-ink">
                    {section.title}
                  </h2>

                  {/* A section with subsections only needs its own body for an intro. */}
                  {section.body ? (
                    <Body>{section.body}</Body>
                  ) : (
                    subsections.length === 0 && <Body><Placeholder /></Body>
                  )}

                  {subsections.map((sub) => (
                    <section key={sectionId(sub)} id={sectionId(sub)} className="mt-12 scroll-mt-28">
                      <h3 className="font-sans text-[17px] font-medium leading-[1.4] text-ink">
                        {sub.title}
                      </h3>
                      <Body>{sub.body ?? <Placeholder />}</Body>
                    </section>
                  ))}
                </section>
              );
            })}
          </div>

          <NextProject study={study} />
        </div>
      </div>
    </article>
  );
}

function Body({ children }: { children: ReactNode }) {
  return <div className="mt-4 space-y-5">{children}</div>;
}

/* The tile's art, larger: a CAD render centered on a white panel (the HV
   enclosure keeps its hover explode), or a brand tile's mark on its color. */
function Hero({ study, tile }: { study: CaseStudy; tile?: Tile }) {
  // A size container, so a brand mark sized in cqw (Tally) scales to the panel.
  const panel = "@container group flex aspect-[16/9] items-center justify-center overflow-hidden rounded-sm";

  const custom = study.hero?.src;
  if (!custom && tile?.kind === "brand") {
    return (
      <div className={panel} style={{ background: tile.background }}>
        {tile.logo}
      </div>
    );
  }

  const photo = tile?.kind === "photo" ? tile : undefined;
  const src = custom ?? photo?.src;
  const alt = (custom ? study.hero?.alt : photo?.alt) ?? "";
  const art = custom ? undefined : photo?.art;
  const scale = `${study.hero?.scale ?? 78}%`;
  const fit = { maxWidth: scale, maxHeight: scale };

  return (
    <div className={`${panel} bg-white`}>
      {art ? (
        <div className="flex h-full w-full items-center justify-center" style={fit}>
          {art}
        </div>
      ) : (
        src && <img src={src} alt={alt} draggable={false} style={fit} className="select-none object-contain" />
      )}
    </div>
  );
}

/* Title in the hero's serif, the tile's subtitle in meta grey, the project's
   skills as white chips (like the gallery's hover labels), then any facts. */
function Header({ study, tile }: { study: CaseStudy; tile?: Tile }) {
  return (
    <header className="mt-12">
      <h1 className="text-balance font-serif text-[clamp(30px,3vw,42px)] font-normal leading-[1.2] tracking-[-0.03em] text-ink">
        {/* Wrap only between words, never at a hyphen ("8-" / "Legged"). */}
        {(tile?.title ?? study.slug).split(" ").map((word, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <span className="whitespace-nowrap">{word}</span>
          </Fragment>
        ))}
      </h1>
      {tile?.subtitle && <p className="mt-4 font-sans text-[14px] text-meta">{tile.subtitle}</p>}

      {!!study.skills?.length && (
        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Skills">
          {study.skills.map((tag) => (
            <li key={tag} className="rounded-sm bg-white px-3 py-1.5 font-sans text-[12px] leading-none text-ink">
              {tag}
            </li>
          ))}
        </ul>
      )}

      {!!study.facts?.length && (
        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {study.facts.map(({ label, value }) => (
            <div key={label}>
              <dt className="font-sans text-[12px] text-meta">{label}</dt>
              <dd className="mt-1 font-sans text-[14px] text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </header>
  );
}

/* Foot of the page: back to the gallery, and on to the next project page. */
function NextProject({ study }: { study: CaseStudy }) {
  const next = caseStudies[(caseStudies.indexOf(study) + 1) % caseStudies.length];
  const nextTile = findTile(next.tile);

  return (
    <nav
      aria-label="More projects"
      className="mt-24 flex items-end justify-between gap-6 border-t border-ink/10 pt-8 font-sans text-[14px]"
    >
      <Link to="/#projects" className="text-meta transition-colors duration-200 hover:text-accent-blue">
        ← All projects
      </Link>

      {next !== study && (
        <Link to={caseStudyHref(next)} className="group text-right">
          <span className="block text-[12px] text-meta">Next project</span>
          <span className="mt-1 block text-ink transition-colors duration-200 group-hover:text-accent-blue">
            {nextTile?.title ?? next.slug} →
          </span>
        </Link>
      )}
    </nav>
  );
}
