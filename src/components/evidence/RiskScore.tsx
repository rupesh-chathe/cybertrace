import type { RiskLevel } from '@/types/evidence';
import { riskBarColor } from '@/utils/risk';

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { ring: 'h-16 w-16', text: 'text-lg', label: 'text-[10px]', stroke: 6 },
  md: { ring: 'h-24 w-24', text: 'text-2xl', label: 'text-xs', stroke: 8 },
  lg: { ring: 'h-32 w-32', text: 'text-3xl', label: 'text-sm', stroke: 10 },
};

export function RiskScore({ score, level, size = 'md' }: RiskScoreProps) {
  const s = sizeMap[size];
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = level === 'LOW' ? '#10b981' : level === 'MEDIUM' ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${s.ring}`}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={s.stroke}
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-slate-100 ${s.text}`}>{score}</span>
          <span className="text-[10px] text-slate-500">/ 100</span>
        </div>
      </div>
      <span
        className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${s.label} font-medium ${
          level === 'LOW'
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            : level === 'MEDIUM'
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
        }`}
      >
        {level} RISK
      </span>
    </div>
  );
}

export function RiskBar({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${riskBarColor(level)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-300 tabular-nums w-8 text-right">{score}</span>
    </div>
  );
}
