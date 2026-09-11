"use client";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useRef } from "react";

import HeadingCompass from "@/components/fleet/HeadingCompass";
import SpeedSparkline from "@/components/fleet/SpeedSparkline";
import { useUiPreferences } from "@/components/providers/MuiProvider";
import {
  fleetMotion,
  fleetTokens,
  panelTransition,
  reopenTransition,
} from "@/lib/design-tokens";
import { getVehicleMarkerColor } from "@/lib/fleet-appearance";
import { formatAge, secondsSinceUpdate } from "@/lib/vehicle-freshness";
import { useFleetStore } from "@/stores/use-fleet-store";

export const DETAILS_PANEL_WIDTH = 282;

function Telemetry({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const { mode } = useUiPreferences();
  const tokens = fleetTokens[mode];
  return (
    <Box sx={{ minWidth: 0, p: 1.05, borderRadius: 2, bgcolor: tokens.hover }}>
      <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.5rem", fontWeight: 500, letterSpacing: "0.11em", textTransform: "uppercase", color: tokens.text3 }}>
        {label}
      </Typography>
      <Typography noWrap sx={{ mt: 0.35, fontSize: "0.72rem", fontWeight: 600, color: valueColor ?? tokens.text1 }}>
        {value}
      </Typography>
    </Box>
  );
}

/**
 * The selected vehicle, as a panel that floats over the map and can be pushed
 * out of the way. It slides out to the right — the side it will come back from.
 */
export default function VehicleDetailsDrawer() {
  const { locale, mode, t } = useUiPreferences();
  const vehicles = useFleetStore((state) => state.vehicles);
  const selectedVehicleId = useFleetStore((state) => state.selectedVehicleId);
  const detailsOpen = useFleetStore((state) => state.detailsOpen);
  const setDetailsOpen = useFleetStore((state) => state.setDetailsOpen);
  const tokens = fleetTokens[mode];
  const reopenRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const vehicle = vehicles.find((item) => item.id === selectedVehicleId);
  if (!vehicle) return null;

  const statusColor = getVehicleMarkerColor(vehicle, mode);
  const secondsAgo = secondsSinceUpdate(vehicle.lastUpdate);
  const statusLabel = vehicle.status === "moving" ? t("moving") : vehicle.status === "stopped" ? t("stopped") : t("offline");

  function closePanel() {
    setDetailsOpen(false);
    window.requestAnimationFrame(() => reopenRef.current?.focus());
  }

  function openPanel() {
    setDetailsOpen(true);
    window.requestAnimationFrame(() => closeRef.current?.focus());
  }

  return (
    <>
      <Tooltip title={t("vehicleDetails")} placement="left" disableInteractive>
        <IconButton
          ref={reopenRef}
          onClick={openPanel}
          aria-label={t("vehicleDetails")}
          aria-expanded={detailsOpen}
          sx={{
            position: "absolute",
            zIndex: 950,
            top: 16,
            right: 16,
            width: 38,
            height: 38,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: tokens.line,
            bgcolor: tokens.panel,
            color: tokens.text2,
            backdropFilter: "blur(8px)",
            opacity: detailsOpen ? 0 : 1,
            transform: detailsOpen ? "translateX(10px) scale(0.9)" : "translateX(0) scale(1)",
            pointerEvents: detailsOpen ? "none" : "auto",
            transition: reopenTransition,
            "&:hover": { bgcolor: tokens.panelSolid, color: tokens.text1 },
            "@media (prefers-reduced-motion: reduce)": { transition: "opacity 1ms", transform: "none" },
          }}
        >
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Box
        component="aside"
        aria-label={t("vehicleDetails")}
        inert={!detailsOpen}
        sx={{
          position: "absolute",
          zIndex: 960,
          top: 16,
          right: 16,
          maxHeight: { xs: "calc(100% - 90px)", sm: "calc(100% - 32px)" },
          width: { xs: "calc(100% - 32px)", sm: DETAILS_PANEL_WIDTH },
          maxWidth: "calc(100% - 32px)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          p: 1.85,
          borderRadius: 3,
          border: "1px solid",
          borderColor: tokens.line,
          bgcolor: tokens.panel,
          backdropFilter: "blur(10px) saturate(1.2)",
          WebkitBackdropFilter: "blur(10px) saturate(1.2)",
          boxShadow: "0 10px 34px rgb(0 0 0 / 0.22)",
          opacity: detailsOpen ? 1 : 0,
          transform: detailsOpen ? "translateX(0)" : `translateX(${fleetMotion.slidePx}px)`,
          pointerEvents: detailsOpen ? "auto" : "none",
          transition: panelTransition(detailsOpen),
          "@media (prefers-reduced-motion: reduce)": { transition: "opacity 1ms", transform: "none" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontFamily: "var(--font-data)", fontSize: "1.02rem", fontWeight: 700, letterSpacing: "-0.02em", color: tokens.text1 }}>
              {vehicle.code}
            </Typography>
            <Typography noWrap sx={{ mt: 0.15, fontSize: "0.66rem", color: tokens.text3 }}>
              {vehicle.make} {vehicle.model} · {vehicle.licensePlate}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 0.85 }}>
            <Box sx={{ px: 0.95, py: 0.35, borderRadius: 20, bgcolor: `${statusColor}26`, color: statusColor, fontSize: "0.56rem", fontWeight: 600 }}>
              {statusLabel}
            </Box>
            <Tooltip title={t("close")} disableInteractive>
              <IconButton
                ref={closeRef}
                onClick={closePanel}
                aria-label={t("close")}
                size="small"
                sx={{ width: 26, height: 26, borderRadius: 1.75, border: "1px solid", borderColor: tokens.line, bgcolor: tokens.hover, color: tokens.text2, "&:hover": { color: tokens.text1 } }}
              >
                <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 68px", alignItems: "center", gap: 1.5, mt: 1.75 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "2.5rem", fontWeight: 700, lineHeight: 0.9, letterSpacing: "-0.045em", fontVariantNumeric: "tabular-nums", color: tokens.text1 }}>
              {vehicle.speedKph}
              <Box component="span" sx={{ ml: 0.55, fontSize: "0.72rem", fontWeight: 500, letterSpacing: 0, color: tokens.text3 }}>km/h</Box>
            </Typography>
            <Box sx={{ mt: 0.75 }}>
              <SpeedSparkline vehicleId={vehicle.id} speedKph={vehicle.speedKph} color={statusColor} width={168} height={30} />
            </Box>
          </Box>
          <HeadingCompass headingDeg={vehicle.headingDeg} color={tokens.accent} trackColor={tokens.line} labelColor={tokens.text1} />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.9, mt: 1.75 }}>
          <Telemetry label="ACC" value={vehicle.accOn ? t("accOn") : t("accOff")} valueColor={vehicle.accOn ? statusColor : tokens.text2} />
          <Telemetry label={t("updated")} value={formatAge(secondsAgo)} />
          <Telemetry label={t("origin")} value={vehicle.origin} />
          <Telemetry label={t("destination")} value={vehicle.destination} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: tokens.line }}>
          <Box sx={{ display: "grid", flexShrink: 0, placeItems: "center", width: 30, height: 30, borderRadius: 2, bgcolor: tokens.accent, color: tokens.accentContrast, fontFamily: "var(--font-data)", fontSize: "0.63rem", fontWeight: 700 }}>
            {vehicle.driverInitials}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: "0.75rem", fontWeight: 600, color: tokens.text1 }}>{vehicle.driverName}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.45, color: tokens.text3 }}>
              <PhoneRoundedIcon sx={{ fontSize: 11 }} />
              <Typography noWrap sx={{ fontFamily: "var(--font-data)", fontSize: "0.6rem" }}>{vehicle.driverPhone}</Typography>
            </Box>
          </Box>
        </Box>

        <Typography sx={{ mt: 1.5, fontSize: "0.6rem", lineHeight: 1.5, color: tokens.text3 }}>
          {locale === "th" ? "ชื่อคนขับ เบอร์โทร และข้อมูลรถเป็นข้อมูลสมมติสำหรับ portfolio" : "Driver, phone, and vehicle information are fictional portfolio data."}
        </Typography>
      </Box>
    </>
  );
}
