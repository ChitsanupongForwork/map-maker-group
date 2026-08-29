# Fleet Monitor

An independent front-end portfolio concept for viewing a simulated vehicle fleet on a map.

## What it demonstrates

- Browse 1,000 simulated vehicle markers using map clustering.
- Search the vehicle list without rendering all rows at once.
- Select a vehicle and fly to its simulated location.
- Review a separate vehicle activity history page.
- Optionally connect to the included Go SSE simulator for live position updates.

## Scope and data

This project is an original UI concept. It contains no proprietary code, branding, customer data, or other material from any third party. It uses fictional vehicle data only. When the real-time API is unavailable, the interface falls back to deterministic browser data.

The map uses OpenStreetMap tiles and keeps the required attribution visible in the map control. Do not add bulk-download or offline tile features when using the public tile service.

## Run locally

```bash
npm run dev
```

For a production check:

```bash
npm run build
```

## Optional Go real-time simulator

The front end falls back to deterministic browser data if the simulator is not running. The API lives in the sibling `map-maker-group-service-api` project. To stream updates from Go, run this in a second terminal:

```bash
cd ..\map-maker-group-service-api
go run .
```

It provides a `GET /api/fleet` snapshot and an SSE stream at `GET /api/fleet/stream` on port 8081. For Vercel, set `NEXT_PUBLIC_FLEET_API_URL` to the public URL of the separately deployed Go service; otherwise the portfolio falls back to its 1,000 fictional browser records.
