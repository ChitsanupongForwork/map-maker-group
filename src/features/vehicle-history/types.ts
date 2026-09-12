export type HistoryPoint = {
  lat: number;
  lng: number;
  timestamp: number;
  speedKph: number;
  headingDeg: number;
  address: string;
};

export type HistoryEvent = {
  id: string;
  type: "start" | "stop" | "moving" | "end";
  timestamp: number;
  title: string;
  detail: string;
  pointIndex: number;
};

export type HistoryTrip = {
  points: HistoryPoint[];
  events: HistoryEvent[];
  distanceKm: number;
  movingMinutes: number;
  stoppedMinutes: number;
  maxSpeedKph: number;
  averageSpeedKph: number;
};
