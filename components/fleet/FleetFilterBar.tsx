"use client";

import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";
import { vehicleMarkerColors } from "@/lib/fleet-appearance";
import { useFleetStore } from "@/stores/use-fleet-store";
import type { FleetStatusFilter } from "@/types/fleet";

/**
 * The single floating control at the bottom of the map. It does three jobs that
 * used to need three separate pieces of UI: it filters the fleet, its coloured
 * dots are the marker legend, and its tail carries the live clock.
 */
export default function FleetFilterBar() {
  const { locale, mode, t } = useUiPreferences();
  const vehicles = useFleetStore((state) => state.vehicles);
  const statusFilter = useFleetStore((state) => state.statusFilter);
  const setStatusFilter = useFleetStore((state) => state.setStatusFilter);
  const connectionStatus = useFleetStore((state) => state.connectionStatus);
  const tokens = fleetTokens[mode];
  const statusColors = vehicleMarkerColors[mode];

  const counts = useMemo(() => {
    const tally: Record<FleetStatusFilter, number> = { all: 0, moving: 0, stopped: 0, offline: 0 };
    for (const vehicle of vehicles) {
      tally.all += 1;
      tally[vehicle.status] += 1;
    }
    return tally;
  }, [vehicles]);

  const latestUpdate = useMemo(() => {
    let latest = "";
    for (const vehicle of vehicles) if (vehicle.lastUpdate > latest) latest = vehicle.lastUpdate;
    return latest;
  }, [vehicles]);

  const options: { value: FleetStatusFilter; label: string; dot?: string }[] = [
    { value: "all", label: t("all") },
    { value: "moving", label: t("moving"), dot: statusColors.blue },
    { value: "stopped", label: locale === "th" ? "จอด" : "Stopped", dot: statusColors.green },
    { value: "offline", label: locale === "th" ? "ออฟไลน์" : "Offline", dot: statusColors.gray },
  ];

  return (
    <Box
      role="group"
      aria-label={t("status")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.4,
        maxWidth: "100%",
        p: 0.6,
        borderRadius: 26,
        border: "1px solid",
        borderColor: tokens.line,
        bgcolor: tokens.panel,
        backdropFilter: "blur(10px) saturate(1.2)",
        WebkitBackdropFilter: "blur(10px) saturate(1.2)",
        boxShadow: "0 6px 22px rgb(0 0 0 / 0.22)",
        overflowX: "auto",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {options.map((option) => {
        const active = statusFilter === option.value;
        return (
          <Box
            key={option.value}
            component="button"
            type="button"
            aria-pressed={active}
            onClick={() => setStatusFilter(option.value)}
            sx={{
              display: "flex",
              flexShrink: 0,
              alignItems: "center",
              gap: 0.8,
              height: 32,
              px: 1.6,
              border: 0,
              borderRadius: 20,
              bgcolor: active ? tokens.accent : "transparent",
              color: active ? tokens.accentContrast : tokens.text2,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.69rem",
              fontWeight: 500,
              whiteSpace: "nowrap",
              transition: "background 160ms ease, color 160ms ease",
              "&:hover": { bgcolor: active ? tokens.accent : tokens.hover },
              "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
            }}
          >
            {option.dot && <Box sx={{ width: 6, height: 6, flexShrink: 0, borderRadius: "50%", bgcolor: active ? tokens.accentContrast : option.dot }} />}
            {option.label}
            <Box component="span" sx={{ fontFamily: "var(--font-data)", fontSize: "0.72rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: active ? tokens.accentContrast : tokens.text1 }}>
              {counts[option.value]}
            </Box>
          </Box>
        );
      })}

      {latestUpdate && (
        <>
          <Box aria-hidden sx={{ flexShrink: 0, width: "1px", height: 20, mx: 0.5, bgcolor: tokens.line }} />
          <Box sx={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 0.8, pr: 1.4, pl: 0.4 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: connectionStatus === "live" ? "#4ADE80" : tokens.text3,
                animation: connectionStatus === "live" ? "fleet-bar-ping 1.9s ease-out infinite" : "none",
                "@keyframes fleet-bar-ping": {
                  "0%": { boxShadow: "0 0 0 0 rgb(74 222 128 / 0.55)" },
                  "70%": { boxShadow: "0 0 0 6px rgb(74 222 128 / 0)" },
                  "100%": { boxShadow: "0 0 0 0 rgb(74 222 128 / 0)" },
                },
                "@media (prefers-reduced-motion: reduce)": { animation: "none" },
              }}
            />
            <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.63rem", fontVariantNumeric: "tabular-nums", color: tokens.text3 }}>{latestUpdate}</Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
