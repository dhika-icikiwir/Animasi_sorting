const PATHS = {
  play: "M7 4.5v15l12-7.5z",
  pause: "M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z",
  prev: "M15 5l-7 7 7 7",
  next: "M9 5l7 7-7 7",
  reset: "M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5",
  replay: "M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5",
  shuffle:
    "M4 7h3.5c2 0 3.2 1 4.2 2.7l1.6 2.6c1 1.7 2.2 2.7 4.2 2.7H20M4 17h3.5c1.2 0 2.1-.4 2.9-1.1M14.1 8.1C14.9 7.4 15.8 7 17 7h3M17.5 4.5 20 7l-2.5 2.5M17.5 14.5 20 17l-2.5 2.5",
  soundOn: "M4 9.5v5h3.5L12 18.5v-13L7.5 9.5zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11",
  soundOff: "M4 9.5v5h3.5L12 18.5v-13L7.5 9.5zM16 9.5l5 5M21 9.5l-5 5",
} as const;

const FILLED = new Set(["play", "pause"]);

export function Icon({ name }: { name: keyof typeof PATHS }) {
  const filled = FILLED.has(name);
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 shrink-0"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
