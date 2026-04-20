import { supabase } from '@/integrations/supabase/client';

export interface AuditIssue {
  severity: '🔴 Red Flag' | '🟡 It\'s Complicated' | '⚪ Minor Ick';
  title: string;
  blindLensCommentary: string;
}

export interface SeverityCounts {
  redFlag: number;
  complicated: number;
  minorIck: number;
}

export interface WaveStats {
  totalErrors: number;
  contrastErrors: number;
  alerts: number;
  features: number;
  structuralElements: number;
}

export interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number;
  displayValue: string;
}

export interface LighthouseSummary {
  accessibilityScore: number;
  failedAudits: LighthouseAudit[];
}

export interface AuditResult {
  success: boolean;
  url: string;
  waveStats: WaveStats;
  severityCounts: SeverityCounts;
  issues: AuditIssue[];
  closingSummary: string;
  lighthouse: LighthouseSummary | null;
}

export async function runAudit(url: string): Promise<AuditResult> {
  const { data, error } = await supabase.functions.invoke('accessibility-audit', {
    body: { url },
  });

  if (error) {
    throw new Error(error.message || 'Failed to run audit');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as AuditResult;
}
