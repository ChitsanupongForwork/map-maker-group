/**
 * Master switch for the API layer.
 *
 * While this is off the dashboard never calls the Go service: no snapshot, no
 * SSE, no retry loop and no connection-error dialog. It runs on generated data
 * instead, and every status badge says so.
 *
 * To go back to the live API, flip `API_ENABLED_BY_DEFAULT` to `true` (or set
 * NEXT_PUBLIC_FLEET_API_ENABLED=true, which wins over it).
 */
const API_ENABLED_BY_DEFAULT = false;

const override = process.env.NEXT_PUBLIC_FLEET_API_ENABLED;

export const fleetApiEnabled = override === undefined || override === "" ? API_ENABLED_BY_DEFAULT : override === "true";
