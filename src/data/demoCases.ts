import type { InvestigationCase } from '@/types/case';

export const demoCases: InvestigationCase[] = [
  {
    caseId: 'CYB-001',
    title: 'Unauthorized Access Investigation',
    description:
      'Investigation of repeated unauthorized authentication attempts targeting internal systems. Multiple failed login events detected from anomalous source addresses within a short time window.',
    investigator: 'Investigator One',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    evidenceCount: 12,
    createdAt: '2026-07-14T09:12:00Z',
    updatedAt: '2026-08-17T16:42:00Z',
  },
  {
    caseId: 'CYB-002',
    title: 'Suspicious Document Investigation',
    description:
      'Triage of a suspicious document artifact containing anomalous metadata and unusual embedded references. Document was uploaded for forensic review.',
    investigator: 'Investigator Two',
    priority: 'MEDIUM',
    status: 'OPEN',
    evidenceCount: 7,
    createdAt: '2026-07-28T11:03:00Z',
    updatedAt: '2026-08-16T10:15:00Z',
  },
  {
    caseId: 'CYB-003',
    title: 'Digital Evidence Review',
    description:
      'Broad review of collected digital evidence for integrity verification and risk prioritization prior to investigator handoff.',
    investigator: 'Investigator One',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    evidenceCount: 9,
    createdAt: '2026-08-02T08:00:00Z',
    updatedAt: '2026-08-18T07:55:00Z',
  },
  {
    caseId: 'CYB-004',
    title: 'Endpoint Anomaly Triage',
    description:
      'Review of endpoint log anomalies indicating unexpected process execution and file modification patterns.',
    investigator: 'Investigator Three',
    priority: 'HIGH',
    status: 'OPEN',
    evidenceCount: 5,
    createdAt: '2026-08-05T14:20:00Z',
    updatedAt: '2026-08-17T12:10:00Z',
  },
  {
    caseId: 'CYB-005',
    title: 'Archive Integrity Check',
    description:
      'Verification of archived evidence packages for chain-of-custody integrity and hash validation.',
    investigator: 'Investigator Two',
    priority: 'LOW',
    status: 'CLOSED',
    evidenceCount: 4,
    createdAt: '2026-06-21T10:00:00Z',
    updatedAt: '2026-07-30T17:30:00Z',
  },
];
