"use client";

import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { Box, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";
import { getConnectionAppearance } from "@/lib/fleet-appearance";
import { useFleetStore } from "@/stores/use-fleet-store";

export const RAIL_WIDTH = 64;
export const MOBILE_BAR_HEIGHT = 56;

/**
 * The app's only navigation, and the home of the controls that used to sit in a
 * header the full-bleed layout no longer has.
 *
 * The rail keeps a fixed 64px width — it never expands. Labels live in
 * tooltips, so the rail never covers the panel beside it and the map area is
 * the same width at every moment.
 */
export default function AppSidebar() {
  const pathname = usePathname();
  const { locale, mode, setLocale, t, toggleMode } = useUiPreferences();
  const connectionStatus = useFleetStore((state) => state.connectionStatus);
  const connection = getConnectionAppearance(connectionStatus, mode);
  const tokens = fleetTokens[mode];

  const navigation = [
    { href: "/", label: t("monitor"), icon: DirectionsCarRoundedIcon },
    { href: "/history", label: t("history"), icon: HistoryRoundedIcon },
  ] as const;

  const itemBase = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 1.4,
    height: 42,
    px: "11px",
    borderRadius: 2.5,
    color: tokens.text2,
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "background 160ms ease, color 160ms ease",
    "&:hover": { bgcolor: tokens.hover, color: tokens.text1 },
    "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
  } as const;

  return (
    <>
      {/* Reserves the rail's column so the map never sits underneath it. */}
      <Box aria-hidden sx={{ flexShrink: 0, width: { xs: "100%", sm: RAIL_WIDTH }, height: { xs: MOBILE_BAR_HEIGHT, sm: "auto" } }} />

      <Box
        component="nav"
        aria-label={t("monitor")}
        sx={{
          position: "fixed",
          zIndex: 1200,
          left: 0,
          right: { xs: 0, sm: "auto" },
          top: { xs: "auto", sm: 0 },
          bottom: 0,
          width: { xs: "100%", sm: RAIL_WIDTH },
          height: { xs: MOBILE_BAR_HEIGHT, sm: "auto" },
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          alignItems: "center",
          justifyContent: { xs: "space-around", sm: "flex-start" },
          gap: { xs: 0, sm: 0 },
          px: { xs: 1.5, sm: "11px" },
          py: { xs: 0, sm: 2 },
          bgcolor: tokens.chrome,
          borderRight: { xs: 0, sm: `1px solid ${tokens.line}` },
          borderTop: { xs: `1px solid ${tokens.line}`, sm: 0 },
          overflow: "hidden",
        }}
      >
        <Tooltip title="Fleet Monitor" placement="right" disableInteractive>
          <Box sx={{ display: { xs: "none", sm: "grid" }, flexShrink: 0, placeItems: "center", width: 34, height: 34, borderRadius: 2.25, bgcolor: tokens.accent }}>
            <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "0.94rem", fontWeight: 700, color: tokens.accentContrast }}>F</Typography>
          </Box>
        </Tooltip>

        <Box sx={{ display: "flex", flexDirection: { xs: "row", sm: "column" }, gap: { xs: 1, sm: 0.5 }, mt: { xs: 0, sm: 3.5 }, width: { xs: "auto", sm: "100%" } }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Tooltip key={item.href} title={item.label} placement="right" disableInteractive>
                <Box
                  component={Link}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    ...itemBase,
                    justifyContent: "center",
                    width: { xs: 46, sm: 42 },
                    px: 0,
                    color: active ? tokens.accent : tokens.text2,
                    bgcolor: active ? tokens.accentSoft : "transparent",
                    "&::before": active
                      ? { content: '""', position: "absolute", left: -11, top: 11, bottom: 11, width: 2.5, borderRadius: "0 2px 2px 0", bgcolor: tokens.accent, display: { xs: "none", sm: "block" } }
                      : undefined,
                    "&:hover": { bgcolor: active ? tokens.accentSoft : tokens.hover, color: active ? tokens.accent : tokens.text1 },
                  }}
                >
                  <Icon sx={{ fontSize: 19, flexShrink: 0 }} />
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        <Box sx={{ display: { xs: "none", sm: "block" }, mt: "auto", width: "100%" }}>
          <Tooltip title={t(connection.labelKey)} placement="right" disableInteractive>
            <Box
              role="status"
              aria-label={t(connection.labelKey)}
              sx={{ display: "grid", placeItems: "center", width: 42, height: 42, mx: "auto", borderRadius: 2.25, bgcolor: connection.softBg, border: "1px solid", borderColor: connection.softBg }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: connection.color,
                  // Only a genuinely live connection pulses; a still dot is the
                  // signal that something stopped.
                  animation: connectionStatus === "live" ? "fleet-ping 1.9s ease-out infinite" : "none",
                  "@keyframes fleet-ping": {
                    "0%": { boxShadow: `0 0 0 0 ${connection.color}8C` },
                    "70%": { boxShadow: `0 0 0 7px ${connection.color}00` },
                    "100%": { boxShadow: `0 0 0 0 ${connection.color}00` },
                  },
                  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
                }}
              />
            </Box>
          </Tooltip>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.6, mt: 1 }}>
            <Tooltip title={t("language")} placement="right" disableInteractive>
              <Box
                component="button"
                type="button"
                onClick={() => setLocale(locale === "th" ? "en" : "th")}
                aria-label={t("language")}
                sx={{ ...itemBase, justifyContent: "center", width: 42, height: 32, px: 0, border: 0, bgcolor: tokens.hover, cursor: "pointer", fontFamily: "var(--font-data)", fontSize: "0.63rem", fontWeight: 700 }}
              >
                {locale === "th" ? "EN" : "TH"}
              </Box>
            </Tooltip>
            <Tooltip title={t("theme")} placement="right" disableInteractive>
              <Box
                component="button"
                type="button"
                onClick={toggleMode}
                aria-label={t("theme")}
                sx={{ ...itemBase, justifyContent: "center", width: 42, height: 32, px: 0, border: 0, bgcolor: tokens.hover, cursor: "pointer" }}
              >
                {mode === "light" ? <DarkModeRoundedIcon sx={{ fontSize: 15 }} /> : <LightModeRoundedIcon sx={{ fontSize: 15 }} />}
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Narrow screens keep the utilities reachable without the expanded rail. */}
        <Box sx={{ display: { xs: "flex", sm: "none" }, alignItems: "center", gap: 1 }}>
          <Box component="button" type="button" onClick={() => setLocale(locale === "th" ? "en" : "th")} aria-label={t("language")} sx={{ ...itemBase, justifyContent: "center", width: 40, px: 0, border: 0, bgcolor: "transparent", cursor: "pointer", fontFamily: "var(--font-data)", fontSize: "0.63rem", fontWeight: 700 }}>
            {locale === "th" ? "EN" : "TH"}
          </Box>
          <Box component="button" type="button" onClick={toggleMode} aria-label={t("theme")} sx={{ ...itemBase, justifyContent: "center", width: 40, px: 0, border: 0, bgcolor: "transparent", cursor: "pointer" }}>
            {mode === "light" ? <DarkModeRoundedIcon sx={{ fontSize: 17 }} /> : <LightModeRoundedIcon sx={{ fontSize: 17 }} />}
          </Box>
        </Box>
      </Box>
    </>
  );
}
