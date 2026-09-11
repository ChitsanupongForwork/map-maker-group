"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { fleetTokens, type ThemeMode } from "@/lib/design-tokens";

type Locale = "th" | "en";

const copy = {
  th: {
    monitor: "ติดตามรถ", history: "ประวัติรถ", theme: "ธีม", language: "ภาษา", light: "สว่าง", dark: "มืด", appTitle: "Fleet Monitor", portfolio: "ข้อมูลรถจำลอง 1,000 คัน · Front-end demo", original: "แนวคิดต้นฉบับ · ใช้ข้อมูลจำลองเท่านั้น",
    overview: "ภาพรวมรถ", all: "ทั้งหมด", moving: "กำลังเคลื่อนที่", simulatedData: "ข้อมูลจำลอง", markers: "หมุด", search: "ค้นหารหัสหรือชื่อรถ", vehicleData: "ข้อมูลรถ", showing: "แสดง", vehicle: "รถ", status: "สถานะ", speed: "ความเร็ว", head: "หัวรถ",
    vehicleDetails: "รายละเอียดรถ", live: "ข้อมูลล่าสุด", driver: "คนขับ", phone: "เบอร์โทร", plate: "ทะเบียน", vehicleType: "ยี่ห้อ / รุ่น", origin: "จุดเริ่มต้น", destination: "จุดสิ้นสุด", tripInfo: "ข้อมูลเที่ยวจำลอง", close: "ปิด",
    historyTitle: "ประวัติรถ", historySubtitle: "กิจกรรมรถจำลอง · Front-end demo", days7: "7 วันที่ผ่านมา", chooseVehicle: "เลือกรถ", demoVehicles: "เลือกจาก 12 คันแรกของข้อมูลจำลอง", events: "รายการ", updated: "อัปเดตตำแหน่ง", connected: "กลับมาเชื่อมต่อ", stopped: "หยุดนิ่ง", offline: "ขาดการเชื่อมต่อ", heading: "หัวรถ", accOn: "ACC เปิด", accOff: "ACC ปิด",
    statusLive: "รับข้อมูลสด", statusConnecting: "กำลังเชื่อมต่อ", statusOffline: "ไม่ได้เชื่อมต่อ", statusDemo: "ข้อมูลจำลอง",
    connectionErrorTitle: "เชื่อมต่อกับเซิร์ฟเวอร์ไม่ได้", connectionErrorBody: "ระบบดึงข้อมูลรถจาก API ไม่สำเร็จ จึงยังไม่มีข้อมูลให้แสดง", connectionErrorHint: "ตรวจสอบว่า service ทำงานอยู่ที่", retrying: "กำลังลองเชื่อมต่อใหม่อัตโนมัติ ไม่ต้องรีเฟรชหน้า",
    loadingVehicles: "กำลังโหลดข้อมูลรถ…", noVehicles: "ยังไม่มีข้อมูลรถ",
    playback: "เล่นย้อนหลัง", play: "เล่น", pause: "หยุด", stepBack: "ถอยหนึ่งจุด", stepForward: "ไปข้างหน้าหนึ่งจุด", timeline: "แถบเวลา", playbackSpeed: "ความเร็ว",
    followVehicle: "ตามรถ", followHint: "ล็อกแผนที่ไว้ที่รถระหว่างเล่น · กด F", backToVehicle: "กลับไปที่รถ",
    pointAt: "จุดที่", hideTable: "ปิดตาราง", showTable: "เปิดตาราง", trackpoints: "รายการจุดต่อจุด", followPlayhead: "เลื่อนตามการเล่นอีกครั้ง",
    routeSpeedLegend: "ความเร็วของเส้นทาง",
    dateFrom: "ตั้งแต่วันที่", dateTo: "ถึงวันที่", searchPlate: "ค้นหาทะเบียน รหัส หรือคนขับ", loadingHistory: "กำลังโหลดเส้นทางย้อนหลัง…", noHistory: "ไม่มีข้อมูลย้อนหลังในช่วงที่เลือก", historyError: "โหลดข้อมูลย้อนหลังไม่สำเร็จ",
  },
  en: {
    monitor: "Fleet monitor", history: "Vehicle history", theme: "Theme", language: "Language", light: "Light", dark: "Dark", appTitle: "Fleet Monitor", portfolio: "1,000 simulated vehicles · Front-end demo", original: "Original concept · simulated data only",
    overview: "Fleet overview", all: "All", moving: "Moving", simulatedData: "Simulated data", markers: "Markers", search: "Search vehicle code or name", vehicleData: "Vehicle data", showing: "Showing", vehicle: "Vehicle", status: "Status", speed: "Speed", head: "Heading",
    vehicleDetails: "Vehicle details", live: "Latest data", driver: "Driver", phone: "Phone", plate: "Plate", vehicleType: "Make / model", origin: "Origin", destination: "Destination", tripInfo: "Simulated trip details", close: "Close",
    historyTitle: "Vehicle history", historySubtitle: "Simulated vehicle activity · Front-end demo", days7: "Past 7 days", chooseVehicle: "Choose vehicle", demoVehicles: "Choose from the first 12 demo vehicles", events: "events", updated: "Position updated", connected: "Connection restored", stopped: "Stopped", offline: "Connection lost", heading: "Heading", accOn: "ACC on", accOff: "ACC off",
    statusLive: "Live", statusConnecting: "Connecting", statusOffline: "Disconnected", statusDemo: "Demo data",
    connectionErrorTitle: "Cannot reach the server", connectionErrorBody: "The dashboard could not load vehicle data from the API, so there is nothing to show yet.", connectionErrorHint: "Check that the service is running at", retrying: "Retrying automatically — no need to refresh the page",
    loadingVehicles: "Loading vehicles…", noVehicles: "No vehicles yet",
    playback: "Playback", play: "Play", pause: "Pause", stepBack: "Previous point", stepForward: "Next point", timeline: "Timeline", playbackSpeed: "SPEED",
    followVehicle: "Follow", followHint: "Keep the map centred on the vehicle while it plays · press F", backToVehicle: "Back to vehicle",
    pointAt: "Point", hideTable: "Hide table", showTable: "Show table", trackpoints: "Trackpoints", followPlayhead: "Follow the playhead again",
    routeSpeedLegend: "Route speed",
    dateFrom: "From date", dateTo: "To date", searchPlate: "Search plate, code or driver", loadingHistory: "Loading the recorded route…", noHistory: "No recorded route in this range", historyError: "Could not load the recorded route",
  },
} as const;

