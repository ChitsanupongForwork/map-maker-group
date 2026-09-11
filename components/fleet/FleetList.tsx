"use client";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useDeferredValue, useMemo, useRef, useState } from "react";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import {
  fleetMotion,
  fleetTokens,
  panelTransition,
  reopenTransition,
} from "@/lib/design-tokens";
import { getVehicleMarkerColor } from "@/lib/fleet-appearance";
import {
  formatAge,
  getFreshnessColor,
  getFreshnessLevel,
  secondsSinceUpdate,
} from "@/lib/vehicle-freshness";
import { useFleetStore } from "@/stores/use-fleet-store";

export const LIST_PANEL_WIDTH = 268;
const PAGE_SIZE = 80;

export default function FleetList() {
  //ข้อมูลรถ
  const vehicles = useFleetStore((state) => state.vehicles);
  const selectedVehicleId = useFleetStore((state) => state.selectedVehicleId);
  const setSelectedVehicleId = useFleetStore((state) => state.setSelectedVehicleId);
  const statusFilter = useFleetStore((state) => state.statusFilter);
  const connectionStatus = useFleetStore((state) => state.connectionStatus);
  const listOpen = useFleetStore((state) => state.listOpen);
  const setListOpen = useFleetStore((state) => state.setListOpen);
  const { mode, t } = useUiPreferences();
  const tokens = fleetTokens[mode];

  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pagedFor, setPagedFor] = useState(`${query}|${statusFilter}`);
  const reopenRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const deferredVehicles = useDeferredValue(vehicles);

  const matchedVehicles = useMemo(() => {
    const byStatus =
      statusFilter === "all"
        ? deferredVehicles
        : deferredVehicles.filter((vehicle) => vehicle.status === statusFilter);
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return byStatus;
    return byStatus.filter(
      (vehicle) =>
        vehicle.code.toLowerCase().includes(normalizedQuery) ||
        vehicle.label.toLowerCase().includes(normalizedQuery) ||
        vehicle.driverName.toLowerCase().includes(normalizedQuery),
    );
  }, [deferredVehicles, query, statusFilter]);

  const visibleVehicles = useMemo(
    () => matchedVehicles.slice(0, visibleCount),
    [matchedVehicles, visibleCount],
  );

  // Adjusting state during render rather than in an effect: React applies it
  // before committing, so the list never paints a stale page count first.
  const pageKey = `${query}|${statusFilter}`;
  if (pagedFor !== pageKey) {
    setPagedFor(pageKey);
    setVisibleCount(PAGE_SIZE);
  }

  function closePanel() {
    setListOpen(false);
    // Never leave focus on a control that just became invisible.
    window.requestAnimationFrame(() => reopenRef.current?.focus());
  }

  function openPanel() {
    setListOpen(true);
    window.requestAnimationFrame(() => closeRef.current?.focus());
  }

  return (
    <>
      <Tooltip title={t("vehicleData")} placement="right" disableInteractive>
        <IconButton
          ref={reopenRef}
          onClick={openPanel}
          aria-label={t("vehicleData")}
          aria-expanded={listOpen}
          sx={{
            position: "absolute",
            zIndex: 950,
            top: 16,
            left: 16,
            width: 38,
            height: 38,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: tokens.line,
            bgcolor: tokens.panel,
            color: tokens.text2,
            backdropFilter: "blur(8px)",
            opacity: listOpen ? 0 : 1,
            transform: listOpen ? "translateX(-10px) scale(0.9)" : "translateX(0) scale(1)",
            pointerEvents: listOpen ? "none" : "auto",
            transition: reopenTransition,
            "&:hover": { bgcolor: tokens.panelSolid, color: tokens.text1 },
            "@media (prefers-reduced-motion: reduce)": { transition: "opacity 1ms", transform: "none" },
          }}
        >
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Box
        component="aside"
        aria-label={t("overview")}
        // `inert` keeps the closed panel out of the tab order while it stays
        // mounted — staying mounted is what lets the exit animation play at all.
        inert={!listOpen}
        sx={{
          position: "absolute",
          zIndex: 960,
          top: 16,
          left: 16,
          bottom: { xs: 74, sm: 16 },
          width: { xs: "calc(100% - 32px)", sm: LIST_PANEL_WIDTH },
          maxWidth: "calc(100% - 32px)",
          display: "flex",
          flexDirection: "column",
          p: 1.75,
          borderRadius: 3,
          border: "1px solid",
          borderColor: tokens.line,
          bgcolor: tokens.panel,
          backdropFilter: "blur(10px) saturate(1.2)",
          WebkitBackdropFilter: "blur(10px) saturate(1.2)",
          boxShadow: "0 10px 34px rgb(0 0 0 / 0.22)",
          opacity: listOpen ? 1 : 0,
          transform: listOpen ? "translateX(0)" : `translateX(-${fleetMotion.slidePx}px)`,
          pointerEvents: listOpen ? "auto" : "none",
          transition: panelTransition(listOpen),
          "@media (prefers-reduced-motion: reduce)": { transition: "opacity 1ms", transform: "none" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              sx={{ fontFamily: "var(--font-display)", fontSize: "1.06rem", fontWeight: 700, letterSpacing: "-0.015em", color: tokens.text1 }}
            >
              {t("monitor")}
            </Typography>
            <Typography noWrap sx={{ fontSize: "0.69rem", color: tokens.text3 }}>
              {t("portfolio")}
            </Typography>
          </Box>
          <Tooltip title={t("close")} disableInteractive>
            <IconButton
              ref={closeRef}
              onClick={closePanel}
              aria-label={t("close")}
              size="small"
              sx={{ width: 26, height: 26, flexShrink: 0, borderRadius: 1.75, border: "1px solid", borderColor: tokens.line, bgcolor: tokens.hover, color: tokens.text2, "&:hover": { color: tokens.text1 } }}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          size="small"
          fullWidth
          sx={{
            mt: 1.4,
            "& .MuiOutlinedInput-root": {
              bgcolor: tokens.hover,
              borderRadius: 2,
              fontSize: "0.74rem",
              "& fieldset": { borderColor: tokens.line },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 15 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.6, pb: 0.75, borderBottom: "1px solid", borderColor: tokens.line }}>
          <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.56rem", fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: tokens.text3 }}>
            {t("vehicle")}
          </Typography>
          <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.56rem", fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: tokens.text3 }}>
            {t("speed")} · {t("updated")}
          </Typography>
        </Box>

        <Box
          role="list"
          onScroll={(event) => {
            const list = event.currentTarget;
            const remaining = list.scrollHeight - list.scrollTop - list.clientHeight;
            if (remaining < 160 && visibleVehicles.length < matchedVehicles.length) {
              setVisibleCount((count) => Math.min(count + PAGE_SIZE, matchedVehicles.length));
            }
          }}
          sx={{
            minHeight: 0,
            flex: 1,
            mt: 0.6,
            overflowY: "auto",
            overscrollBehavior: "contain",
            scrollbarWidth: "thin",
            scrollbarColor: `${tokens.lineStrong} transparent`,
            "&::-webkit-scrollbar": { width: 8 },
            "&::-webkit-scrollbar-thumb": { border: "2px solid transparent", borderRadius: 8, bgcolor: tokens.lineStrong, backgroundClip: "content-box" },
          }}
        >
          {visibleVehicles.map((vehicle) => {
            const selected = vehicle.id === selectedVehicleId;
            const secondsAgo = secondsSinceUpdate(vehicle.lastUpdate);
            const freshness = getFreshnessLevel(secondsAgo);
            const offline = vehicle.status === "offline";

            return (
              <Box
                key={vehicle.id}
                component="button"
                type="button"
                role="listitem"
                aria-current={selected ? "true" : undefined}
                onClick={() => setSelectedVehicleId(vehicle.id)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "3px minmax(0, 1fr) auto",
                  alignItems: "center",
                  gap: 1.1,
                  width: "100%",
                  p: 0.9,
                  mb: "1px",
                  border: 0,
                  borderRadius: 2,
                  bgcolor: selected ? tokens.accentSoft : "transparent",
                  boxShadow: selected ? `inset 0 0 0 1px ${tokens.accent}55` : "none",
                  color: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 150ms ease",
                  "&:hover": { bgcolor: selected ? tokens.accentSoft : tokens.hover },
                  "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: -2 },
                }}
              >
                <Box sx={{ width: 3, height: 24, borderRadius: 1, bgcolor: selected ? tokens.accent : getVehicleMarkerColor(vehicle, mode) }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ fontFamily: "var(--font-data)", fontSize: "0.71rem", fontWeight: 500, color: tokens.text1 }}>
                    {vehicle.code}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: "0.62rem", color: tokens.text3 }}>
                    {vehicle.driverName} · {vehicle.model}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.76rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: offline ? tokens.text3 : tokens.text1 }}>
                    {offline ? "—" : vehicle.speedKph}
                    {!offline && (
                      <Box component="span" sx={{ ml: 0.3, fontSize: "0.52rem", fontWeight: 500, color: tokens.text3 }}>
                        km/h
                      </Box>
                    )}
                  </Typography>
                  <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.56rem", fontVariantNumeric: "tabular-nums", color: getFreshnessColor(freshness, mode) }}>
                    {formatAge(secondsAgo)}
                  </Typography>
                </Box>
              </Box>
            );
          })}

          {matchedVehicles.length === 0 && (
            <Box role="status" sx={{ px: 1.25, py: 4, textAlign: "center", color: tokens.text3, fontSize: "0.71rem" }}>
              {connectionStatus === "connecting" ? t("loadingVehicles") : t("noVehicles")}
            </Box>
          )}
        </Box>

        {matchedVehicles.length > 0 && (
          <Typography sx={{ pt: 1, fontFamily: "var(--font-data)", fontSize: "0.58rem", fontVariantNumeric: "tabular-nums", color: tokens.text3, textAlign: "right" }}>
            {t("showing")} {visibleVehicles.length} / {matchedVehicles.length}
          </Typography>
        )}
      </Box>
    </>
  );
}
