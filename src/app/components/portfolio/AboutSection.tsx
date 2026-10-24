import { socialLinks } from "./navConfig";
import { column } from "./layout";

// Early-version copy: only facts already stated elsewhere on the site.
const aboutRows = [
  { label: "Based", values: ["San Francisco Bay Area"] },
  { label: "Studying", values: ["B.S. Mechanical Engineering @ UIUC"] },
  {
    label: "Previously",
    values: ["Tesla, Battery & Energy Plastics", "IBM, Data & Production Automation"],
  },
];

// Closes the page under a hairline: the self-describing label rows (condensed
// keys, mono values) over the social links.
export function AboutSection() {
  return (
    <section id="about" data-name="About" className={`${column} pb-32`}>
      <div className="grid gap-8 border-t border-ink/10 pt-16 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <h2 className="font-roboto font-medium text-[14px] tracking-wide text-meta">About</h2>

        <div>
          <dl className="space-y-3">
            {aboutRows.map(({ label, values }) => (
              <div key={label} className="flex items-baseline gap-x-5">
                <dt className="w-[92px] shrink-0 font-condensed font-medium text-[16px] tracking-wide text-ink">
                  {label}
                </dt>
                <dd className="min-w-0 space-y-1 font-mono text-[13px] text-meta sm:text-[14px]">
                  {values.map((value) => (
                    <p key={value}>{value}</p>
                  ))}
                </dd>
              </div>
            ))}
          </dl>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {socialLinks.map(({ label, href, Icon }) => {
              const external = !href.startsWith("mailto:");
              return (
                <li key={label}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="inline-flex items-center gap-2 font-roboto font-medium text-[14px] tracking-wide text-meta transition-colors duration-200 hover:text-accent-blue"
                  >
                    <Icon fontSize="inherit" className="text-[16px]" />
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
