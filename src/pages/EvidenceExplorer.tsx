import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, FileSearch, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { RiskBadge, IntegrityBadge } from '@/components/common/Badges';
import { LoadingState, EmptyState } from '@/components/common/States';
import { RiskBar } from '@/components/evidence/RiskScore';
import { formatDate } from '@/utils/format';
import { evidenceService } from '@/services/evidenceService';
import { caseService } from '@/services/caseService';
import type { Evidence, RiskLevel, EvidenceType, IntegrityStatus } from '@/types/evidence';
import type { InvestigationCase } from '@/types/case';

const sortOptions = ['Recent', 'Risk: High to Low', 'Risk: Low to High'] as const;

export default function EvidenceExplorer() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [caseFilter, setCaseFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<EvidenceType | 'ALL'>('ALL');
  const [integrityFilter, setIntegrityFilter] = useState<IntegrityStatus | 'ALL'>('ALL');
  const [sort, setSort] = useState<(typeof sortOptions)[number]>('Recent');

  useEffect(() => {
    Promise.all([evidenceService.getEvidence(), caseService.getCases()]).then(([e, c]) => {
      setEvidence(e);
      setCases(c);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = evidence;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.filename.toLowerCase().includes(q) || e.evidenceId.toLowerCase().includes(q)
      );
    }
    if (caseFilter !== 'ALL') result = result.filter((e) => e.caseId === caseFilter);
    if (riskFilter !== 'ALL') result = result.filter((e) => e.riskLevel === riskFilter);
    if (typeFilter !== 'ALL') result = result.filter((e) => e.type === typeFilter);
    if (integrityFilter !== 'ALL') result = result.filter((e) => e.integrity === integrityFilter);

    switch (sort) {
      case 'Recent':
        result = [...result].sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        break;
      case 'Risk: High to Low':
        result = [...result].sort((a, b) => b.riskScore - a.riskScore);
        break;
      case 'Risk: Low to High':
        result = [...result].sort((a, b) => a.riskScore - b.riskScore);
        break;
    }
    return result;
  }, [evidence, search, caseFilter, riskFilter, typeFilter, integrityFilter, sort]);

  const types: (EvidenceType | 'ALL')[] = ['ALL', 'PDF', 'TXT', 'CSV', 'JPG', 'PNG', 'JSON', 'LOG', 'ZIP'];

  return (
    <div className="space-y-6">
      <PageHeader title="Evidence Explorer" subtitle="Browse, filter, and triage all evidence artifacts." />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or evidence ID..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none">
              <option value="ALL">All Cases</option>
              {cases.map((c) => <option key={c.caseId} value={c.caseId}>{c.caseId}</option>)}
            </select>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'ALL')} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none">
              <option value="ALL">All Risk</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as EvidenceType | 'ALL')} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none">
              {types.map((t) => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>)}
            </select>
            <select value={integrityFilter} onChange={(e) => setIntegrityFilter(e.target.value as IntegrityStatus | 'ALL')} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none">
              <option value="ALL">All Integrity</option>
              <option value="VERIFIED">Verified</option>
              <option value="COMPROMISED">Compromised</option>
              <option value="PENDING">Pending</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as (typeof sortOptions)[number])} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none">
              {sortOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Loading evidence..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={FileSearch} title="No evidence found" description="Try adjusting your filters." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">Evidence ID</th>
                  <th className="px-5 py-3 font-medium">Filename</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Case</th>
                  <th className="px-5 py-3 font-medium">Risk Score</th>
                  <th className="px-5 py-3 font-medium">Risk Level</th>
                  <th className="px-5 py-3 font-medium">Integrity</th>
                  <th className="px-5 py-3 font-medium">Uploaded</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.evidenceId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-mono text-xs text-cyan-400">{e.evidenceId}</td>
                    <td className="px-5 py-3 text-slate-200 truncate max-w-[160px]">{e.filename}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{e.type}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400">{e.caseId}</td>
                    <td className="px-5 py-3 w-28"><RiskBar score={e.riskScore} level={e.riskLevel} /></td>
                    <td className="px-5 py-3"><RiskBadge level={e.riskLevel} /></td>
                    <td className="px-5 py-3"><IntegrityBadge status={e.integrity} /></td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(e.uploadedAt)}</td>
                    <td className="px-5 py-3">
                      <Link to={`/evidence/${e.evidenceId}`} className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs">
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