export type CopyKey = keyof typeof copy.th;
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

  const theme = useMemo(() => {
    const tokens = fleetTokens[mode];
    return createTheme({
      palette: {
        mode,
        // The accent means "selected" and nothing else, so MUI's primary is the
        // accent rather than the old blue that also stood for "moving".
        primary: { main: tokens.accent, contrastText: tokens.accentContrast },
        background: { default: tokens.mapGround, paper: tokens.panelSolid },
        text: { primary: tokens.text1, secondary: tokens.text2, disabled: tokens.text3 },
        divider: tokens.line,
      },
      typography: {
        fontFamily: "var(--font-body), Arial, Helvetica, system-ui, sans-serif",
        // Three weights only. Emphasis comes from size and color; when every
        // label is 900 nothing reads as important.
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
        allVariants: { letterSpacing: "-0.01em" },
      },
      shape: { borderRadius: 10 },
      components: {
        MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
        MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
        MuiTooltip: { defaultProps: { arrow: true } },
      },
    });
  }, [mode]);

  const preferences = useMemo<UiPreferences>(() => ({ locale, mode, setLocale, toggleMode: () => setMode((current) => current === "light" ? "dark" : "light"), t: (key) => copy[locale][key] }), [locale, mode]);

  return <AppRouterCacheProvider><UiPreferencesContext.Provider value={preferences}><ThemeProvider theme={theme}><CssBaseline />{children}</ThemeProvider></UiPreferencesContext.Provider></AppRouterCacheProvider>;
}
