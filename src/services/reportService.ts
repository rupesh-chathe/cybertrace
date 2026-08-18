import type { InvestigationCase } from '@/types/case';
import type { Evidence } from '@/types/evidence';
import type { TimelineEvent } from '@/types/timeline';
import type { AuditLog } from '@/types/audit';
import { store } from './store';

export interface ForensicReport {
  reportId: string;
  case: InvestigationCase;
  generatedBy: string;
  generatedAt: string;
  evidence: Evidence[];
  timeline: TimelineEvent[];
  auditLogs: AuditLog[];
  notes: { author: string; content: string; timestamp: string }[];
  riskDistribution: { low: number; medium: number; high: number };
  conclusion: string;
}

const KEY = 'reports';

interface StoredReportMeta {
  reportId: string;
  caseId: string;
  caseTitle: string;
  generatedBy: string;
  generatedAt: string;
  riskLevel: string;
  evidenceCount: number;
}

const getAllMeta = (): StoredReportMeta[] => store.get(KEY, []);

export const reportService = {
  async listReports(): Promise<StoredReportMeta[]> {
    await new Promise((r) => setTimeout(r, 200));
    return getAllMeta();
  },

  async generateReport(
    caseData: InvestigationCase,
    evidence: Evidence[],
    timeline: TimelineEvent[],
    auditLogs: AuditLog[],
    notes: { author: string; content: string; timestamp: string }[],
    generatedBy: string
  ): Promise<ForensicReport> {
    await new Promise((r) => setTimeout(r, 700));
    const reportId = `RPT-2026-${String(getAllMeta().length + 1).padStart(3, '0')}`;
    const low = evidence.filter((e) => e.riskLevel === 'LOW').length;
    const medium = evidence.filter((e) => e.riskLevel === 'MEDIUM').length;
    const high = evidence.filter((e) => e.riskLevel === 'HIGH').length;
    const topRisk = evidence.length ? Math.max(...evidence.map((e) => e.riskScore)) : 0;
    const conclusion =
      high > 0
        ? `Investigation identified ${high} high-risk artifact(s) with a peak risk score of ${topRisk}/100. Prioritize manual review of flagged evidence.`
        : medium > 0
          ? `Investigation identified ${medium} medium-risk artifact(s). Standard review recommended.`
          : `No high-risk artifacts identified. Routine review recommended.`;

    const report: ForensicReport = {
      reportId,
      case: caseData,
      generatedBy,
      generatedAt: new Date().toISOString(),
      evidence,
      timeline,
      auditLogs,
      notes,
      riskDistribution: { low, medium, high },
      conclusion,
    };

    const meta: StoredReportMeta = {
      reportId,
      caseId: caseData.caseId,
      caseTitle: caseData.title,
      generatedBy,
      generatedAt: report.generatedAt,
      riskLevel: high > 0 ? 'HIGH' : medium > 0 ? 'MEDIUM' : 'LOW',
      evidenceCount: evidence.length,
    };
    store.set(KEY, [meta, ...getAllMeta()]);
    store.set(`report_${reportId}`, report);
    return report;
  },

  async getReport(reportId: string): Promise<ForensicReport | null> {
    await new Promise((r) => setTimeout(r, 200));
    return store.get<ForensicReport | null>(`report_${reportId}`, null);
  },
};
