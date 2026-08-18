import { ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'cyan' | 'slate' | 'red' | 'amber' | 'emerald';
  subtext?: string;
}

const toneMap = {
  cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400',
  slate: 'border-slate-700 bg-slate-800/30 text-slate-400',
  red: 'border-red-500/20 bg-red-500/5 text-red-400',
  amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
  emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
};

export function StatCard({ label, value, icon: Icon, tone, subtext }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{value}</p>
          {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
        </div>
        <div className={`rounded-lg border p-2.5 ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function IntegrityCard({ verified }: { verified: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 ${
        verified
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-red-500/30 bg-red-500/5'
      }`}
    >
      {verified ? (
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
      ) : (
        <ShieldAlert className="h-5 w-5 text-red-400" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${verified ? 'text-emerald-300' : 'text-red-300'}`}>
          {verified ? 'Evidence Integrity Verified' : 'Integrity Compromised'}
        </p>
        <p className="text-xs text-slate-400">
          {verified ? 'SHA-256 hash match confirmed' : 'Hash mismatch detected — requires review'}
        </p>
      </div>
      {verified && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
    </div>
  );
}
