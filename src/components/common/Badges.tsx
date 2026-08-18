import type { CaseStatus, CasePriority } from '@/types/case';
import type { RiskLevel, IntegrityStatus } from '@/types/evidence';

const statusStyles: Record<CaseStatus, string> = {
  OPEN: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

const priorityStyles: Record<CasePriority, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const riskStyles: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  HIGH: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const integrityStyles: Record<IntegrityStatus, string> = {
  VERIFIED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  COMPROMISED: 'bg-red-500/10 text-red-400 border-red-500/30',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const base = 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium';

export const StatusBadge = ({ status }: { status: CaseStatus }) => (
  <span className={`${base} ${statusStyles[status]}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status.replace('_', ' ')}
  </span>
);

export const PriorityBadge = ({ priority }: { priority: CasePriority }) => (
  <span className={`${base} ${priorityStyles[priority]}`}>{priority}</span>
);

export const RiskBadge = ({ level }: { level: RiskLevel }) => (
  <span className={`${base} ${riskStyles[level]}`}>{level} RISK</span>
);

export const IntegrityBadge = ({ status }: { status: IntegrityStatus }) => (
  <span className={`${base} ${integrityStyles[status]}`}>
    {status === 'VERIFIED' && '✓ '}
    {status === 'COMPROMISED' && '! '}
    {status}
  </span>
);

export const Badge = ({ children, className }: BadgeProps) => (
  <span className={`${base} ${className ?? 'border-slate-600 text-slate-300'}`}>{children}</span>
);
