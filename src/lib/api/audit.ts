import { supabase } from '@/integrations/supabase/client';

export interface AuditFix {
  severity: 'Critical' | 'Serious' | 'Moderate' | 'Minor';
  title: string;
  description: string;
}

export interface WcagCategory {
  name: string;
  score: number;
}

export interface WcagSummary {
  score: number;
  level: string;
  violations: number;
  categories: WcagCategory[];
}

export interface AuditResult {
  success: boolean;
  url: string;
  pageTitle: string;
  wcagSummary: WcagSummary;
  fixes: AuditFix[];
  commentary: string[];
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
