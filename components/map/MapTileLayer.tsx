"use client";

import { TileLayer } from "react-leaflet";

export default function MapTileLayer() {
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
      // Hold four rings of tiles around the viewport instead of the default
      // two, so panning and the fly-to on selection land on already-loaded
      // ground rather than on empty container background.
      keepBuffer={4}
      // Keep painting during the animation: the default waits for the map to
      // settle, which is exactly when the blank frames show.
      updateWhenIdle={false}
      updateWhenZooming
      // A tile that fails once should not leave a permanent hole.
      errorTileUrl="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    />
  );
}
