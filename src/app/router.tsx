import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from "react";

/* ── Minimal path-based router ─────────────────────────────────────
   The site has one real page plus a set of placeholders, so it doesn't
   carry a router dependency — this is the whole thing.

   Navigation goes through the History API, which fires `popstate` only
   for back/forward, never for pushState. So `navigate` announces its own
   changes on a custom event and `useLocation` listens to both. */

const NAVIGATE_EVENT = "app:navigate";

export type Location = { path: string; hash: string };

function read(): Location {
  return { path: window.location.pathname, hash: window.location.hash };
}

/** Push a new URL and re-render anything watching the location. */
export function navigate(to: string) {
  const current = window.location.pathname + window.location.hash;
  if (to === current) return;

  window.history.pushState(null, "", to);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** Current path + hash, kept in sync with pushState, back/forward, and hash jumps. */
export function useLocation(): Location {
  const [location, setLocation] = useState<Location>(read);

  useEffect(() => {
    const sync = () => setLocation(read());
    // popstate → back/forward; hashchange → in-page anchors; the custom
    // event → our own navigate() calls.
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    window.addEventListener(NAVIGATE_EVENT, sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      window.removeEventListener(NAVIGATE_EVENT, sync);
    };
  }, []);

  return location;
}

/** True when the click should be left to the browser (new tab, download, etc.). */
function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

/* An internal link. Renders a real <a href> — so middle-click, cmd-click, and
   "copy link address" all behave — but handles plain left-clicks in-page. */
export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (isModifiedClick(event)) return;

    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
