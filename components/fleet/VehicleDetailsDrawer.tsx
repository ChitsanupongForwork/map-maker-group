"use client";

import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { useUiPreferences } from "@/components/providers/MuiProvider";
import { getVehicleMarkerColor } from "@/lib/fleet-appearance";
import { useFleetStore } from "@/stores/use-fleet-store";

function DetailRow({ label, value }: { label: string; value: string }) {
  return <Box sx={{ display: "grid", gap: 0.35, minWidth: 0, p: 1.2, borderRadius: 2.25, bgcolor: "rgba(22,119,255,0.045)" }}><Typography sx={{ fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.075em", color: "text.secondary", textTransform: "uppercase" }}>{label}</Typography><Typography noWrap sx={{ fontSize: "0.78rem", fontWeight: 800, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</Typography></Box>;
}

/** A persistent map-side detail panel: it is never a modal and never dismisses map interaction. */
export default function VehicleDetailsDrawer() {
  const { locale, t } = useUiPreferences();
  const vehicles = useFleetStore((state) => state.vehicles);
  const selectedVehicleId = useFleetStore((state) => state.selectedVehicleId);
  const detailsOpen = useFleetStore((state) => state.detailsOpen);
  const setDetailsOpen = useFleetStore((state) => state.setDetailsOpen);
  const vehicle = vehicles.find((item) => item.id === selectedVehicleId);
  if (!vehicle) return null;

  return (
    <>
      <IconButton aria-label={t("vehicleDetails")} onClick={() => setDetailsOpen(true)} sx={{ position: "absolute", zIndex: 1000, top: 16, right: 16, width: 40, height: 40, border: "1px solid", borderColor: "rgba(22,119,255,0.16)", borderRadius: 2.5, bgcolor: "background.paper", color: "primary.main", opacity: detailsOpen ? 0 : 1, transform: detailsOpen ? "translateX(8px) scale(0.92)" : "translateX(0) scale(1)", pointerEvents: detailsOpen ? "none" : "auto", transition: detailsOpen ? "opacity 120ms ease, transform 120ms ease" : "opacity 180ms ease 210ms, transform 180ms ease 210ms", boxShadow: "0 8px 18px rgba(15,46,77,0.12)", "&:hover": { bgcolor: "rgba(22,119,255,0.08)" } }}><ChevronLeftRoundedIcon /></IconButton>
      <Box component="aside" aria-label={t("vehicleDetails")} sx={{ position: "absolute", zIndex: 1001, top: 0, right: 0, bottom: 0, width: { xs: "100%", sm: 360 }, bgcolor: "background.paper", boxShadow: "-14px 0 34px rgba(17,74,128,0.10)", transform: detailsOpen ? "translateX(0)" : "translateX(100%)", opacity: detailsOpen ? 1 : 0.98, pointerEvents: detailsOpen ? "auto" : "none", transition: "transform 390ms cubic-bezier(.22,1,.36,1), opacity 220ms ease" }}>
      <Box sx={{ display: "flex", height: "100%", flexDirection: "column", overflowY: "auto", p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}><Box><Typography sx={{ fontSize: "1.1rem", fontWeight: 900, letterSpacing: "-0.035em" }}>{t("vehicleDetails")}</Typography><Box sx={{ display: "flex", alignItems: "center", gap: 0.55, mt: 0.5 }}><Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#16A34A" }} /><Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#168A67" }}>{t("live")}</Typography></Box></Box><IconButton aria-label={t("close")} onClick={() => setDetailsOpen(false)} size="small" sx={{ width: 34, height: 34, border: "1px solid", borderColor: "rgba(22,119,255,0.16)", borderRadius: 2, color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: "rgba(22,119,255,0.08)" } }}><ChevronRightRoundedIcon fontSize="small" /></IconButton></Box>
        <Box sx={{ display: "flex", gap: 1.4, mt: 2.5, p: 1.6, borderRadius: 3, background: "linear-gradient(135deg, rgba(22,119,255,0.14), rgba(101,196,255,0.07))" }}>
          <Box sx={{ width: 44, height: 44, display: "grid", flexShrink: 0, placeItems: "center", borderRadius: 2.5, bgcolor: getVehicleMarkerColor(vehicle), color: "#fff", boxShadow: "0 8px 16px rgba(15,46,77,0.14)" }}><DirectionsCarRoundedIcon /></Box>
          <Box sx={{ minWidth: 0, flex: 1 }}><Typography noWrap sx={{ fontSize: "1rem", fontWeight: 900 }}>{vehicle.code}</Typography><Typography noWrap sx={{ mt: 0.2, fontSize: "0.74rem", color: "text.secondary" }}>{vehicle.make} {vehicle.model}</Typography><Typography sx={{ mt: 0.75, fontSize: "0.66rem", fontWeight: 800, color: "primary.main" }}>{vehicle.licensePlate}</Typography></Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.8, mt: 1.25 }}><Box sx={{ p: 1, borderRadius: 2.25, bgcolor: "rgba(22,119,255,0.055)" }}><Typography sx={{ fontSize: "0.59rem", color: "text.secondary", fontWeight: 800 }}>{t("speed")}</Typography><Typography sx={{ mt: 0.35, fontSize: "0.82rem", fontWeight: 900 }}>{vehicle.speedKph}<Box component="span" sx={{ ml: 0.25, fontSize: "0.58rem", color: "text.secondary" }}>km/h</Box></Typography></Box><Box sx={{ p: 1, borderRadius: 2.25, bgcolor: "rgba(22,119,255,0.055)" }}><Typography sx={{ fontSize: "0.59rem", color: "text.secondary", fontWeight: 800 }}>ACC</Typography><Typography noWrap sx={{ mt: 0.35, fontSize: "0.75rem", fontWeight: 900, color: vehicle.accOn ? "#168A67" : "text.primary" }}>{vehicle.accOn ? t("accOn") : t("accOff")}</Typography></Box><Box sx={{ p: 1, borderRadius: 2.25, bgcolor: "rgba(22,119,255,0.055)" }}><Typography sx={{ fontSize: "0.59rem", color: "text.secondary", fontWeight: 800 }}>{t("heading")}</Typography><Typography sx={{ mt: 0.35, fontSize: "0.82rem", fontWeight: 900 }}>{vehicle.headingDeg}°</Typography></Box></Box>
        <Box sx={{ mt: 2.25, p: 1.5, borderRadius: 3, bgcolor: "background.default" }}><Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.25 }}><PersonRoundedIcon fontSize="small" color="primary" /><Typography sx={{ fontSize: "0.76rem", fontWeight: 900 }}>{t("driver")}</Typography></Box><Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}><Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", fontSize: "0.78rem", fontWeight: 900 }}>{vehicle.driverInitials}</Avatar><Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ fontSize: "0.84rem", fontWeight: 900 }}>{vehicle.driverName}</Typography><Box sx={{ display: "flex", alignItems: "center", gap: 0.45, mt: 0.2, color: "text.secondary" }}><PhoneRoundedIcon sx={{ fontSize: 13 }} /><Typography sx={{ fontSize: "0.7rem" }}>{vehicle.driverPhone}</Typography></Box></Box></Box></Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.9, mt: 2.25 }}><DetailRow label={t("plate")} value={vehicle.licensePlate} /><DetailRow label={t("vehicleType")} value={`${vehicle.make} ${vehicle.model}`} /></Box>
        <Box sx={{ mt: 2.25 }}><Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1 }}><PlaceRoundedIcon fontSize="small" color="primary" /><Typography sx={{ fontSize: "0.76rem", fontWeight: 900 }}>{t("tripInfo")}</Typography></Box><Box sx={{ display: "grid", gap: 0.8 }}><DetailRow label={t("origin")} value={vehicle.origin} /><DetailRow label={t("destination")} value={vehicle.destination} /></Box></Box>
        <Typography sx={{ mt: "auto", pt: 3, fontSize: "0.7rem", lineHeight: 1.5, color: "text.secondary" }}>{locale === "th" ? "ชื่อคนขับ เบอร์โทร และข้อมูลรถเป็นข้อมูลสมมติสำหรับ portfolio" : "Driver, phone, and vehicle information are fictional portfolio data."}</Typography>
      </Box>
    </Box>
    </>
  );
}
