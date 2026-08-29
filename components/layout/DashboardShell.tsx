"use client";

import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { Box, Chip, Typography } from "@mui/material";

import AppSidebar from "@/components/layout/AppSidebar";
import SplitLayout from "@/components/layout/SplitLayout";
import FleetList from "@/components/fleet/FleetList";
import FleetMapPanel from "@/components/fleet/FleetMapPanel";
import FleetRealtimeConnection from "@/components/fleet/FleetRealtimeConnection";
import HeaderControls from "@/components/layout/HeaderControls";
import { useUiPreferences } from "@/components/providers/MuiProvider";

export default function DashboardShell() {
  const { t } = useUiPreferences();
  return (
    <Box sx={{ height: "100dvh", display: "flex", flexDirection: { xs: "column", sm: "row" }, bgcolor: "background.default" }}>
      <FleetRealtimeConnection />
      <AppSidebar />
      <Box sx={{ minWidth: 0, minHeight: 0, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box component="header" sx={{ minHeight: { xs: 62, sm: 76 }, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.25, px: { xs: 1.5, sm: 3.5 }, bgcolor: "background.default" }}>
        <Box>
          <Typography component="h1" sx={{ fontSize: { xs: "1.12rem", sm: "1.32rem" }, fontWeight: 900, letterSpacing: "-0.045em", color: "text.primary" }}>{t("monitor")}</Typography>
          <Typography sx={{ mt: 0.25, fontSize: "0.72rem", color: "text.secondary" }}>{t("portfolio")}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, sm: 1.25 } }}>
          <Chip icon={<BoltRoundedIcon />} label="Live" size="small" sx={{ display: { xs: "none", sm: "inline-flex" }, height: 30, borderRadius: 2, bgcolor: "rgba(22,163,74,0.10)", color: "#168A67", fontSize: "0.72rem", fontWeight: 900, "& .MuiChip-icon": { color: "#168A67" } }} />
          <Typography sx={{ display: { xs: "none", lg: "block" }, fontSize: "0.72rem", color: "text.secondary" }}>{t("original")}</Typography><HeaderControls />
        </Box>
      </Box>
      <Box sx={{ minHeight: 0, flex: 1, px: { xs: 0.9, sm: 2.5 }, pb: { xs: 0.9, sm: 2.5 } }}>
        <SplitLayout left={<FleetList />} right={<FleetMapPanel />} />
      </Box>
      </Box>
    </Box>
  );
}
