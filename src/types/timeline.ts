export type TimelineType =
  | 'Authentication'
  | 'File Activity'
  | 'System Activity'
  | 'AI Analysis'
  | 'Evidence';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: TimelineType;
  evidence: string;
  description: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}
