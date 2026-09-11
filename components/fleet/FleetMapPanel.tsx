"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

import VehicleDetailsDrawer from "@/components/fleet/VehicleDetailsDrawer";
import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";

const FleetMap = dynamic(() => import("@/components/fleet/FleetMap"), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
      <CircularProgress size={26} />
    </Box>
  ),
});

export default function FleetMapPanel() {
  const { mode } = useUiPreferences();

  return (
    <Box sx={{ position: "absolute", inset: 0, bgcolor: fleetTokens[mode].mapGround }}>
      <FleetMap />
      <VehicleDetailsDrawer />
    </Box>
  );
}
