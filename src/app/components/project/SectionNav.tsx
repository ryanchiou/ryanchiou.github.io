import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { ChevronRight } from "lucide-react";
import { handleNavClick } from "@/app/components/portfolio/navConfig";

export type NavGroup = {
  id: string;
  title: string;
  children: { id: string; title: string }[];
};

// A section counts as current once its top passes this far below the top of
// the viewport. Matches the sections' scroll margin (scroll-mt-28 = 112px)
// plus some slack, so a section clicked in the nav is current where it lands.
const SPY_OFFSET = 140;

// The last section whose top has passed the spy line.
//
// The last few sections can't scroll up to the line (the page runs out
// first), so over the final screen of scrolling the line slides down the
// viewport. Each of them still gets its turn, and at the very bottom the
// last one wins.
function sectionInView(ids: string[]) {
  const viewport = window.innerHeight;
  const toBottom = document.documentElement.scrollHeight - (window.scrollY + viewport);
  if (window.scrollY > 0 && toBottom <= 2) return ids[ids.length - 1];

  const nearEnd = Math.min(Math.max(1 - toBottom / viewport, 0), 1);
  const line = SPY_OFFSET + nearEnd * (viewport * 0.8 - SPY_OFFSET);

  let current = ids[0];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= line) current = id;
  }
  return current;
}

/* The project page's "on this page" nav: a hairline track on the left with
   the sections listed down it. The current one turns blue and lights its
   stretch of the track, like the top nav's current link.

   Subsections sit indented and smaller under their section. Only the group
   being read is open; the others fold away to keep the list short. The
   chevron opens or closes any group by hand, until the reader moves into
   another section and the nav follows them again. */
export function SectionNav({ groups }: { groups: NavGroup[] }) {
  const ids = useMemo(
    () => groups.flatMap((g) => [g.id, ...g.children.map((c) => c.id)]),
    [groups],
  );
  const [active, setActive] = useState(ids[0]);

  // After a click, the clicked section stays current while the page glides
  // to it, rather than every section it passes lighting up on the way.
  const locked = useRef(false);
  const unlockTimer = useRef(0);
  const lockUntilScrollSettles = (ms: number) => {
    locked.current = true;
    window.clearTimeout(unlockTimer.current);
    unlockTimer.current = window.setTimeout(() => (locked.current = false), ms);
  };

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (locked.current) return lockUntilScrollSettles(150);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setActive(sectionInView(ids)));
    };

    setActive(sectionInView(ids));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(unlockTimer.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  // The group the reader is in: the active section, or the parent of the
  // active subsection.
  const activeGroup = groups.find(
    (g) => g.id === active || g.children.some((c) => c.id === active),
  )?.id;

  // Groups opened/closed by hand. They hold until the reader moves into
  // another group, then the nav goes back to following them.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [overridesFrom, setOverridesFrom] = useState(activeGroup);
  if (overridesFrom !== activeGroup) {
    // Reset during render (React re-renders straight away, before paint).
    setOverridesFrom(activeGroup);
    setOverrides({});
  }
  const isOpen = (id: string) => overrides[id] ?? id === activeGroup;
  const toggle = (id: string) => setOverrides({ ...overrides, [id]: !isOpen(id) });

  const go = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    lockUntilScrollSettles(200);
    setActive(id);
    handleNavClick(event, `#${id}`);
  };

  return (
    <nav aria-label="On this page">
      <ul className="border-l border-ink/10">
        {groups.map((group) => {
          const open = isOpen(group.id);
          const hasChildren = group.children.length > 0;
          const listId = `${group.id}-subsections`;

          return (
            <li key={group.id}>
              <div className="flex items-start">
                <NavLink
                  id={group.id}
                  title={group.title}
                  state={active === group.id ? "active" : activeGroup === group.id ? "parent" : "idle"}
                  onClick={go(group.id)}
                />
                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => toggle(group.id)}
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-label={`${open ? "Hide" : "Show"} ${group.title} subsections`}
                    className="mt-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-ink/35 transition-colors duration-200 hover:text-accent-blue"
                  >
                    <ChevronRight
                      aria-hidden
                      strokeWidth={1.75}
                      className={`size-3.5 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                        open ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {hasChildren && (
                // Grid-rows 0fr ↔ 1fr animates the fold to the list's own height.
                <div
                  id={listId}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <ul className="min-h-0 overflow-hidden" aria-hidden={!open}>
                    {group.children.map((child) => (
                      <li key={child.id}>
                        <NavLink
                          id={child.id}
                          title={child.title}
                          sub
                          state={active === child.id ? "active" : "idle"}
                          onClick={go(child.id)}
                          tabIndex={open ? undefined : -1}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavLink({
  id,
  title,
  sub = false,
  state,
  onClick,
  tabIndex,
}: {
  id: string;
  title: string;
  sub?: boolean;
  /** active: the section in view. parent: holds the subsection in view. */
  state: "active" | "parent" | "idle";
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  tabIndex?: number;
}) {
  const color =
    state === "active"
      ? "text-accent-blue"
      : state === "parent"
        ? "text-ink hover:text-accent-blue"
        : "text-meta hover:text-accent-blue";

  return (
    <a
      href={`#${id}`}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-current={state === "active" ? "location" : undefined}
      className={`relative block min-w-0 flex-1 text-pretty transition-colors duration-200 ${color} ${
        sub ? "py-[5px] pl-7 text-[13px] leading-[18px]" : "py-[7px] pl-4 text-[14px] leading-[18px]"
      } ${
        // The lit stretch of the track, laid over the hairline.
        state === "active"
          ? "before:absolute before:inset-y-1 before:-left-px before:w-[2px] before:rounded-full before:bg-accent-blue"
          : ""
      }`}
    >
      {title}
    </a>
  );
}
