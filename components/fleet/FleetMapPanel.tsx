"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

import VehicleDetailsDrawer from "@/components/fleet/VehicleDetailsDrawer";

const FleetMap = dynamic(() => import("@/components/fleet/FleetMap"), {
  ssr: false,
  loading: () => <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}><CircularProgress /></Box>,
});

export default function FleetMapPanel() {
  return (
    <Box sx={{ position: "relative", height: "100%", bgcolor: "background.paper" }}>
      <FleetMap />
      <VehicleDetailsDrawer />
    </Box>
  );
}
