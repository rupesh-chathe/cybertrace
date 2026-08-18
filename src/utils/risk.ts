import type { RiskLevel } from '@/types/evidence';

export const riskLevelFromScore = (score: number): RiskLevel => {
  if (score <= 30) return 'LOW';
  if (score <= 70) return 'MEDIUM';
  return 'HIGH';
};

export const riskColor = (level: RiskLevel): string => {
  switch (level) {
    case 'LOW':
      return 'text-emerald-400';
    case 'MEDIUM':
      return 'text-amber-400';
    case 'HIGH':
      return 'text-red-400';
  }
};

export const riskBg = (level: RiskLevel): string => {
  switch (level) {
    case 'LOW':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'HIGH':
      return 'bg-red-500/10 text-red-400 border-red-500/30';
  }
};

export const riskBarColor = (level: RiskLevel): string => {
  switch (level) {
    case 'LOW':
      return 'bg-emerald-500';
    case 'MEDIUM':
      return 'bg-amber-500';
    case 'HIGH':
      return 'bg-red-500';
  }
};

export const generateSha256 = (): string => {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export const generateEvidenceId = (): string => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `EVD-${num}`;
};
