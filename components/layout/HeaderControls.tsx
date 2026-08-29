"use client";

import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

import { useUiPreferences } from "@/components/providers/MuiProvider";

export default function HeaderControls() {
  const { locale, mode, setLocale, t, toggleMode } = useUiPreferences();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.35, p: 0.35, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "background.paper", boxShadow: "0 5px 14px rgba(35,104,171,0.06)" }}>
      <Tooltip title={`${t("language")}: ${locale === "th" ? "English" : "ไทย"}`}><IconButton aria-label={t("language")} onClick={() => setLocale(locale === "th" ? "en" : "th")} size="small" sx={{ width: 32, height: 32, borderRadius: 2, color: "primary.main", "&:hover": { bgcolor: "rgba(22,119,255,0.08)" } }}><Typography sx={{ fontSize: "0.66rem", fontWeight: 900 }}>{locale === "th" ? "EN" : "TH"}</Typography></IconButton></Tooltip>
      <Tooltip title={`${t("theme")}: ${mode === "light" ? t("dark") : t("light")}`}><IconButton aria-label={t("theme")} onClick={toggleMode} size="small" sx={{ width: 32, height: 32, borderRadius: 2, color: "text.secondary", "&:hover": { bgcolor: "rgba(22,119,255,0.08)", color: "primary.main" } }}>{mode === "light" ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}</IconButton></Tooltip>
    </Box>
  );
}
