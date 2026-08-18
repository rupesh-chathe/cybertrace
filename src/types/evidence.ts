export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type EvidenceType =
  | 'PDF'
  | 'TXT'
  | 'CSV'
  | 'JPG'
  | 'PNG'
  | 'JSON'
  | 'LOG'
  | 'ZIP';
export type EvidenceStatus = 'UPLOADED' | 'PROCESSING' | 'ANALYZED' | 'ARCHIVED';
export type IntegrityStatus = 'VERIFIED' | 'COMPROMISED' | 'PENDING';

export interface EvidenceMetadata {
  fileSize: string;
  created: string;
  modified: string;
  mimeType: string;
  extension: string;
}

export interface RiskIndicator {
  label: string;
  severity: RiskLevel;
}

export interface Evidence {
  evidenceId: string;
  filename: string;
  type: EvidenceType;
  caseId: string;
  caseTitle: string;
  fileSize: string;
  riskScore: number;
  riskLevel: RiskLevel;
  integrity: IntegrityStatus;
  sha256: string;
  uploadedAt: string;
  status: EvidenceStatus;
  metadata: EvidenceMetadata;
  riskIndicators: RiskIndicator[];
  aiSummary?: string;
  aiRecommendation?: string;
}
