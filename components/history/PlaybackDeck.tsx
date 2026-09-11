"use client";

import FastForwardRoundedIcon from "@mui/icons-material/FastForwardRounded";
import FastRewindRoundedIcon from "@mui/icons-material/FastRewindRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Box, Tooltip, Typography } from "@mui/material";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";
import { formatClock } from "@/lib/history-format";
import { useHistoryStore, type PlaybackRate } from "@/stores/use-history-store";

const RATES: PlaybackRate[] = [0.5, 1, 2, 4, 8];

/**
 * Every playback control in one bar, in the place the realtime page keeps its
 * filter bar. Following the vehicle lives here rather than on the map because
 * it is a property of the replay, not a map tool.
 */
export default function PlaybackDeck() {
  const { mode, t } = useUiPreferences();
  const tokens = fleetTokens[mode];
  const track = useHistoryStore((state) => state.track);
  const index = useHistoryStore((state) => state.index);
  const elapsedMs = useHistoryStore((state) => state.elapsedMs);
  const totalMs = useHistoryStore((state) => state.totalMs);
  const isPlaying = useHistoryStore((state) => state.isPlaying);
  const rate = useHistoryStore((state) => state.rate);
  const followCamera = useHistoryStore((state) => state.followCamera);
  const setElapsed = useHistoryStore((state) => state.setElapsed);
  const stepBy = useHistoryStore((state) => state.stepBy);
  const togglePlaying = useHistoryStore((state) => state.togglePlaying);
  const setRate = useHistoryStore((state) => state.setRate);
  const setFollowCamera = useHistoryStore((state) => state.setFollowCamera);

  const ready = track.length > 1;
  const current = track[index];
  const startsAt = track[0]?.t ?? "";
  const endsAt = track[track.length - 1]?.t ?? "";

  const transportButton = {
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    border: 0,
    borderRadius: "50%",
    bgcolor: "transparent",
    color: tokens.text2,
    cursor: "pointer",
    transition: "background 160ms ease, color 160ms ease",
    "&:hover": { bgcolor: tokens.hover, color: tokens.text1 },
    "&:disabled": { opacity: 0.4, cursor: "default" },
    "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
  } as const;

  return (
    <Box
      role="group"
      aria-label={t("playback")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: "100%",
        maxWidth: 760,
        p: 0.8,
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
      <Tooltip title={t("stepBack")} disableInteractive>
        <Box component="button" type="button" onClick={() => stepBy(-1)} disabled={!ready} aria-label={t("stepBack")} sx={{ ...transportButton, width: 30, height: 30 }}>
          <FastRewindRoundedIcon sx={{ fontSize: 15 }} />
        </Box>
      </Tooltip>

      <Tooltip title={isPlaying ? t("pause") : t("play")} disableInteractive>
        <Box
          component="button"
          type="button"
          onClick={togglePlaying}
          disabled={!ready}
          aria-label={isPlaying ? t("pause") : t("play")}
          sx={{ ...transportButton, width: 34, height: 34, bgcolor: tokens.accent, color: tokens.accentContrast, "&:hover": { bgcolor: tokens.accent, color: tokens.accentContrast } }}
        >
          {isPlaying ? <PauseRoundedIcon sx={{ fontSize: 18 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
        </Box>
      </Tooltip>

      <Tooltip title={t("stepForward")} disableInteractive>
        <Box component="button" type="button" onClick={() => stepBy(1)} disabled={!ready} aria-label={t("stepForward")} sx={{ ...transportButton, width: 30, height: 30 }}>
          <FastForwardRoundedIcon sx={{ fontSize: 15 }} />
        </Box>
      </Tooltip>

      <Box sx={{ minWidth: 120, flex: 1, display: "flex", flexDirection: "column", gap: 0.2 }}>
        <Box
          component="input"
          type="range"
          min={0}
          max={Math.max(1, totalMs)}
          step={200}
          value={Math.round(elapsedMs)}
          disabled={!ready}
          aria-label={t("timeline")}
          aria-valuetext={current ? formatClock(current.t, true) : undefined}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setElapsed(Number(event.target.value))}
          sx={{
            width: "100%",
            height: 4,
            m: 0,
            appearance: "none",
            borderRadius: 3,
            cursor: "pointer",
            background: `linear-gradient(to right, ${tokens.accent} ${totalMs ? (elapsedMs / totalMs) * 100 : 0}%, ${tokens.lineStrong} ${totalMs ? (elapsedMs / totalMs) * 100 : 0}%)`,
            "&::-webkit-slider-thumb": { appearance: "none", width: 12, height: 12, borderRadius: "50%", background: tokens.accent, border: `2px solid ${tokens.panelSolid}`, cursor: "pointer" },
            "&::-moz-range-thumb": { width: 10, height: 10, borderRadius: "50%", background: tokens.accent, border: `2px solid ${tokens.panelSolid}`, cursor: "pointer" },
            "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 3 },
            "&:disabled": { opacity: 0.5, cursor: "default" },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", fontVariantNumeric: "tabular-nums", color: tokens.text3 }}>{startsAt ? formatClock(startsAt) : "--:--"}</Typography>
          <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: tokens.text1 }}>{current ? formatClock(current.t, true) : "--:--:--"}</Typography>
          <Typography sx={{ fontFamily: "var(--font-data)", fontSize: "0.58rem", fontVariantNumeric: "tabular-nums", color: tokens.text3 }}>{endsAt ? formatClock(endsAt) : "--:--"}</Typography>
        </Box>
      </Box>

      <Box aria-hidden sx={{ flexShrink: 0, width: "1px", height: 22, bgcolor: tokens.line }} />

      <Tooltip title={t("followHint")} disableInteractive>
        <Box
          component="button"
          type="button"
          role="switch"
          aria-checked={followCamera}
          onClick={() => setFollowCamera(!followCamera)}
          sx={{
            display: "flex",
            flexShrink: 0,
            alignItems: "center",
            gap: 0.7,
            height: 30,
            px: 1.2,
            border: 0,
            borderRadius: 18,
            bgcolor: followCamera ? tokens.accentSoft : "transparent",
            color: followCamera ? tokens.accent : tokens.text2,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "0.68rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            transition: "background 160ms ease, color 160ms ease",
            "&:hover": { bgcolor: followCamera ? tokens.accentSoft : tokens.hover },
            "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
          }}
        >
          <MyLocationRoundedIcon sx={{ fontSize: 14 }} />
          {t("followVehicle")}
        </Box>
      </Tooltip>

      <Box aria-hidden sx={{ flexShrink: 0, width: "1px", height: 22, bgcolor: tokens.line }} />

      <Box component="fieldset" sx={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 0.2, m: 0, p: 0, border: 0 }}>
        <Typography component="legend" sx={{ float: "left", pr: 0.8, fontFamily: "var(--font-data)", fontSize: "0.55rem", letterSpacing: "0.1em", lineHeight: "26px", color: tokens.text3 }}>
          {t("playbackSpeed")}
        </Typography>
        {RATES.map((value) => {
          const active = rate === value;
          return (
            <Box key={value} component="label" sx={{ position: "relative", display: "block", flexShrink: 0 }}>
              <Box
                component="input"
                type="radio"
                name="history-rate"
                value={value}
                checked={active}
                onChange={() => setRate(value)}
                sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", m: 0, opacity: 0, cursor: "pointer" }}
              />
              <Box
                component="span"
                sx={{
                  display: "block",
                  px: 0.9,
                  py: 0.5,
                  borderRadius: 14,
                  bgcolor: active ? tokens.accent : "transparent",
                  color: active ? tokens.accentContrast : tokens.text2,
                  fontFamily: "var(--font-data)",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  transition: "background 140ms ease, color 140ms ease",
                  "input:hover + &": { bgcolor: active ? tokens.accent : tokens.hover },
                  "input:focus-visible + &": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
                }}
              >
                {value}×
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
