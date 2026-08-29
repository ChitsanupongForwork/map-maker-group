"use client";

import { Box } from "@mui/material";

type SplitLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export default function SplitLayout({ left, right }: SplitLayoutProps) {
  return (
    <Box
      sx={{
        display: "grid",
        width: "100%",
        height: "100%",
        gridTemplateColumns: { xs: "1fr", lg: "376px minmax(0, 1fr)" },
        gridTemplateRows: { xs: "minmax(235px, 43%) minmax(0, 57%)", sm: "minmax(280px, 46%) minmax(0, 54%)", lg: "1fr" },
        gap: { xs: 0.9, sm: 2 },
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: { xs: 1.5, sm: 2.25 },
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {left}
      </Box>
      <Box
        sx={{
          minWidth: 0,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: { xs: 1.5, sm: 2.25 },
          overflow: "hidden",
        }}
      >
        {right}
      </Box>
    </Box>
  );
}
