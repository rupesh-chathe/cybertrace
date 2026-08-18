import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, ArrowRight, Folders } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { StatusBadge, PriorityBadge } from '@/components/common/Badges';
import { LoadingState, EmptyState } from '@/components/common/States';
import { relativeTime } from '@/utils/format';
import { caseService } from '@/services/caseService';
import type { InvestigationCase, CaseStatus, CasePriority } from '@/types/case';

const statusOptions: (CaseStatus | 'ALL')[] = ['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'];
const priorityOptions: (CasePriority | 'ALL')[] = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const sortOptions = ['Recent', 'Oldest', 'Priority', 'Evidence Count'] as const;

export default function Cases() {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') ?? '';

  const [search, setSearch] = useState(queryParam);
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | 'ALL'>('ALL');
  const [sort, setSort] = useState<(typeof sortOptions)[number]>('Recent');

  useEffect(() => {
    caseService.getCases().then((c) => {
      setCases(c);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setSearch(queryParam);
  }, [queryParam]);

  const filtered = useMemo(() => {
    let result = cases;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.caseId.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') result = result.filter((c) => c.status === statusFilter);
    if (priorityFilter !== 'ALL') result = result.filter((c) => c.priority === priorityFilter);

    const priorityRank: Record<CasePriority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    switch (sort) {
      case 'Recent':
        result = [...result].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'Oldest':
        result = [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'Priority':
        result = [...result].sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
        break;
      case 'Evidence Count':
        result = [...result].sort((a, b) => b.evidenceCount - a.evidenceCount);
        break;
    }
    return result;
  }, [cases, search, statusFilter, priorityFilter, sort]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cases"
        subtitle="Manage and track investigation cases."
        actions={
          <Link
            to="/cases/new"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" />
            Create Case
          </Link>
        }
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by case ID, title, or description..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'ALL')}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as CasePriority | 'ALL')}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>{p === 'ALL' ? 'All Priority' : p}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as (typeof sortOptions)[number])}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
            >
              {sortOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Loading cases..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Folders}
            title="No cases found"
            description="Try adjusting your filters or create a new case."
            action={
              <Link
                to="/cases/new"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
              >
                <Plus className="h-4 w-4" />
                Create Case
              </Link>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">Case ID</th>
                  <th className="px-5 py-3 font-medium">Case Name</th>
                  <th className="px-5 py-3 font-medium">Investigator</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Evidence</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.caseId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-mono text-xs text-cyan-400">{c.caseId}</td>
                    <td className="px-5 py-3 text-slate-200 max-w-[200px] truncate">{c.title}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{c.investigator}</td>
                    <td className="px-5 py-3"><PriorityBadge priority={c.priority} /></td>
                    <td className="px-5 py-3 text-slate-300">{c.evidenceCount}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{relativeTime(c.updatedAt)}</td>
                    <td className="px-5 py-3">
                      <Link to={`/cases/${c.caseId}`} className="text-cyan-400 hover:text-cyan-300">
                        <ArrowRight className="h-4 w-4" />
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
