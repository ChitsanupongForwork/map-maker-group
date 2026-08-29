"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress, Typography } from "@mui/material";

import { useLocationStore } from "@/stores/use-location-store";

const ClusterMap = dynamic(() => import("@/components/map/ClusterMap"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
      }}
    >
      <CircularProgress size={32} />
    </Box>
  ),
});

export default function MapPanel() {
  const isAdding = useLocationStore((state) => state.isAdding);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <ClusterMap />
      <Box sx={{ position: "absolute", top: 18, left: 18, zIndex: 1000, maxWidth: 250, px: 1.5, py: 1.1, borderRadius: 2.5, bgcolor: "rgba(34,32,58,0.92)", color: "#fff", pointerEvents: "none", boxShadow: "0 12px 28px rgba(34,32,58,0.2)" }}>
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 800 }}>
          {isAdding ? "เลือกตำแหน่งบนแผนที่" : "Pin Atlas · Demo canvas"}
        </Typography>
        <Typography sx={{ mt: 0.2, fontSize: "0.67rem", opacity: 0.75, lineHeight: 1.35 }}>
          {isAdding ? "คลิกซ้ำเพื่อเปลี่ยนจุดได้" : "ข้อมูลทั้งหมดเป็นข้อมูลสาธิต"}
        </Typography>
      </Box>
    </Box>
  );
}
