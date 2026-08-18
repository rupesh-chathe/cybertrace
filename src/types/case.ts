export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface InvestigationCase {
  caseId: string;
  title: string;
  description: string;
  investigator: string;
  priority: CasePriority;
  status: CaseStatus;
  evidenceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  author: string;
  content: string;
  timestamp: string;
}
