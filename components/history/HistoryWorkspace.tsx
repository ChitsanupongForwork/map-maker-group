"use client";

import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { Box, Chip, Typography } from "@mui/material";

import { getVehicleMarkerColor } from "@/lib/fleet-appearance";
import AppSidebar from "@/components/layout/AppSidebar";
import HeaderControls from "@/components/layout/HeaderControls";
import { useUiPreferences } from "@/components/providers/MuiProvider";
import { useFleetStore } from "@/stores/use-fleet-store";

const colors = { updated: "#1677FF", moving: "#16A34A", stopped: "#F97316", offline: "#64748B" } as const;

export default function HistoryWorkspace() {
  const { locale, t } = useUiPreferences();
  const vehicles = useFleetStore((state) => state.vehicles);
  const selectedVehicleId = useFleetStore((state) => state.selectedVehicleId);
  const setSelectedVehicleId = useFleetStore((state) => state.setSelectedVehicleId);
  const vehicle = vehicles.find((item) => item.id === selectedVehicleId) ?? vehicles[0];
  const vehicleHistory = locale === "th" ? [
    { day: "วันนี้", time: "10:42", title: t("updated"), detail: "รับตำแหน่งล่าสุดจากอุปกรณ์จำลอง", kind: "updated" }, { day: "วันนี้", time: "10:21", title: "สถานะเปลี่ยนเป็นกำลังเคลื่อนที่", detail: "ความเร็วจำลองเริ่มส่งเข้าหน้าจอ", kind: "moving" }, { day: "เมื่อวาน", time: "17:16", title: t("stopped"), detail: "ความเร็วจำลองเป็น 0 km/h", kind: "stopped" }, { day: "เมื่อวาน", time: "15:48", title: t("connected"), detail: "รับสัญญาณจากอุปกรณ์จำลองอีกครั้ง", kind: "updated" }, { day: "27 ส.ค.", time: "09:08", title: t("offline"), detail: "ใช้เพื่อสาธิตสถานะรถ ไม่ใช่ข้อมูล GPS จริง", kind: "offline" },
  ] as const : [
    { day: "Today", time: "10:42", title: t("updated"), detail: "Received the latest position from the simulator.", kind: "updated" }, { day: "Today", time: "10:21", title: "Status changed to moving", detail: "Simulated speed is now available on the dashboard.", kind: "moving" }, { day: "Yesterday", time: "17:16", title: t("stopped"), detail: "Simulated speed reached 0 km/h.", kind: "stopped" }, { day: "Yesterday", time: "15:48", title: t("connected"), detail: "The simulated device is sending data again.", kind: "updated" }, { day: "Aug 27", time: "09:08", title: t("offline"), detail: "For demonstration only; no actual GPS data is used.", kind: "offline" },
  ] as const;

  return (
    <Box sx={{ height: "100dvh", display: "flex", bgcolor: "background.default" }}>
      <AppSidebar />
      <Box sx={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column" }}>
        <Box component="header" sx={{ minHeight: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, px: { xs: 2, sm: 3 }, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box><Typography component="h1" sx={{ fontSize: "1.08rem", fontWeight: 900, letterSpacing: "-0.035em", color: "text.primary" }}>{t("historyTitle")}</Typography><Typography sx={{ mt: 0.2, fontSize: "0.72rem", color: "text.secondary" }}>{t("historySubtitle")}</Typography></Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Chip icon={<HistoryRoundedIcon />} label={t("days7")} sx={{ bgcolor: "rgba(91,75,219,0.14)", color: "primary.main", fontWeight: 800 }} /><HeaderControls /></Box>
        </Box>

        <Box sx={{ minHeight: 0, flex: 1, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" }, overflow: "hidden" }}>
          <Box sx={{ overflowY: "auto", px: { xs: 2, sm: 3.5 }, py: 3 }}>
            <Box sx={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 2, mb: 2.5 }}>
              <Box><Typography sx={{ fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.04em", color: "text.primary" }}>{vehicle.label}</Typography><Typography sx={{ mt: 0.35, fontSize: "0.8rem", color: "text.secondary" }}>{vehicle.code} · {vehicle.speedKph} km/h · {t("heading")} {vehicle.headingDeg}° · {vehicle.lastUpdate}</Typography></Box>
              <Typography sx={{ fontSize: "0.76rem", color: "text.secondary", whiteSpace: "nowrap" }}>{vehicleHistory.length} {t("events")}</Typography>
            </Box>

            <Box sx={{ display: "grid", gap: 1.5 }}>
              {vehicleHistory.map((event, index) => {
                const previous = vehicleHistory[index - 1];
                const showDay = !previous || previous.day !== event.day;
                return (
                  <Box key={`${event.day}-${event.time}`}>
                    {showDay && <Typography sx={{ pt: index ? 1.5 : 0, pb: 0.8, fontSize: "0.72rem", fontWeight: 900, letterSpacing: "0.08em", color: "text.secondary", textTransform: "uppercase" }}>{event.day}</Typography>}
                    <Box sx={{ display: "flex", gap: 1.5, p: 1.6, border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: "background.paper" }}>
                      <Box sx={{ width: 34, height: 34, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 2, bgcolor: colors[event.kind], color: "#fff" }}><DirectionsCarRoundedIcon fontSize="small" /></Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontSize: "0.88rem", fontWeight: 800, color: "text.primary" }}>{event.title}</Typography><Typography sx={{ mt: 0.3, fontSize: "0.77rem", color: "text.secondary" }}>{event.detail}</Typography></Box>
                      <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", whiteSpace: "nowrap" }}>{event.time}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box component="aside" sx={{ overflowY: "auto", p: 2.5, borderTop: { xs: "1px solid", lg: 0 }, borderLeft: { lg: "1px solid" }, borderColor: "divider", bgcolor: "background.default" }}>
            <Typography sx={{ fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.08em", color: "text.secondary", textTransform: "uppercase" }}>{t("chooseVehicle")}</Typography>
            <Typography sx={{ mt: 0.45, fontSize: "0.7rem", color: "text.secondary" }}>{t("demoVehicles")}</Typography>
            <Box sx={{ display: "grid", gap: 1, mt: 1.5 }}>
              {vehicles.slice(0, 12).map((item) => <Box key={item.id} component="button" type="button" onClick={() => setSelectedVehicleId(item.id)} sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", p: 1.1, border: "1px solid", borderColor: item.id === vehicle.id ? "#9CCBFF" : "divider", borderRadius: 2.5, bgcolor: item.id === vehicle.id ? "rgba(22,119,255,0.12)" : "background.paper", textAlign: "left", cursor: "pointer" }}><Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: getVehicleMarkerColor(item) }} /><Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "text.primary" }}>{item.label}</Typography><Typography sx={{ ml: "auto", fontSize: "0.68rem", color: "text.secondary" }}>{item.code}</Typography></Box>)}
            </Box>
            <Box sx={{ mt: 3, p: 2, border: "1px solid rgba(22,119,255,0.16)", borderRadius: 3, bgcolor: "rgba(22,119,255,0.07)", color: "text.primary" }}><DirectionsCarRoundedIcon fontSize="small" color="primary" /><Typography sx={{ mt: 0.7, fontSize: "0.78rem", fontWeight: 900 }}>ข้อมูลรถจำลองเท่านั้น</Typography><Typography sx={{ mt: 0.6, fontSize: "0.72rem", lineHeight: 1.55, color: "text.secondary" }}>ไม่มี GPS จริง ข้อมูลคนขับ หรือข้อมูลรถขององค์กร</Typography></Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
