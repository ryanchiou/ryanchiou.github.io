// Shared page column: the nav, hero and gallery all sit in this centered
// column, so their edges line up. It fills the window up to 1200px, then keeps
// growing at 82% of the window width (the same margins a 1440px laptop gets),
// so big monitors aren't mostly empty backdrop. Capped at 2200px for ultrawides.
export const column = "mx-auto w-full max-w-[clamp(1200px,82vw,2200px)] px-6 sm:px-10";
