"use client";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import { Box, CircularProgress, Tooltip, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import HistoryPlayback from "@/components/history/HistoryPlayback";
import PlaybackDeck from "@/components/history/PlaybackDeck";
import TrackpointList from "@/components/history/TrackpointList";
import VehiclePicker from "@/components/history/VehiclePicker";
import AppSidebar from "@/components/layout/AppSidebar";
import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetMotion, fleetTokens, panelTransition, reopenTransition } from "@/lib/design-tokens";
import { speedBandColors } from "@/lib/fleet-appearance";
import { useFleetStore } from "@/stores/use-fleet-store";
import { todayKey, useHistoryStore } from "@/stores/use-history-store";

const HistoryMap = dynamic(() => import("@/components/history/HistoryMap"), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
      <CircularProgress size={26} />
    </Box>
  ),
});

/**
 * Playback of one vehicle's recorded track, on the same map and the same theme
 * as the realtime page. Like that page, nothing is docked beside the map: the
 * controls, the trackpoint table and the read-outs all float over it, so the
 * route never changes size because a panel opened.
 */
export default function HistoryWorkspace() {
  const { locale, mode, t } = useUiPreferences();
  const tokens = fleetTokens[mode];

  const vehicles = useFleetStore((state) => state.vehicles);
  const selectedVehicleId = useFleetStore((state) => state.selectedVehicleId);
  const setSelectedVehicleId = useFleetStore((state) => state.setSelectedVehicleId);
  const connectionStatus = useFleetStore((state) => state.connectionStatus);

  const vehicleId = useHistoryStore((state) => state.vehicleId);
  const from = useHistoryStore((state) => state.from);
  const to = useHistoryStore((state) => state.to);
  const status = useHistoryStore((state) => state.status);
  const track = useHistoryStore((state) => state.track);
  const index = useHistoryStore((state) => state.index);
  const truncated = useHistoryStore((state) => state.truncated);
  const inspectorOpen = useHistoryStore((state) => state.inspectorOpen);
  const followCamera = useHistoryStore((state) => state.followCamera);
  const playheadOffscreen = useHistoryStore((state) => state.playheadOffscreen);
  const setVehicleId = useHistoryStore((state) => state.setVehicleId);
  const setRange = useHistoryStore((state) => state.setRange);
  const setInspectorOpen = useHistoryStore((state) => state.setInspectorOpen);
  const setFollowCamera = useHistoryStore((state) => state.setFollowCamera);

  const reopenRef = useRef<HTMLButtonElement>(null);

  // The page opens on whatever the realtime map had selected, so following a
  // vehicle from one page to the other never needs the picker at all.
  useEffect(() => {
    const fallback = selectedVehicleId || vehicles[0]?.id || "";
    if (!vehicleId && fallback) setVehicleId(fallback);
  }, [selectedVehicleId, setVehicleId, vehicleId, vehicles]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      // Never steal a key from a control the user is typing or dragging in.
      if (target && (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName))) return;

      const state = useHistoryStore.getState();
      if (event.key === " ") {
        event.preventDefault();
        state.togglePlaying();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        state.stepBy(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        state.stepBy(1);
      } else if (event.key === "f" || event.key === "F") {
        state.setFollowCamera(!state.followCamera);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function closeInspector() {
    setInspectorOpen(false);
    // Never leave focus on a control that just slid off the screen.
    window.requestAnimationFrame(() => reopenRef.current?.focus());
  }

  const overlay = (() => {
    if (vehicles.length === 0) return connectionStatus === "connecting" ? t("loadingVehicles") : t("noVehicles");
    if (status === "loading") return t("loadingHistory");
    if (status === "error") return t("historyError");
    if (status === "ready" && track.length < 2) return t("noHistory");
    return "";
  })();

  /** One surface for everything that sits on top of the map. */
  const floating = {
    border: "1px solid",
    borderColor: tokens.line,
    bgcolor: tokens.panel,
    backdropFilter: "blur(10px) saturate(1.2)",
    WebkitBackdropFilter: "blur(10px) saturate(1.2)",
    boxShadow: "0 6px 22px rgb(0 0 0 / 0.22)",
  } as const;

  const dateField = {
    height: 34,
    px: 1,
    border: "1px solid",
    borderColor: tokens.line,
    borderRadius: 2.5,
    bgcolor: tokens.panelSolid,
    color: tokens.text1,
    fontFamily: "var(--font-data)",
    fontSize: "0.7rem",
    cursor: "pointer",
    colorScheme: mode,
    "&:hover": { borderColor: tokens.lineStrong },
    "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
    "&::-webkit-calendar-picker-indicator": { cursor: "pointer", opacity: 0.55 },
  } as const;

  return (
    <Box sx={{ height: "100dvh", display: "flex", flexDirection: { xs: "column-reverse", sm: "row" }, bgcolor: tokens.mapGround, overflow: "hidden" }}>
      <AppSidebar />
      <HistoryPlayback />

      <Box component="main" sx={{ minWidth: 0, minHeight: 0, flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ position: "relative", minWidth: 0, minHeight: 0, flex: 1, bgcolor: tokens.mapGround }}>
          <HistoryMap />

          {/* Which vehicle, and over which days: the two things a replay is of. */}
          <Box sx={{ position: "absolute", zIndex: 950, top: 12, left: 12, display: "flex", alignItems: "center", gap: 0.8, p: 0.8, borderRadius: 3, ...floating }}>
            <VehiclePicker
              vehicles={vehicles}
              vehicleId={vehicleId}
              onSelect={(id) => {
                setVehicleId(id);
                // Both pages stay on the same vehicle, so going back to the
                // live map lands on the one that was just replayed.
                setSelectedVehicleId(id);
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box component="input" type="date" aria-label={t("dateFrom")} value={from} max={to} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRange(event.target.value, to)} sx={dateField} />
              <Typography aria-hidden sx={{ color: tokens.text3, fontSize: "0.72rem" }}>–</Typography>
              <Box component="input" type="date" aria-label={t("dateTo")} value={to} min={from} max={todayKey()} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRange(from, event.target.value)} sx={dateField} />
            </Box>
          </Box>


          {/* The closed table keeps the one number you cannot read off the map. */}
          <Tooltip title={t("showTable")} placement="left" disableInteractive>
            <Box
              component="button"
              ref={reopenRef}
              type="button"
              onClick={() => setInspectorOpen(true)}
              aria-expanded={inspectorOpen}
              sx={{
                position: "absolute",
                zIndex: 950,
                top: 12,
                right: 12,
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                height: 32,
                px: 1.3,
                borderRadius: 16,
                ...floating,
                color: tokens.text2,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.68rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                opacity: inspectorOpen ? 0 : 1,
                transform: inspectorOpen ? "translateX(10px) scale(0.94)" : "translateX(0) scale(1)",
                pointerEvents: inspectorOpen ? "none" : "auto",
                transition: reopenTransition,
                "&:hover": { color: tokens.text1 },
                "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
                "@media (prefers-reduced-motion: reduce)": { transition: "opacity 1ms", transform: "none" },
              }}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 15 }} />
              {t("pointAt")}{" "}
              <Box component="span" sx={{ fontFamily: "var(--font-data)", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: tokens.text1 }}>
                {track.length === 0 ? 0 : index + 1} / {track.length}
              </Box>
            </Box>
          </Tooltip>

          {/* The trackpoint table is a layer over the map, not a column beside
              it: the map keeps its full width whether the table is open or not. */}
          <Box
            component="aside"
            aria-label={t("trackpoints")}
            inert={!inspectorOpen}
            sx={{
              position: "absolute",
              zIndex: 960,
              top: 54,
              right: 12,
              bottom: 12,
              width: { xs: "calc(100% - 24px)", sm: 300 },
              maxWidth: "calc(100% - 24px)",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              ...floating,
              overflow: "hidden",
              opacity: inspectorOpen ? 1 : 0,
              transform: inspectorOpen ? "translateX(0)" : `translateX(${fleetMotion.slidePx}px)`,
              pointerEvents: inspectorOpen ? "auto" : "none",
              transition: panelTransition(inspectorOpen),
              "@media (prefers-reduced-motion: reduce)": { transition: "opacity 1ms", transform: "none" },
            }}
          >
            <TrackpointList onClose={closeInspector} />
          </Box>

          {/* The legend says out loud that these colours are speed. */}
          <Box sx={{ position: "absolute", zIndex: 940, bottom: 12, left: 12, display: "flex", alignItems: "center", gap: 1.2, px: 1.2, py: 0.7, borderRadius: 2.5, ...floating, boxShadow: "none" }}>
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 600, color: tokens.text3 }}>{t("routeSpeedLegend")}</Typography>
            {([["normal", "0–70"], ["brisk", "71–80"], ["over", "81+"]] as const).map(([band, label]) => (
              <Box key={band} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 12, height: 3, borderRadius: 2, bgcolor: speedBandColors[mode][band] }} />
                <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", fontWeight: 700, color: tokens.text2 }}>{label}</Typography>
              </Box>
            ))}
          </Box>

          {!followCamera && playheadOffscreen && track.length > 0 && (
            <Box
              component="button"
              type="button"
              onClick={() => setFollowCamera(true)}
              sx={{
                position: "absolute",
                zIndex: 950,
                bottom: 12,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 0.7,
                height: 30,
                px: 1.4,
                borderRadius: 16,
                ...floating,
                color: tokens.text2,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.68rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                "&:hover": { color: tokens.text1 },
                "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
              }}
            >
              <MyLocationRoundedIcon sx={{ fontSize: 14 }} />
              {t("backToVehicle")}
            </Box>
          )}

          {overlay && (
            <Box sx={{ position: "absolute", zIndex: 930, inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
              <Typography sx={{ px: 2, py: 1, borderRadius: 2.5, ...floating, fontSize: "0.8rem", fontWeight: 600, color: tokens.text2 }}>{overlay}</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, px: 1.5, py: 1.2, borderTop: "1px solid", borderColor: tokens.line, bgcolor: tokens.chrome }}>
          <PlaybackDeck />
        </Box>

        {truncated && (
          <Typography sx={{ px: 2, pb: 1, fontSize: "0.66rem", color: tokens.text3, bgcolor: tokens.chrome }}>
            {locale === "th" ? "แสดงเฉพาะช่วงต้นของช่วงที่เลือก เพราะจำนวนจุดเกินเพดานต่อคำขอ" : "Showing the start of this range only: it hit the per-request point cap."}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
