"use client";

import { Box } from "@mui/material";

import AppSidebar from "@/components/layout/AppSidebar";
import FleetFilterBar from "@/components/fleet/FleetFilterBar";
import FleetList from "@/components/fleet/FleetList";
import FleetMapPanel from "@/components/fleet/FleetMapPanel";
import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";

/**
 * Full-bleed map with everything else floating over it. The map is the reason
 * anyone opens this page, so nothing opaque is allowed to flank it.
 */
export default function DashboardShell() {
  const { mode } = useUiPreferences();
  const tokens = fleetTokens[mode];

  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: { xs: "column-reverse", sm: "row" },
        bgcolor: tokens.mapGround,
        // A full-screen map never scrolls; without this, Leaflet's own layers
        // push the document a few pixels wide and the page grows a scrollbar.
        overflow: "hidden",
      }}
    >
      <AppSidebar />

      <Box component="main" sx={{ position: "relative", minWidth: 0, minHeight: 0, flex: 1 }}>
        <FleetMapPanel />
        <FleetList />

        {/* Centred on the map and left there. The panels open and close over
            it; a control that moves whenever an unrelated panel toggles is
            harder to aim at than one that never moves. */}
        <Box
          sx={{
            position: "absolute",
            zIndex: 970,
            bottom: 16,
            left: { xs: 12, sm: 16 },
            right: { xs: 12, sm: 16 },
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            "& > *": { pointerEvents: "auto" },
          }}
        >
          <FleetFilterBar />
        </Box>
      </Box>
    </Box>
  );
}
