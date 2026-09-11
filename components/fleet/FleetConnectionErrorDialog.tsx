"use client";

import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { Box, CircularProgress, Dialog, Typography } from "@mui/material";
import { usePathname } from "next/navigation";

import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetApiUrl } from "@/services/fleet/client";
import { useFleetStore } from "@/stores/use-fleet-store";

/**
 * Blocks the dashboard whenever the fleet API is unreachable. It has no close
 * control on purpose: the numbers behind it would be missing or stale, so
 * dismissing it would put the user back in front of data they cannot trust.
 * It clears itself as soon as the connection is restored.
 *
 * Escape and backdrop clicks only ever call `onClose`, so leaving that prop off
 * is what keeps the dialog open (MUI v9 removed `disableEscapeKeyDown`).
 */
export default function FleetConnectionErrorDialog() {
  const pathname = usePathname();
  const { t } = useUiPreferences();
  const connectionStatus = useFleetStore((state) => state.connectionStatus);
  const connectionError = useFleetStore((state) => state.connectionError);

  return (
    <Dialog
      open={connectionStatus === "error" && pathname !== "/history/designs"}
      role="alertdialog"
      maxWidth="xs"
      fullWidth
      aria-labelledby="fleet-connection-error-title"
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0.5 } } }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", px: 3, py: 3.5 }}>
        <Box sx={{ display: "grid", placeItems: "center", width: 56, height: 56, borderRadius: "50%", bgcolor: "rgba(220,38,38,0.10)", color: "#DC2626" }}>
          <ErrorOutlineRoundedIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography id="fleet-connection-error-title" component="h2" sx={{ mt: 2, fontSize: "1.05rem", fontWeight: 900, letterSpacing: "-0.02em", color: "text.primary" }}>
          {t("connectionErrorTitle")}
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: "0.8rem", lineHeight: 1.6, color: "text.secondary" }}>
          {t("connectionErrorBody")}
        </Typography>

        {connectionError && (
          <Box sx={{ width: "100%", mt: 2.25, p: 1.5, border: "1px solid", borderColor: "rgba(220,38,38,0.22)", borderRadius: 2, bgcolor: "rgba(220,38,38,0.05)" }}>
            <Typography component="p" sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.74rem", fontWeight: 700, color: "#B91C1C", wordBreak: "break-all" }}>
              {connectionError.endpoint}
            </Typography>
            <Typography component="p" sx={{ mt: 0.4, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.7rem", color: "text.secondary", wordBreak: "break-all" }}>
              {connectionError.detail}
            </Typography>
          </Box>
        )}

        <Typography sx={{ mt: 1.75, fontSize: "0.72rem", color: "text.secondary" }}>
          {t("connectionErrorHint")}{" "}
          <Box component="span" sx={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 700, color: "text.primary", wordBreak: "break-all" }}>{fleetApiUrl}</Box>
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2.25 }}>
          <CircularProgress size={13} thickness={5} sx={{ color: "text.secondary" }} />
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary" }}>{t("retrying")}</Typography>
        </Box>
      </Box>
    </Dialog>
  );
}
