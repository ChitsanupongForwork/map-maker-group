export type ThemeMode = "light" | "dark";

type FleetTokens = {
  /** Painted under the map tiles so a slow tile never flashes white. */
  mapGround: string;
  /** Nav rail and other app chrome — one step away from the map, never the same. */
  chrome: string;
  /** Translucent surface for panels that float over the map. */
  panel: string;
  /** Opaque fallback for browsers without backdrop-filter. */
  panelSolid: string;
  line: string;
  lineStrong: string;
  text1: string;
  text2: string;
  text3: string;
  /**
   * Reserved for "the thing you selected" — selected row, selected marker,
   * active nav item. Never used for status; status has its own scale.
   */
  accent: string;
  accentSoft: string;
  accentContrast: string;
  hover: string;
  /** Applied to the Leaflet tile pane only, so markers keep their real colors. */
  tileFilter: string;
};

export const fleetTokens: Record<ThemeMode, FleetTokens> = {
  light: {
    mapGround: "#EEF1F4",
    chrome: "#FFFFFF",
    panel: "rgba(255, 255, 255, 0.86)",
    panelSolid: "#FFFFFF",
    line: "rgba(20, 30, 45, 0.10)",
    lineStrong: "rgba(20, 30, 45, 0.18)",
    text1: "#10161F",
    text2: "#5A6675",
    text3: "#8A94A3",
    accent: "#C2410C",
    accentSoft: "rgba(194, 65, 12, 0.12)",
    accentContrast: "#FFFFFF",
    hover: "rgba(16, 22, 31, 0.06)",
    tileFilter: "none",
  },
  dark: {
    mapGround: "#0A0D12",
    chrome: "#0B0F14",
    panel: "rgba(11, 15, 20, 0.80)",
    panelSolid: "#0E141B",
    line: "rgba(120, 150, 180, 0.16)",
    lineStrong: "rgba(120, 150, 180, 0.28)",
    text1: "#E6EBF2",
    text2: "#93A0B2",
    text3: "#6D7A8C",
    accent: "#E9532F",
    accentSoft: "rgba(233, 83, 47, 0.15)",
    accentContrast: "#FFFFFF",
    hover: "rgba(255, 255, 255, 0.06)",
    tileFilter: "invert(1) hue-rotate(180deg) brightness(0.94) contrast(0.86) saturate(0.62)",
  },
};

/**
 * Shared motion values. Panels always leave faster than they arrive: the user
 * has already decided they do not want the panel, so waiting for it feels slow.
 */
export const fleetMotion = {
  enterTransform: "260ms cubic-bezier(.22, 1, .36, 1)",
  enterFade: "200ms ease-out",
  exitTransform: "200ms cubic-bezier(.4, 0, 1, 1)",
  exitFade: "160ms ease-in",
  /** Offset a closing panel slides by — direction reads without leaving the screen. */
  slidePx: 26,
  /** Matches the two-second SSE tick so markers glide instead of teleporting. */
  markerMs: 1800,
} as const;

/** Transition shorthand for a panel that slides in from `direction`. */
export function panelTransition(open: boolean) {
  return open
    ? `transform ${fleetMotion.enterTransform}, opacity ${fleetMotion.enterFade}`
    : `transform ${fleetMotion.exitTransform}, opacity ${fleetMotion.exitFade}`;
}

/** Reopen buttons wait for the panel to clear before fading in. */
export const reopenTransition = "opacity 180ms ease 200ms, transform 180ms ease 200ms";
