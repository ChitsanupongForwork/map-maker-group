"use client";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { Box, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";
import { getSpeedBandColor } from "@/lib/fleet-appearance";
import { formatClock } from "@/lib/history-format";
import { useHistoryStore } from "@/stores/use-history-store";

const ROW_HEIGHT = 28;
/** Rows kept above and below the viewport so fast scrolling never shows gaps. */
const OVERSCAN = 8;

/**
 * Every reading in the window, one row each. A day of ten-second readings is
 * thousands of rows, so only the visible slice is in the DOM — the rest is two
 * spacer boxes, which keeps the scrollbar honest without a list library.
 */
export default function TrackpointList({ onClose }: { onClose: () => void }) {
  const { mode, t } = useUiPreferences();
  const tokens = fleetTokens[mode];
  const track = useHistoryStore((state) => state.track);
  const index = useHistoryStore((state) => state.index);
  const isPlaying = useHistoryStore((state) => state.isPlaying);
  const seekToIndex = useHistoryStore((state) => state.seekToIndex);

  const scrollRef = useRef<HTMLDivElement>(null);
  const programmaticRef = useRef(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(320);
  const [detached, setDetached] = useState(false);
  const [playingWas, setPlayingWas] = useState(isPlaying);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setViewportHeight(element.clientHeight));
    observer.observe(element);
    setViewportHeight(element.clientHeight);
    return () => observer.disconnect();
  }, []);

  // The list rides along with the playhead until the user scrolls away from it,
  // which is a request to look somewhere else and not a moment to be dragged back.
  useEffect(() => {
    const element = scrollRef.current;
    if (!element || detached) return;
    programmaticRef.current = true;
    element.scrollTo({ top: Math.max(0, index * ROW_HEIGHT - element.clientHeight / 2 + ROW_HEIGHT / 2) });
  }, [detached, index]);

  // Pressing play is a request to watch the replay, so the list rejoins the
  // playhead. Adjusted during render rather than in an effect: React applies it
  // before committing, so the list never paints one frame in the wrong place.
  if (playingWas !== isPlaying) {
    setPlayingWas(isPlaying);
    if (isPlaying && detached) setDetached(false);
  }

  const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const last = Math.min(track.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN);
  const rows = track.slice(first, last);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, px: 1.5, py: 1, borderBottom: "1px solid", borderColor: tokens.line, whiteSpace: "nowrap" }}>
        <Typography sx={{ fontSize: "0.74rem", fontWeight: 600, color: tokens.text1 }}>
          {t("pointAt")}{" "}
          <Box component="span" sx={{ fontFamily: "var(--font-data)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {track.length === 0 ? 0 : index + 1} / {track.length}
          </Box>
        </Typography>
        <Tooltip title={t("hideTable")} placement="left" disableInteractive>
          <Box
            component="button"
            type="button"
            onClick={onClose}
            aria-label={t("hideTable")}
            aria-expanded
            sx={{
              display: "grid",
              placeItems: "center",
              width: 24,
              height: 24,
              flexShrink: 0,
              border: 0,
              borderRadius: 2,
              bgcolor: "transparent",
              color: tokens.text2,
              cursor: "pointer",
              transition: "background 140ms ease, color 140ms ease",
              "&:hover": { bgcolor: tokens.hover, color: tokens.text1 },
              "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
            }}
          >
            <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        </Tooltip>
      </Box>

      <Box
        ref={scrollRef}
        onScroll={(event: React.UIEvent<HTMLDivElement>) => {
          setScrollTop(event.currentTarget.scrollTop);
          if (programmaticRef.current) {
            programmaticRef.current = false;
            return;
          }
          setDetached(true);
        }}
        sx={{ minHeight: 0, flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}
      >
        <Box sx={{ height: first * ROW_HEIGHT }} />
        {rows.map((point, offset) => {
          const rowIndex = first + offset;
          const active = rowIndex === index;
          const color = point.speedKph === 0 ? tokens.text3 : getSpeedBandColor(point.speedKph, mode);
          return (
            <Box
              key={`${point.t}-${rowIndex}`}
              component="button"
              type="button"
              onClick={() => seekToIndex(rowIndex)}
              aria-current={active ? "true" : undefined}
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                alignItems: "center",
                gap: 1,
                width: "100%",
                height: ROW_HEIGHT,
                px: 1.5,
                border: 0,
                borderBottom: "1px solid",
                borderColor: tokens.line,
                bgcolor: active ? tokens.accentSoft : "transparent",
                boxShadow: active ? `inset 2px 0 0 ${tokens.accent}` : "none",
                color: point.speedKph === 0 ? tokens.text3 : tokens.text2,
                cursor: "pointer",
                fontFamily: "var(--font-data)",
                fontSize: "0.63rem",
                fontVariantNumeric: "tabular-nums",
                textAlign: "left",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: active ? tokens.accentSoft : tokens.hover },
                "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: -2 },
              }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: point.speedKph === 0 ? tokens.text3 : tokens.text1 }}>{formatClock(point.t, true)}</Box>
              <Box component="span">{point.speedKph === 0 ? "—" : `${point.headingDeg}°`}</Box>
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.7, justifySelf: "end", fontWeight: 700, color }}>
                <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color }} />
                {point.speedKph}
              </Box>
            </Box>
          );
        })}
        <Box sx={{ height: Math.max(0, (track.length - last) * ROW_HEIGHT) }} />
      </Box>

      {detached && (
        <Box sx={{ p: 1, borderTop: "1px solid", borderColor: tokens.line }}>
          <Box
            component="button"
            type="button"
            onClick={() => setDetached(false)}
            sx={{
              width: "100%",
              height: 28,
              border: 0,
              borderRadius: 2,
              bgcolor: tokens.hover,
              color: tokens.text2,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.68rem",
              fontWeight: 600,
              "&:hover": { color: tokens.text1 },
              "&:focus-visible": { outline: "2px solid", outlineColor: tokens.accent, outlineOffset: 2 },
            }}
          >
            {t("followPlayhead")}
          </Box>
        </Box>
      )}
    </>
  );
}
