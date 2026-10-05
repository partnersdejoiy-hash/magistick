import type { SVGProps } from "react";

/**
 * magistick's own icon set — minimal geometric line icons, drawn for the portal.
 * No emoji, no borrowed glyph fonts. 24×24 grid, 1.7 stroke, round caps.
 */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconPeople = (p: P) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
    <circle cx="16.5" cy="9.5" r="2.4" />
    <path d="M16 14.2c2.3.3 3.9 1.9 4.4 4.3" />
  </Base>
);

export const IconClock = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

export const IconWallet = (p: P) => (
  <Base {...p}>
    <rect x="3" y="6.5" width="18" height="12.5" rx="2.5" />
    <path d="M3 10h18" />
    <circle cx="17" cy="14.8" r="1.1" fill="currentColor" stroke="none" />
  </Base>
);

export const IconBook = (p: P) => (
  <Base {...p}>
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15.5H6.7A1.7 1.7 0 0 0 5 20.2Z" />
    <path d="M5 19.5A1.5 1.5 0 0 1 6.5 18H19" />
    <path d="M9 7.5h7" />
  </Base>
);

export const IconWrench = (p: P) => (
  <Base {...p}>
    <path d="M14.5 6.5a4 4 0 0 0-5.6 4.9L4 16.3V20h3.7l4.9-4.9a4 4 0 0 0 4.9-5.6l-2.8 2.8-2.5-.6-.6-2.5Z" />
  </Base>
);

export const IconChat = (p: P) => (
  <Base {...p}>
    <path d="M4 5.5h16v10.5H9l-5 4Z" />
    <path d="M8 9.5h8M8 12.5h5" />
  </Base>
);

export const IconVideo = (p: P) => (
  <Base {...p}>
    <rect x="3" y="6.5" width="12.5" height="11" rx="2.5" />
    <path d="M15.5 10.5l5-3v9l-5-3" />
  </Base>
);

export const IconAward = (p: P) => (
  <Base {...p}>
    <circle cx="12" cy="9" r="5" />
    <path d="M9.5 13.2 8 20l4-2.4L16 20l-1.5-6.8" />
    <path d="M12 6.8l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3Z" fill="currentColor" stroke="none" opacity="0.85" />
  </Base>
);

export const IconBulb = (p: P) => (
  <Base {...p}>
    <path d="M9.5 18h5" />
    <path d="M10.5 21h3" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.8.6 1.3 1.3 1.5 2.1h4c.2-.8.7-1.5 1.5-2.1A6 6 0 0 0 12 3Z" />
  </Base>
);

export const IconPlane = (p: P) => (
  <Base {...p}>
    <path d="M10.5 13.5 3 11l1.5-1.5L11 11l3.5-5.5c.8-1.2 2.5-1.4 3.4-.5.9.9.7 2.6-.5 3.4L13 12l1.5 6.5L13 20l-2.5-6.5Z" />
  </Base>
);

export const IconUserPlus = (p: P) => (
  <Base {...p}>
    <circle cx="10" cy="8" r="3.2" />
    <path d="M4.5 19c.6-3.2 2.8-5 5.5-5 1.5 0 2.9.6 3.9 1.6" />
    <path d="M18.5 14v6M15.5 17h6" />
  </Base>
);

export const IconGauge = (p: P) => (
  <Base {...p}>
    <path d="M4 14a8 8 0 1 1 16 0" />
    <path d="M12 14l4.2-4.2" />
    <circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none" />
    <path d="M4 18h16" />
  </Base>
);

export const IconSearch = (p: P) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Base>
);

export const IconBell = (p: P) => (
  <Base {...p}>
    <path d="M18 9.5a6 6 0 0 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 15.5 18 9.5" />
    <path d="M10.3 20a2 2 0 0 0 3.4 0" />
  </Base>
);

export const IconPin = (p: P) => (
  <Base {...p}>
    <path d="M9 4h6l1 6 3 3v2H5v-2l3-3Z" />
    <path d="M12 15v6" />
  </Base>
);

export const IconArrowRight = (p: P) => (
  <Base {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Base>
);

export const IconArrowLeft = (p: P) => (
  <Base {...p}>
    <path d="M20 12H5M11 6l-6 6 6 6" />
  </Base>
);

export const IconTicket = (p: P) => (
  <Base {...p}>
    <path d="M4 8.5h16V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z" />
    <path d="M4 8.5V12a2 2 0 0 1 2 2h12a2 2 0 0 1 2-2V8.5" />
    <path d="M4 15.5h16V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
    <path d="M13.5 8.5v7" strokeDasharray="2 2.4" />
  </Base>
);

export const IconPlus = (p: P) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const IconCheck = (p: P) => (
  <Base {...p}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Base>
);

export const IconChevronDown = (p: P) => (
  <Base {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Base>
);

export const IconExternal = (p: P) => (
  <Base {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M19 13.5V19a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5h5.5" />
  </Base>
);

export const IconSpark = (p: P) => (
  <Base {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <circle cx="12" cy="12" r="3.2" />
  </Base>
);

export const IconDoc = (p: P) => (
  <Base {...p}>
    <path d="M6 3.5h8L19 8.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
    <path d="M13.5 3.5V9H19" />
    <path d="M8.5 13h7M8.5 16h7" />
  </Base>
);

export const IconInbox = (p: P) => (
  <Base {...p}>
    <path d="M3.5 13l2.7-7.5h11.6L20.5 13v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19Z" />
    <path d="M3.5 13h5l1.2 2h4.6l1.2-2h5" />
  </Base>
);

/** Map from data.ts icon keys to components. */
export const APP_ICONS = {
  people: IconPeople,
  clock: IconClock,
  wallet: IconWallet,
  book: IconBook,
  wrench: IconWrench,
  chat: IconChat,
  video: IconVideo,
  award: IconAward,
  bulb: IconBulb,
  plane: IconPlane,
  userplus: IconUserPlus,
  gauge: IconGauge,
} as const;

export type AppIconKey = keyof typeof APP_ICONS;
