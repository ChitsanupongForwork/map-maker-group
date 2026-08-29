"use client";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import { getPinCategory, pinCategories } from "@/data/pin-categories";
import { useLocationStore } from "@/stores/use-location-store";
import type { PinCategoryId } from "@/types/location";

export default function PinLibrary() {
  const locations = useLocationStore((state) => state.locations);
  const selectedId = useLocationStore((state) => state.selectedId);
  const setSelectedId = useLocationStore((state) => state.setSelectedId);
  const startAdding = useLocationStore((state) => state.startAdding);
  const removeLocation = useLocationStore((state) => state.removeLocation);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PinCategoryId | "all">("all");

  const matchingPins = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("th");
    return locations.filter((location) => {
      const matchesCategory = category === "all" || location.category === category;
      const matchesQuery =
        !normalizedQuery ||
        location.name.toLocaleLowerCase("th").includes(normalizedQuery) ||
        location.note.toLocaleLowerCase("th").includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, locations, query]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        bgcolor: "#FFFCF7",
      }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#22203A" }}>
              Your pin library
            </Typography>
            <Typography sx={{ mt: 0.35, fontSize: "0.8rem", color: "#77738A" }}>
              {locations.length.toLocaleString()} หมุดตัวอย่างและไอเดียของคุณ
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={startAdding}
            sx={{
              alignSelf: "flex-start",
              borderRadius: 2.5,
              boxShadow: "none",
              bgcolor: "#5B4BDB",
              fontWeight: 700,
              whiteSpace: "nowrap",
              "&:hover": { boxShadow: "none", bgcolor: "#4938C5" },
            }}
          >
            เพิ่มหมุด
          </Button>
        </Box>

        <TextField
          fullWidth
          placeholder="ค้นหาชื่อหรือโน้ต"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          size="small"
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              bgcolor: "#FFFFFF",
              "& fieldset": { borderColor: "#E9E4DA" },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 19, color: "#9691A5" }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ display: "flex", gap: 0.75, mt: 1.5, overflowX: "auto", pb: 0.25 }}>
          <Chip
            label="ทั้งหมด"
            onClick={() => setCategory("all")}
            color={category === "all" ? "primary" : "default"}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              bgcolor: category === "all" ? "#22203A" : "#F1EDE6",
              color: category === "all" ? "#FFFFFF" : "#686477",
            }}
          />
          {pinCategories.map((item) => (
            <Chip
              key={item.id}
              label={item.shortLabel}
              onClick={() => setCategory(item.id)}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                bgcolor: category === item.id ? item.color : "#F1EDE6",
                color: category === item.id ? "#FFFFFF" : "#686477",
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, sm: 3 }, pb: 2.5 }}>
        <Typography sx={{ pb: 1.25, fontSize: "0.72rem", fontWeight: 800, color: "#918C9C", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {matchingPins.length.toLocaleString()} results
        </Typography>
        <Box sx={{ display: "grid", gap: 1 }}>
          {matchingPins.map((location) => {
            const categoryMeta = getPinCategory(location.category);
            const isSelected = selectedId === location.id;

            return (
              <Box
                key={location.id}
                component="button"
                type="button"
                onClick={() => setSelectedId(location.id)}
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  p: 1.25,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: isSelected ? "#BDB4FF" : "#EDE8DF",
                  bgcolor: isSelected ? "#F0EEFF" : "#FFFFFF",
                  boxShadow: isSelected ? "0 7px 18px rgba(91,75,219,0.12)" : "none",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "transform 150ms ease, border-color 150ms ease",
                  "&:hover": { transform: "translateY(-1px)", borderColor: "#CFC8F9" },
                }}
              >
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "12px 12px 12px 3px",
                    bgcolor: categoryMeta.color,
                    transform: "rotate(-45deg)",
                  }}
                >
                  <PlaceOutlinedIcon sx={{ fontSize: 18, color: "#fff", transform: "rotate(45deg)" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: "0.86rem", fontWeight: 800, color: "#302D45" }}>
                    {location.name}
                  </Typography>
                  <Typography noWrap sx={{ mt: 0.15, fontSize: "0.74rem", color: "#7B7789" }}>
                    {categoryMeta.label} · {location.note || "ยังไม่มีโน้ต"}
                  </Typography>
                </Box>
                {!location.id.startsWith("sample-") && (
                  <IconButton
                    aria-label={`ลบ ${location.name}`}
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeLocation(location.id);
                    }}
                    sx={{ color: "#9B96A8", "&:hover": { color: "#D9485F", bgcolor: "#FFF0F2" } }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
