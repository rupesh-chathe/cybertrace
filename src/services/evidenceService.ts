import type { Evidence } from '@/types/evidence';
import { demoEvidence } from '@/data/demoEvidence';
import { store } from './store';
import { generateSha256, generateEvidenceId, riskLevelFromScore } from '@/utils/risk';

const KEY = 'evidence';

const getAll = (): Evidence[] => store.get(KEY, demoEvidence);
const setAll = (e: Evidence[]) => store.set(KEY, e);

export interface UploadEvidenceInput {
  filename: string;
  type: Evidence['type'];
  caseId: string;
  caseTitle: string;
  fileSize: string;
}

export const evidenceService = {
  async getEvidence(): Promise<Evidence[]> {
    await new Promise((r) => setTimeout(r, 250));
    return getAll();
  },

  async getEvidenceById(id: string): Promise<Evidence | null> {
    await new Promise((r) => setTimeout(r, 200));
    return getAll().find((e) => e.evidenceId === id) ?? null;
  },

  async getByCaseId(caseId: string): Promise<Evidence[]> {
    await new Promise((r) => setTimeout(r, 200));
    return getAll().filter((e) => e.caseId === caseId);
  },

  async uploadEvidence(input: UploadEvidenceInput): Promise<Evidence> {
    await new Promise((r) => setTimeout(r, 300));
    const score = Math.floor(20 + Math.random() * 75);
    const level = riskLevelFromScore(score);
    const now = new Date().toISOString();
    const ext = input.filename.includes('.')
      ? '.' + input.filename.split('.').pop()?.toLowerCase()
      : '';
    const mimeMap: Record<string, string> = {
      PDF: 'application/pdf',
      TXT: 'text/plain',
      CSV: 'text/csv',
      JPG: 'image/jpeg',
      PNG: 'image/png',
      JSON: 'application/json',
      LOG: 'text/plain',
      ZIP: 'application/zip',
    };
    const evidence: Evidence = {
      evidenceId: generateEvidenceId(),
      filename: input.filename,
      type: input.type,
      caseId: input.caseId,
      caseTitle: input.caseTitle,
      fileSize: input.fileSize,
      riskScore: score,
      riskLevel: level,
      integrity: 'PENDING',
      sha256: generateSha256(),
      uploadedAt: now,
      status: 'PROCESSING',
      metadata: {
        fileSize: input.fileSize,
        created: now,
        modified: now,
        mimeType: mimeMap[input.type] ?? 'application/octet-stream',
        extension: ext,
      },
      riskIndicators: [
        { label: 'Unknown source', severity: 'MEDIUM' },
        { label: 'Requires investigator review', severity: level },
      ],
      aiSummary:
        'Automated triage flagged this artifact for review based on risk indicators.',
      aiRecommendation:
        'Review artifact metadata and risk indicators before advancing the investigation.',
    };
    setAll([evidence, ...getAll()]);
    return evidence;
  },

  async finalizeProcessing(evidenceId: string): Promise<Evidence | null> {
    const all = getAll().map((e) =>
      e.evidenceId === evidenceId
        ? { ...e, status: 'ANALYZED' as const, integrity: 'VERIFIED' as const }
        : e
    );
    setAll(all);
    return all.find((e) => e.evidenceId === evidenceId) ?? null;
  },

  async verifyIntegrity(evidenceId: string): Promise<{
    original: string;
    current: string;
    verified: boolean;
  }> {
    await new Promise((r) => setTimeout(r, 1200));
    const all = getAll();
    const ev = all.find((e) => e.evidenceId === evidenceId);
    if (!ev) throw new Error('Evidence not found');
    const verified = ev.integrity !== 'COMPROMISED';
    if (verified) {
      setAll(
        all.map((e) =>
          e.evidenceId === evidenceId ? { ...e, integrity: 'VERIFIED' as const } : e
        )
      );
    }
    return { original: ev.sha256, current: ev.sha256, verified };
  },

  async analyzeEvidence(evidenceId: string): Promise<Evidence | null> {
    await new Promise((r) => setTimeout(r, 1000));
    const all = getAll().map((e) =>
      e.evidenceId === evidenceId
        ? { ...e, status: 'ANALYZED' as const }
        : e
    );
    setAll(all);
    return all.find((e) => e.evidenceId === evidenceId) ?? null;
  },
};
