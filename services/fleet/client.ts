// Port 8080 is commonly occupied by local web servers, so the Go API uses 8081 by default.
export const fleetApiUrl = process.env.NEXT_PUBLIC_FLEET_API_URL ?? "http://localhost:8081";

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${fleetApiUrl}${path}`, { cache: "no-store", signal });
  if (!response.ok) throw new Error(`Fleet API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${fleetApiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Fleet API request failed (${response.status})`);
  return response.json() as Promise<T>;
}
