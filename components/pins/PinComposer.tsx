"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { pinCategories } from "@/data/pin-categories";
import { useLocationStore } from "@/stores/use-location-store";
import type { PinCategoryId } from "@/types/location";

const INITIAL_FORM = {
  name: "",
  category: "idea" as PinCategoryId,
  note: "",
};

export default function PinComposer() {
  const isAdding = useLocationStore((state) => state.isAdding);
  const draftPosition = useLocationStore((state) => state.draftPosition);
  const addLocation = useLocationStore((state) => state.addLocation);
  const cancelAdding = useLocationStore((state) => state.cancelAdding);
  const [form, setForm] = useState(INITIAL_FORM);

  const canSave = Boolean(form.name.trim() && draftPosition);
  const handleCancel = () => {
    setForm(INITIAL_FORM);
    cancelAdding();
  };

  const handleSave = () => {
    if (!canSave) return;
    addLocation(form);
    setForm(INITIAL_FORM);
  };

  return isAdding ? (
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          zIndex: 1300,
          right: { xs: 12, sm: 24 },
          bottom: { xs: 12, sm: 24 },
          width: { xs: "calc(100vw - 24px)", sm: 380 },
          border: "1px solid #DDD7FF",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 22px 55px rgba(35,30,72,0.24)",
        }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 2.25, bgcolor: "#F0EEFF" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: "1.15rem", color: "#302A56" }}>เพิ่มหมุดใหม่</Typography>
              <Typography sx={{ mt: 0.4, fontSize: "0.8rem", color: "#696184" }}>
                เริ่มจากเลือกตำแหน่งบนแผนที่
              </Typography>
            </Box>
            <IconButton aria-label="ปิด" onClick={handleCancel} sx={{ alignSelf: "flex-start" }}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, p: 1.25, borderRadius: 2.5, bgcolor: "#FFFFFF" }}>
            <PlaceOutlinedIcon sx={{ color: draftPosition ? "#5B4BDB" : "#A09AAA" }} />
            <Typography sx={{ fontSize: "0.78rem", color: "#5D5870" }}>
              {draftPosition
                ? `${draftPosition.lat.toFixed(5)}, ${draftPosition.lng.toFixed(5)}`
                : "คลิกตำแหน่งที่ต้องการบนแผนที่"}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={(event) => { event.preventDefault(); handleSave(); }} sx={{ p: 3, display: "grid", gap: 2 }}>
          <TextField
            autoFocus
            required
            label="ชื่อหมุด"
            placeholder="เช่น จุดชมวิวทริปหน้า"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <TextField
            select
            label="หมวดหมู่"
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as PinCategoryId }))}
          >
            {pinCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>{category.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="โน้ตสั้น ๆ"
            placeholder="ทำไมอยากบันทึกที่นี่"
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            multiline
            minRows={2}
          />
          <Button
            type="submit"
            disabled={!canSave}
            variant="contained"
            size="large"
            sx={{ borderRadius: 2.5, boxShadow: "none", fontWeight: 800, bgcolor: "#5B4BDB", "&:hover": { boxShadow: "none", bgcolor: "#4938C5" } }}
          >
            บันทึกหมุด
          </Button>
        </Box>
      </Paper>
  ) : null;
}
