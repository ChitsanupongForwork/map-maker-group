"use client";

import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useUiPreferences } from "@/components/providers/MuiProvider";

export default function AppSidebar() {
  const pathname = usePathname();
  const { t } = useUiPreferences();
  const navigation = [
    { href: "/", label: t("monitor"), icon: DirectionsCarRoundedIcon },
    { href: "/history", label: t("history"), icon: HistoryRoundedIcon },
  ] as const;

  return (
    <Box
      component="nav"
      aria-label="เมนูหลัก"
      sx={{
        width: { xs: "100%", sm: 72 },
        height: { xs: 58, sm: "auto" },
        flexShrink: 0,
        display: "flex",
        flexDirection: { xs: "row", sm: "column" },
        alignItems: "center",
        justifyContent: { xs: "center", sm: "flex-start" },
        py: { xs: 0.5, sm: 2 },
        px: { xs: 1, sm: 1.25 },
        bgcolor: "#082447",
        borderRight: { xs: "none", sm: "1px solid rgba(176, 215, 255, 0.14)" },
        borderTop: { xs: "1px solid rgba(176, 215, 255, 0.14)", sm: "none" },
      }}
    >
      <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", justifyContent: "center", minHeight: 48 }}>
        <Box sx={{ width: 36, height: 36, display: "grid", flexShrink: 0, placeItems: "center", borderRadius: "13px 13px 13px 4px", bgcolor: "#6DB6FF", boxShadow: "0 10px 24px rgba(33,135,255,0.32)", transform: "rotate(-45deg)" }}>
          <Typography sx={{ color: "#082447", fontSize: "0.86rem", fontWeight: 900, transform: "rotate(45deg)" }}>F</Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "row", sm: "column" }, alignItems: "center", justifyContent: "center", gap: { xs: 1.25, sm: 0.65 }, mt: { xs: 0, sm: 5 }, width: { xs: "auto", sm: "100%" } }}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Tooltip key={item.href} title={item.label} placement="right">
              <IconButton component={Link} href={item.href} aria-label={item.label} aria-current={active ? "page" : undefined} sx={{ width: 46, height: 46, borderRadius: 2.5, color: active ? "#0B315E" : "#B9D8F5", bgcolor: active ? "#EDF7FF" : "transparent", boxShadow: active ? "0 8px 20px rgba(1,18,42,0.14)" : "none", transition: "background 180ms ease, color 180ms ease, transform 180ms ease", "&:hover": { color: active ? "#0B315E" : "#FFF", bgcolor: active ? "#FFF" : "rgba(255,255,255,0.1)", transform: "translateY(-1px)" } }}><Icon fontSize="small" /></IconButton>
            </Tooltip>
          );
        })}
      </Box>

      <Tooltip title="Live simulation" placement="right"><Box sx={{ display: { xs: "none", sm: "grid" }, mt: "auto", placeItems: "center", width: 46, height: 46, border: "1px solid rgba(188,222,255,0.14)", borderRadius: 2.5, bgcolor: "rgba(255,255,255,0.05)" }}><Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#62E6B2", boxShadow: "0 0 0 4px rgba(98,230,178,0.11)" }} /></Box></Tooltip>
    </Box>
  );
}
