"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Locale = "th" | "en";
type ThemeMode = "light" | "dark";

const copy = {
  th: {
    monitor: "ติดตามรถ", history: "ประวัติรถ", theme: "ธีม", language: "ภาษา", light: "สว่าง", dark: "มืด", appTitle: "Fleet Monitor", portfolio: "ข้อมูลรถจำลอง 1,000 คัน · Front-end demo", original: "แนวคิดต้นฉบับ · ใช้ข้อมูลจำลองเท่านั้น",
    overview: "ภาพรวมรถ", all: "ทั้งหมด", moving: "กำลังเคลื่อนที่", simulatedData: "ข้อมูลจำลอง", markers: "หมุด", search: "ค้นหารหัสหรือชื่อรถ", vehicleData: "ข้อมูลรถ", showing: "แสดง", vehicle: "รถ", status: "สถานะ", speed: "ความเร็ว", head: "หัวรถ",
    vehicleDetails: "รายละเอียดรถ", live: "ข้อมูลล่าสุด", driver: "คนขับ", phone: "เบอร์โทร", plate: "ทะเบียน", vehicleType: "ยี่ห้อ / รุ่น", origin: "จุดเริ่มต้น", destination: "จุดสิ้นสุด", tripInfo: "ข้อมูลเที่ยวจำลอง", close: "ปิด",
    historyTitle: "ประวัติรถ", historySubtitle: "กิจกรรมรถจำลอง · Front-end demo", days7: "7 วันที่ผ่านมา", chooseVehicle: "เลือกรถ", demoVehicles: "เลือกจาก 12 คันแรกของข้อมูลจำลอง", events: "รายการ", updated: "อัปเดตตำแหน่ง", connected: "กลับมาเชื่อมต่อ", stopped: "หยุดนิ่ง", offline: "ขาดการเชื่อมต่อ", heading: "หัวรถ", accOn: "ACC เปิด", accOff: "ACC ปิด",
  },
  en: {
    monitor: "Fleet monitor", history: "Vehicle history", theme: "Theme", language: "Language", light: "Light", dark: "Dark", appTitle: "Fleet Monitor", portfolio: "1,000 simulated vehicles · Front-end demo", original: "Original concept · simulated data only",
    overview: "Fleet overview", all: "All", moving: "Moving", simulatedData: "Simulated data", markers: "Markers", search: "Search vehicle code or name", vehicleData: "Vehicle data", showing: "Showing", vehicle: "Vehicle", status: "Status", speed: "Speed", head: "Heading",
    vehicleDetails: "Vehicle details", live: "Latest data", driver: "Driver", phone: "Phone", plate: "Plate", vehicleType: "Make / model", origin: "Origin", destination: "Destination", tripInfo: "Simulated trip details", close: "Close",
    historyTitle: "Vehicle history", historySubtitle: "Simulated vehicle activity · Front-end demo", days7: "Past 7 days", chooseVehicle: "Choose vehicle", demoVehicles: "Choose from the first 12 demo vehicles", events: "events", updated: "Position updated", connected: "Connection restored", stopped: "Stopped", offline: "Connection lost", heading: "Heading", accOn: "ACC on", accOff: "ACC off",
  },
} as const;

type CopyKey = keyof typeof copy.th;
type UiPreferences = { locale: Locale; mode: ThemeMode; setLocale: (locale: Locale) => void; toggleMode: () => void; t: (key: CopyKey) => string };
const UiPreferencesContext = createContext<UiPreferences | null>(null);

export function useUiPreferences() {
  const value = useContext(UiPreferencesContext);
  if (!value) throw new Error("useUiPreferences must be used inside MuiProvider");
  return value;
}

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("th");
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedLocale = window.localStorage.getItem("fleet-locale");
      const storedMode = window.localStorage.getItem("fleet-theme");
      if (storedLocale === "th" || storedLocale === "en") setLocale(storedLocale);
      if (storedMode === "light" || storedMode === "dark") setMode(storedMode);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    window.localStorage.setItem("fleet-theme", mode);
  }, [mode]);

  useEffect(() => { window.localStorage.setItem("fleet-locale", locale); }, [locale]);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === "dark" ? "#72B2FF" : "#1677FF" },
      background: { default: mode === "dark" ? "#101B2D" : "#F4FAFF", paper: mode === "dark" ? "#172842" : "#FFFFFF" },
      text: { primary: mode === "dark" ? "#EDF6FF" : "#102A43", secondary: mode === "dark" ? "#B8C9DE" : "#5E7590" },
      divider: mode === "dark" ? "#294565" : "#D9E8F5",
    },
    typography: { fontFamily: '"IBM Plex Sans Thai", Arial, Helvetica, system-ui, sans-serif', allVariants: { letterSpacing: "-0.01em" } },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 800 } } },
    },
  }), [mode]);

  const preferences = useMemo<UiPreferences>(() => ({ locale, mode, setLocale, toggleMode: () => setMode((current) => current === "light" ? "dark" : "light"), t: (key) => copy[locale][key] }), [locale, mode]);

  return <AppRouterCacheProvider><UiPreferencesContext.Provider value={preferences}><ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider></UiPreferencesContext.Provider></AppRouterCacheProvider>;
}
