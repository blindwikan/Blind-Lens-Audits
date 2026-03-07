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

export interface AuditResult {
  success: boolean;
  url: string;
  accessibilityScore: number;
  severityCounts: SeverityCounts;
  issues: AuditIssue[];
  closingSummary: string;
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
