import type { ThemeMode } from "@/lib/design-tokens";
import type { ConnectionStatus } from "@/stores/use-fleet-store";
import type { FleetVehicle } from "@/types/fleet";

/**
 * Status colors are a scale of their own, kept apart from the accent so a blue
 * marker always means "moving" and never means "selected".
 */
export const vehicleMarkerColors: Record<ThemeMode, Record<"gray" | "green" | "blue" | "red", string>> = {
  light: { gray: "#64748B", green: "#15803D", blue: "#0284C7", red: "#DC2626" },
  dark: { gray: "#64748B", green: "#22C55E", blue: "#38BDF8", red: "#EF4444" },
};

export function getVehicleMarkerColor(vehicle: Pick<FleetVehicle, "speedKph" | "accOn">, mode: ThemeMode) {
  const colors = vehicleMarkerColors[mode];
  if (vehicle.speedKph >= 90) return colors.red;
  if (vehicle.speedKph > 0 && vehicle.accOn) return colors.blue;
  if (vehicle.speedKph === 0 && vehicle.accOn) return colors.green;
  return colors.gray;
}

/**
 * The history route's own scale, kept apart from both the status colors and the
 * accent: on the history page green means "0–70 km/h" and nothing else, and the
 * playhead marker stays on the accent because it means "the point you're on".
 */
export type SpeedBand = "normal" | "brisk" | "over";

export const speedBandColors: Record<ThemeMode, Record<SpeedBand, string>> = {
  light: { normal: "#15803D", brisk: "#CA8A04", over: "#DC2626" },
  dark: { normal: "#22C55E", brisk: "#FACC15", over: "#EF4444" },
};

/** 0–70 · 71–80 · 81+. The thresholds live here so the route, the legend and
 *  the trackpoint list can never drift apart. */
export function getSpeedBand(speedKph: number): SpeedBand {
  if (speedKph > 80) return "over";
  if (speedKph > 70) return "brisk";
  return "normal";
}

export function getSpeedBandColor(speedKph: number, mode: ThemeMode) {
  return speedBandColors[mode][getSpeedBand(speedKph)];
}

export function getVehicleAccLabel(vehicle: Pick<FleetVehicle, "accOn">) {
  return vehicle.accOn ? "ACC on" : "ACC off";
}

type ConnectionAppearance = {
  color: string;
  textColor: string;
  softBg: string;
  labelKey: "statusLive" | "statusConnecting" | "statusOffline" | "statusDemo";
};

const connectionAppearance: Record<ThemeMode, Record<ConnectionStatus, ConnectionAppearance>> = {
  light: {
    live: { color: "#16A34A", textColor: "#15803D", softBg: "rgba(22,163,74,0.12)", labelKey: "statusLive" },
    connecting: { color: "#F97316", textColor: "#B45309", softBg: "rgba(249,115,22,0.14)", labelKey: "statusConnecting" },
    error: { color: "#64748B", textColor: "#5A6675", softBg: "rgba(100,116,139,0.14)", labelKey: "statusOffline" },
    // Violet: shared with no vehicle status and with no accent, so "generated
    // data" can never be mistaken for a state the fleet is actually in.
    demo: { color: "#7C3AED", textColor: "#6D28D9", softBg: "rgba(124,58,237,0.14)", labelKey: "statusDemo" },
  },
  dark: {
    live: { color: "#4ADE80", textColor: "#86EFAC", softBg: "rgba(74,222,128,0.10)", labelKey: "statusLive" },
    connecting: { color: "#FBBF24", textColor: "#FCD34D", softBg: "rgba(251,191,36,0.12)", labelKey: "statusConnecting" },
    error: { color: "#64748B", textColor: "#93A0B2", softBg: "rgba(100,116,139,0.16)", labelKey: "statusOffline" },
    demo: { color: "#A78BFA", textColor: "#C4B5FD", softBg: "rgba(167,139,250,0.14)", labelKey: "statusDemo" },
  },
};

/** Single source of truth for how every "is this live?" indicator is drawn. */
export function getConnectionAppearance(status: ConnectionStatus, mode: ThemeMode) {
  return connectionAppearance[mode][status];
}
