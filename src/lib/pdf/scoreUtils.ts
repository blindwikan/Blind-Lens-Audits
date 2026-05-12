import type { LighthouseSummary, WaveStats } from "@/lib/api/audit";

export function calculateBlindLensScore(
  waveStats: Pick<WaveStats, "totalErrors" | "contrastErrors" | "alerts">,
  lighthouse: Pick<LighthouseSummary, "accessibilityScore"> | null
) {
  const wavePenalty =
    waveStats.totalErrors * 6 +
    waveStats.contrastErrors * 3 +
    waveStats.alerts * 1;
  const waveScore = Math.max(0, 100 - wavePenalty);

  const lhScore =
    lighthouse && typeof lighthouse.accessibilityScore === "number"
      ? Math.max(0, Math.min(100, lighthouse.accessibilityScore))
      : null;

  const combined =
    lhScore === null ? waveScore : waveScore * 0.7 + lhScore * 0.3;

  return Math.max(0, Math.min(100, Math.round(combined)));
}

export type Verdict = {
  label: string;
  tone: string;
  ring: string;
  bg: string;
  hex: string;
};

export function getScoreVerdict(score: number): Verdict {
  if (score >= 90)
    return { label: "Excellent", tone: "text-success", ring: "border-success/40", bg: "bg-success/5", hex: "#22c55e" };
  if (score >= 75)
    return { label: "Good", tone: "text-accent", ring: "border-accent/40", bg: "bg-accent/5", hex: "#14b8a6" };
  if (score >= 55)
    return { label: "Fair", tone: "text-warning", ring: "border-warning/40", bg: "bg-warning/5", hex: "#f59e0b" };
  if (score >= 35)
    return { label: "Poor", tone: "text-warning", ring: "border-warning/50", bg: "bg-warning/10", hex: "#f97316" };
  return { label: "Critical", tone: "text-destructive", ring: "border-destructive/50", bg: "bg-destructive/10", hex: "#ef4444" };
}
