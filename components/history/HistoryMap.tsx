"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";
import { MapContainer, useMap } from "react-leaflet";

import HistoryRoute from "@/components/history/HistoryRoute";
import MapTileLayer from "@/components/map/MapTileLayer";
import { useUiPreferences } from "@/components/providers/MuiProvider";
import { fleetTokens } from "@/lib/design-tokens";
import { getPlayheadPosition, useHistoryStore } from "@/stores/use-history-store";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5318];

function playheadIcon(color: string, headingDeg: number, moving: boolean) {
  if (!moving) {
    return L.divIcon({ className: "fv-marker fv-marker--selected", iconSize: [44, 44], iconAnchor: [22, 22], html: `<span class="fv-marker__halo"></span><span class="fv-marker__dot" style="--fv-color:${color};width:11px;height:11px"></span>` });
  }
  return L.divIcon({
    className: "fv-marker fv-marker--selected",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<span class="fv-marker__halo"></span><svg class="fv-marker__arrow" style="--fv-color:${color};--fv-heading:${headingDeg}deg;width:20px;height:20px" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0 11 11 6 8.6 1 11Z"/></svg>`,
  });
}

/**
 * The marker for the point being played, plus the camera that follows it.
 * The marker is drawn on the accent colour in every state: on this page colour
 * means speed, and the one thing that is not about speed is "where you are".
 */
function HistoryPlayhead() {
  const map = useMap();
  const { mode } = useUiPreferences();
  const track = useHistoryStore((state) => state.track);
  const index = useHistoryStore((state) => state.index);
  const fraction = useHistoryStore((state) => state.fraction);
  const rate = useHistoryStore((state) => state.rate);
  const followCamera = useHistoryStore((state) => state.followCamera);
  const setFollowCamera = useHistoryStore((state) => state.setFollowCamera);
  const setPlayheadOffscreen = useHistoryStore((state) => state.setPlayheadOffscreen);
  const markerRef = useRef<L.Marker | null>(null);
  const accent = fleetTokens[mode].accent;

  // Dragging the map is the user saying they want to look somewhere else, so
  // the camera lets go rather than dragging the view back on the next frame.
  useEffect(() => {
    function release() {
      if (useHistoryStore.getState().followCamera) setFollowCamera(false);
    }
    map.on("dragstart", release);
    return () => {
      map.off("dragstart", release);
    };
  }, [map, setFollowCamera]);

  useEffect(() => {
    const point = track[index];
    const position = getPlayheadPosition(track, index, fraction);
    if (!point || !position) {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    const icon = playheadIcon(accent, point.headingDeg, point.speedKph > 0);
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon, interactive: false, keyboard: false, zIndexOffset: 1_000 }).addTo(map);
    } else {
      markerRef.current.setIcon(icon);
      markerRef.current.setLatLng(position);
    }

    if (!followCamera) {
      // Only worth telling the user the vehicle left the view; while the
      // camera follows, it never can.
      const offscreen = !map.getBounds().pad(-0.06).contains(position);
      if (offscreen !== useHistoryStore.getState().playheadOffscreen) setPlayheadOffscreen(offscreen);
      return;
    }

    // The map moves only once the vehicle nears the edge. Recentring on every
    // frame would leave the whole route sliding under a marker that never
    // moves, which is far harder to watch.
    // Above 2× the pan animation cannot keep up anyway, and the queued
    // animations make the map lag further behind every frame.
    if (!map.getBounds().pad(-0.25).contains(position)) {
      map.panTo(position, { animate: rate <= 2, duration: 0.35, noMoveStart: true });
    }
  }, [accent, followCamera, fraction, index, map, rate, setPlayheadOffscreen, track]);


  return null;
}

/**
 * Leaflet caches the container size, and the trackpoint panel changes the map's
 * width every time it opens or closes. Without this the map keeps working to
 * the width it had at startup: tiles land in the wrong place and "fit the whole
 * route" fits it to a viewport that no longer exists.
 */
function MapAutoSize() {
  const map = useMap();

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize({ animate: false }));
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return null;
}

/** A new track arrives framed: the whole trip fits before anything plays. */
function HistoryBounds() {
  const map = useMap();
  const track = useHistoryStore((state) => state.track);

  useEffect(() => {
    if (track.length === 0) return;
    const bounds = L.latLngBounds(track.map((point) => [point.lat, point.lng] as [number, number]));

    let frame = 0;
    function fit() {
      // A container that has not been laid out yet reports no size, and Leaflet
      // then reports that any bounds at all fit — at the maximum zoom, which
      // puts the whole route off screen.
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) {
        frame = window.requestAnimationFrame(fit);
        return;
      }
      map.invalidateSize({ animate: false });
      // Leave room for whatever floats over the map right now, so the route is
      // framed in the part of it that is actually visible.
      const rightInset = useHistoryStore.getState().inspectorOpen ? 324 : 56;
      map.fitBounds(bounds, { paddingTopLeft: [56, 70], paddingBottomRight: [rightInset, 56], maxZoom: 16, animate: false });
    }

    fit();
    return () => window.cancelAnimationFrame(frame);
  }, [map, track]);

  return null;
}

export default function HistoryMap() {
  return (
    <MapContainer center={DEFAULT_CENTER} zoom={11} style={{ width: "100%", height: "100%" }} scrollWheelZoom zoomControl={false}>
      <MapTileLayer />
      <MapAutoSize />
      <HistoryRoute />
      <HistoryPlayhead />
      <HistoryBounds />
    </MapContainer>
  );
}
