import { getFleetSnapshot } from "@/features/fleet/server";
import { LaunchpadGrid, toLaunchpadStats } from "@/features/launchpad";

export const metadata = { title: "หน้าแรก" };

export default async function HomePage() {
  const snapshot = await getFleetSnapshot();
  return <LaunchpadGrid stats={toLaunchpadStats(snapshot)} />;
}
