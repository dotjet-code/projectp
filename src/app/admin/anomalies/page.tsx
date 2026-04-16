import {
  detectIpClusters,
  detectRateLimitHotspots,
  detectSuspectRewardClusters,
} from "@/lib/projectp/anomalies";
import { AnomaliesClient } from "./anomalies-client";

export const dynamic = "force-dynamic";

export const metadata = { title: "不正検知" };

export default async function AnomaliesPage() {
  const [ipClusters, hotspots, rewardClusters] = await Promise.all([
    detectIpClusters(2),
    detectRateLimitHotspots(24, 5),
    detectSuspectRewardClusters(),
  ]);

  return (
    <main className="mx-auto max-w-[1000px] px-6 py-8">
      <h1 className="text-2xl font-extrabold mb-2">不正検知</h1>
      <p className="text-xs text-muted mb-6">
        ファン会員と景品まわりの異常兆候。確証ではなく <b>調査の起点</b> として使ってください。
      </p>

      <AnomaliesClient
        ipClusters={ipClusters}
        hotspots={hotspots}
        rewardClusters={rewardClusters}
      />
    </main>
  );
}
