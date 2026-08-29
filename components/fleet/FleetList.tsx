"use client";

import CircleIcon from "@mui/icons-material/Circle";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, Button, Chip, InputAdornment, TextField, Typography } from "@mui/material";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { getVehicleMarkerColor } from "@/lib/fleet-appearance";
import { useUiPreferences } from "@/components/providers/MuiProvider";
import { useFleetStore } from "@/stores/use-fleet-store";
import type { FleetStatusFilter, VehicleStatus } from "@/types/fleet";

const PAGE_SIZE = 80;

export default function FleetList() {
  const vehicles = useFleetStore((state) => state.vehicles);
  const selectedVehicleId = useFleetStore((state) => state.selectedVehicleId);
  const setSelectedVehicleId = useFleetStore((state) => state.setSelectedVehicleId);
  const statusFilter = useFleetStore((state) => state.statusFilter);
  const setStatusFilter = useFleetStore((state) => state.setStatusFilter);
  const { locale, t } = useUiPreferences();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const deferredVehicles = useDeferredValue(vehicles);
  const statusCounts = useMemo(() => {
    const counts: Record<FleetStatusFilter, number> = { all: 0, moving: 0, stopped: 0, offline: 0 };
    for (const vehicle of deferredVehicles) { counts.all += 1; counts[vehicle.status] += 1; }
    return counts;
  }, [deferredVehicles]);
  const matchedVehicles = useMemo(() => {
    const byStatus = statusFilter === "all" ? deferredVehicles : deferredVehicles.filter((vehicle) => vehicle.status === statusFilter);
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery ? byStatus.filter((vehicle) => vehicle.code.toLowerCase().includes(normalizedQuery) || vehicle.label.toLowerCase().includes(normalizedQuery)) : byStatus;
  }, [deferredVehicles, query, statusFilter]);
  const visibleVehicles = useMemo(() => matchedVehicles.slice(0, visibleCount), [matchedVehicles, visibleCount]);
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query, statusFilter]);
  const statusCopy: Record<VehicleStatus, string> = { moving: t("moving"), stopped: locale === "th" ? "หยุด" : "Stopped", offline: locale === "th" ? "ออฟไลน์" : "Offline" };
  const filterOptions: { value: FleetStatusFilter; label: string }[] = [{ value: "all", label: t("all") }, { value: "moving", label: t("moving") }, { value: "stopped", label: locale === "th" ? "หยุด" : "Stopped" }, { value: "offline", label: locale === "th" ? "ออฟไลน์" : "Offline" }];

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minWidth: 0, p: { xs: 1.25, sm: 2.25 } }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}><Box><Typography sx={{ fontSize: "1.08rem", fontWeight: 900, letterSpacing: "-0.035em", color: "text.primary" }}>{t("overview")}</Typography><Typography sx={{ mt: 0.35, fontSize: "0.73rem", color: "text.secondary" }}>{t("simulatedData")}</Typography></Box><Box sx={{ display: "flex", alignItems: "center", gap: 0.55, mt: 0.25, px: 0.85, py: 0.45, borderRadius: 5, bgcolor: "rgba(22,163,74,0.10)" }}><Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#16A34A" }} /><Typography sx={{ color: "#168A67", fontSize: "0.62rem", fontWeight: 900 }}>LIVE</Typography></Box></Box>

      <Box sx={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", gap: 0.65, mt: { xs: 1.35, sm: 2.1 }, pb: 0.45, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
        {filterOptions.map((option) => <Button key={option.value} size="small" variant={statusFilter === option.value ? "contained" : "text"} onClick={() => setStatusFilter(option.value)} sx={{ flexShrink: 0, minWidth: 0, minHeight: 29, borderRadius: 1.5, px: 0.95, fontSize: "0.65rem", fontWeight: 800, color: statusFilter === option.value ? "#FFF" : "text.secondary", bgcolor: statusFilter === option.value ? "primary.main" : "rgba(22,119,255,0.05)", boxShadow: "none", "&:hover": { bgcolor: statusFilter === option.value ? "primary.dark" : "rgba(22,119,255,0.10)", boxShadow: "none" } }}>{option.label} <Box component="span" sx={{ ml: 0.45, opacity: 0.75 }}>{statusCounts[option.value]}</Box></Button>)}
      </Box>

      <TextField value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} size="small" fullWidth sx={{ mt: { xs: 1.25, sm: 2.25 }, "& .MuiOutlinedInput-root": { bgcolor: "background.default", borderRadius: 1.5, fontSize: "0.78rem", "& fieldset": { borderColor: "divider" } } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: { xs: 1.25, sm: 2.25 }, mb: 0.75 }}><Typography sx={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.08em", color: "text.secondary", textTransform: "uppercase" }}>{t("vehicleData")}</Typography><Typography sx={{ px: 0.75, py: 0.3, borderRadius: 1.5, bgcolor: "rgba(22,119,255,0.08)", fontSize: "0.64rem", fontWeight: 800, color: "primary.main" }}>{t("showing")} {visibleVehicles.length} / {matchedVehicles.length}</Typography></Box>

      <Box role="table" aria-label="ตารางข้อมูลรถจำลอง" sx={{ minHeight: 0, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 1, border: "1px solid", borderColor: "rgba(22,119,255,0.10)", bgcolor: "rgba(22,119,255,0.035)" }}>
        <Box role="row" sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr) minmax(80px, .72fr)", sm: "minmax(0, 1.3fr) minmax(86px, .86fr) 70px" }, alignItems: "center", gap: 0.75, flexShrink: 0, px: { xs: 1, sm: 1.25 }, py: 1.05, bgcolor: "rgba(22,119,255,0.07)" }}><Typography role="columnheader" sx={{ fontSize: "0.61rem", fontWeight: 900, letterSpacing: "0.075em", color: "text.secondary" }}>{t("vehicle").toUpperCase()}</Typography><Typography role="columnheader" sx={{ fontSize: "0.61rem", fontWeight: 900, letterSpacing: "0.075em", color: "text.secondary" }}>{t("status").toUpperCase()}</Typography><Typography role="columnheader" align="right" sx={{ display: { xs: "none", sm: "block" }, fontSize: "0.61rem", fontWeight: 900, letterSpacing: "0.075em", color: "text.secondary" }}>{t("speed").toUpperCase()}</Typography></Box>
        <Box role="rowgroup" onScroll={(event) => { const list = event.currentTarget; const remaining = list.scrollHeight - list.scrollTop - list.clientHeight; if (remaining < 160 && visibleVehicles.length < matchedVehicles.length) { setVisibleCount((count) => Math.min(count + PAGE_SIZE, matchedVehicles.length)); } }} sx={{ minHeight: 0, flex: 1, overflowY: "auto", overscrollBehavior: "contain", scrollbarWidth: "thin", scrollbarColor: "rgba(22,119,255,0.32) transparent", "&::-webkit-scrollbar": { width: 9 }, "&::-webkit-scrollbar-track": { bgcolor: "transparent" }, "&::-webkit-scrollbar-thumb": { border: "3px solid transparent", borderRadius: 9, bgcolor: "rgba(22,119,255,0.32)", backgroundClip: "content-box" }, "&::-webkit-scrollbar-thumb:hover": { bgcolor: "rgba(22,119,255,0.48)" } }}>
          {visibleVehicles.map((vehicle) => {
            const selected = vehicle.id === selectedVehicleId;
            return <Box key={vehicle.id} component="button" type="button" role="row" onClick={() => setSelectedVehicleId(vehicle.id)} sx={{ display: "grid", width: "100%", gridTemplateColumns: { xs: "minmax(0, 1fr) minmax(80px, .72fr)", sm: "minmax(0, 1.3fr) minmax(86px, .86fr) 70px" }, alignItems: "center", gap: 0.75, px: { xs: 1, sm: 1.25 }, py: { xs: 0.85, sm: 1.05 }, border: 0, borderBottom: "1px solid", borderColor: "rgba(22,119,255,0.08)", bgcolor: selected ? "rgba(22,119,255,0.12)" : "transparent", color: "inherit", textAlign: "left", cursor: "pointer", transition: "background 160ms ease, transform 160ms ease", "&:hover": { bgcolor: selected ? "rgba(22,119,255,0.15)" : "rgba(22,119,255,0.07)" }, "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: -2 } }}>
              <Box role="cell" sx={{ display: "flex", alignItems: "center", gap: 0.85, minWidth: 0 }}><Box sx={{ display: "grid", flexShrink: 0, placeItems: "center", width: 27, height: 27, borderRadius: 1.75, bgcolor: selected ? "primary.main" : "rgba(22,119,255,0.09)", color: selected ? "#FFF" : "primary.main" }}><DirectionsCarRoundedIcon sx={{ fontSize: 15 }} /></Box><Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ fontSize: "0.72rem", fontWeight: 900, color: "text.primary" }}>{vehicle.code}</Typography><Typography noWrap sx={{ mt: 0.1, fontSize: "0.63rem", color: "text.secondary" }}>{vehicle.label}</Typography></Box></Box>
              <Box role="cell" sx={{ minWidth: 0 }}><Chip icon={<CircleIcon sx={{ fontSize: "0.42rem !important", color: `${getVehicleMarkerColor(vehicle)} !important` }} />} label={statusCopy[vehicle.status]} size="small" sx={{ height: 22, maxWidth: "100%", fontSize: "0.59rem", bgcolor: "rgba(22,119,255,0.055)", color: "text.secondary", "& .MuiChip-label": { px: 0.65, overflow: "hidden", textOverflow: "ellipsis" } }} /></Box>
              <Typography role="cell" align="right" sx={{ display: { xs: "none", sm: "block" }, fontSize: "0.7rem", fontWeight: 900, color: "text.primary", whiteSpace: "nowrap" }}>{vehicle.speedKph}<Box component="span" sx={{ ml: 0.25, fontSize: "0.58rem", fontWeight: 700, color: "text.secondary" }}>km/h</Box></Typography>
            </Box>;
          })}
          {visibleVehicles.length < matchedVehicles.length && <Box role="status" sx={{ px: 1.25, py: 1.1, textAlign: "center", color: "text.secondary", fontSize: "0.66rem", fontWeight: 700 }}>เลื่อนเพื่อโหลดรถเพิ่ม</Box>}
        </Box>
      </Box>
    </Box>
  );
}
