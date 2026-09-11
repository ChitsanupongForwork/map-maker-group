"use client";

import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, Typography } from "@mui/material";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";
import { getVehicleMarkerColor } from "@/lib/fleet-appearance";
import type { FleetVehicle } from "@/types/fleet";

/** Rows rendered at once. The fleet is a thousand vehicles; the list is not. */
const VISIBLE_LIMIT = 40;

/**
 * Plate-first vehicle picker. A native select cannot show a plate next to a
 * code next to a status dot, and cannot be searched — with a thousand vehicles
 * scrolling to one is the whole job.
 */
export default function VehiclePicker({ vehicles, vehicleId, onSelect }: { vehicles: FleetVehicle[]; vehicleId: string; onSelect: (id: string) => void }) {
  const { mode, t } = useUiPreferences();
  const tokens = fleetTokens[mode];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);

  const selected = vehicles.find((item) => item.id === vehicleId);

  const matches = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) return vehicles.slice(0, VISIBLE_LIMIT);
    const found: FleetVehicle[] = [];
    for (const vehicle of vehicles) {
      if (
        vehicle.licensePlate.toLowerCase().includes(normalized) ||
        vehicle.code.toLowerCase().includes(normalized) ||
        vehicle.label.toLowerCase().includes(normalized) ||
        vehicle.driverName.toLowerCase().includes(normalized)
      ) {
        found.push(vehicle);
        if (found.length === VISIBLE_LIMIT) break;
      }
    }
    return found;
  }, [deferredQuery, vehicles]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <Box ref={rootRef} sx={{ position: "relative" }}>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("chooseVehicle")}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          minWidth: 168,
          height: 34,
          px: 1.1,
          border: "1px solid",
          borderColor: open ? tokens.accent : tokens.line,
          borderRadius: 2.5,
          bgcolor: tokens.panelSolid,
          color: tokens.text1,
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
          transition: "border-color 140ms ease",
          "&:hover": { borderColor: tokens.lineStrong },
          "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
        }}
      >
        <Box sx={{ display: "grid", placeItems: "center", flexShrink: 0, width: 22, height: 22, borderRadius: 1.5, bgcolor: tokens.hover, color: selected ? getVehicleMarkerColor(selected, mode) : tokens.text3 }}>
          <DirectionsCarRoundedIcon sx={{ fontSize: 13 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.72rem", fontWeight: 700, lineHeight: 1.25, color: tokens.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected?.licensePlate ?? "—"}
          </Typography>
          <Typography sx={{ fontSize: "0.6rem", lineHeight: 1.25, color: tokens.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected ? `${selected.code} · ${selected.driverName}` : t("chooseVehicle")}
          </Typography>
        </Box>
        <ExpandMoreRoundedIcon sx={{ flexShrink: 0, fontSize: 16, color: tokens.text3, transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms ease" }} />
      </Box>

      {open && (
        <Box
          role="listbox"
          aria-label={t("chooseVehicle")}
          sx={{
            position: "absolute",
            zIndex: 20,
            top: "calc(100% + 6px)",
            left: 0,
            width: 268,
            maxWidth: "80vw",
            display: "flex",
            flexDirection: "column",
            border: "1px solid",
            borderColor: tokens.line,
            borderRadius: 3,
            bgcolor: tokens.panelSolid,
            boxShadow: "0 18px 44px rgb(0 0 0 / 0.26)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, px: 1.2, py: 0.9, borderBottom: "1px solid", borderColor: tokens.line }}>
            <SearchRoundedIcon sx={{ fontSize: 15, color: tokens.text3 }} />
            <Box
              component="input"
              ref={searchRef}
              value={query}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
              placeholder={t("searchPlate")}
              aria-label={t("searchPlate")}
              sx={{
                width: "100%",
                border: 0,
                bgcolor: "transparent",
                color: tokens.text1,
                fontFamily: "inherit",
                fontSize: "0.75rem",
                outline: "none",
                "&::placeholder": { color: tokens.text3 },
              }}
            />
          </Box>

          <Box sx={{ maxHeight: 268, overflowY: "auto", overscrollBehavior: "contain" }}>
            {matches.length === 0 && (
              <Typography sx={{ px: 1.4, py: 1.6, fontSize: "0.72rem", color: tokens.text3 }}>{t("noVehicles")}</Typography>
            )}
            {matches.map((vehicle) => {
              const active = vehicle.id === vehicleId;
              return (
                <Box
                  key={vehicle.id}
                  component="button"
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(vehicle.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                    px: 1.2,
                    py: 0.8,
                    border: 0,
                    bgcolor: active ? tokens.accentSoft : "transparent",
                    boxShadow: active ? `inset 2px 0 0 ${tokens.accent}` : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    "&:hover": { bgcolor: active ? tokens.accentSoft : tokens.hover },
                    "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: -2 },
                  }}
                >
                  <Box sx={{ flexShrink: 0, width: 8, height: 8, borderRadius: "50%", bgcolor: getVehicleMarkerColor(vehicle, mode) }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.72rem", fontWeight: 700, color: tokens.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {vehicle.licensePlate}
                    </Typography>
                    <Typography sx={{ fontSize: "0.62rem", color: tokens.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {vehicle.code} · {vehicle.driverName}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Typography sx={{ px: 1.2, py: 0.7, borderTop: "1px solid", borderColor: tokens.line, fontSize: "0.6rem", color: tokens.text3 }}>
            {t("showing")} {matches.length} / {vehicles.length}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
