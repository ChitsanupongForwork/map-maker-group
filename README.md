# Fleet Monitor

An independent front-end portfolio concept for viewing a simulated vehicle fleet on a map.

## What it demonstrates

- Browse 1,000 simulated vehicle markers using map clustering.
- Search the vehicle list without rendering all rows at once.
- Select a vehicle and fly to its simulated location.
- Review a separate vehicle activity history page.
- Stream live position updates from the included Go service over SSE.

## Scope and data

This project is an original UI concept. It contains no proprietary code, branding, customer data, or other material from any third party. It uses fictional vehicle data only. Every vehicle record is served by the Go API; the front end keeps no offline copy, so it reports a connection error rather than showing stand-in data that could be mistaken for the real thing.

The map uses OpenStreetMap tiles and keeps the required attribution visible in the map control. Do not add bulk-download or offline tile features when using the public tile service.

## Run locally

```bash
npm run dev
```

For a production check:

```bash
npm run build
```

## Required Go API

The front end has no data of its own, so the API must be running before the dashboard shows anything. It lives in the sibling `map-maker-group-service-api` project. The service needs `DATABASE_URL`, so set it in a second terminal before starting (PowerShell):

```powershell
cd ..\map-maker-group-service-api
$env:DATABASE_URL="postgres://postgres:your-password@127.0.0.1:5432/postgres?sslmode=disable"
$env:DB_SCHEMA="map-maker-db"
go run .
```

To try the dashboard without PostgreSQL, start the in-memory demo instead:

```powershell
$env:DEMO_MODE="true"
go run .
```

Either way it provides a `GET /api/fleet` snapshot and an SSE stream at `GET /api/fleet/stream` on port 8080.

While the API is unreachable the dashboard shows a connection error and retries every five seconds, so it recovers on its own once the service starts. For Vercel, set `NEXT_PUBLIC_FLEET_API_URL` to the public URL of the separately deployed Go service.
