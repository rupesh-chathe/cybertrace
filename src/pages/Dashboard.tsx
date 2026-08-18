import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Folders,
  FileSearch,
  AlertTriangle,
  Clock,
  ArrowRight,
  FlaskConical,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardLink } from '@/components/common/Card';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  RiskDistributionChart,
  EvidenceCategoriesChart,
  ActivityChart,
  CaseStatusChart,
} from '@/components/dashboard/Charts';
import { LoadingState } from '@/components/common/States';
import { StatusBadge, PriorityBadge, RiskBadge } from '@/components/common/Badges';
import { relativeTime } from '@/utils/format';
import { useAuth } from '@/hooks/useAuth';
import { caseService } from '@/services/caseService';
import { evidenceService } from '@/services/evidenceService';
import type { InvestigationCase } from '@/types/case';
import type { Evidence } from '@/types/evidence';

export default function Dashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([caseService.getCases(), evidenceService.getEvidence()]).then(
      ([c, e]) => {
        setCases(c);
        setEvidence(e);
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <LoadingState label="Loading dashboard..." />;

  const highRisk = evidence.filter((e) => e.riskLevel === 'HIGH').length;
  const pending = cases.filter((c) => c.status !== 'CLOSED').length;
  const recent = [...cases].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const riskData = [
    { name: 'Low', value: evidence.filter((e) => e.riskLevel === 'LOW').length, color: '#10b981' },
    { name: 'Medium', value: evidence.filter((e) => e.riskLevel === 'MEDIUM').length, color: '#f59e0b' },
    { name: 'High', value: highRisk, color: '#ef4444' },
  ];

  const categoryMap: Record<string, number> = {};
  evidence.forEach((e) => {
    categoryMap[e.type] = (categoryMap[e.type] ?? 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

  const activityData = [
    { day: 'Mon', events: 8 },
    { day: 'Tue', events: 12 },
    { day: 'Wed', events: 6 },
    { day: 'Thu', events: 15 },
    { day: 'Fri', events: 10 },
    { day: 'Sat', events: 4 },
    { day: 'Sun', events: 7 },
  ];

  const statusData = [
    { name: 'Open', count: cases.filter((c) => c.status === 'OPEN').length, color: '#0ea5e9' },
    { name: 'In Progress', count: cases.filter((c) => c.status === 'IN_PROGRESS').length, color: '#f59e0b' },
    { name: 'Closed', count: cases.filter((c) => c.status === 'CLOSED').length, color: '#64748b' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0] ?? 'Investigator'}`}
        subtitle="Monitor investigations and prioritize critical evidence."
        actions={
          <Link
            to="/cases/new"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            <FlaskConical className="h-4 w-4" />
            New Case
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Cases" value={cases.length} icon={Folders} tone="cyan" subtext="Active investigations" />
        <StatCard label="Evidence Files" value={evidence.length} icon={FileSearch} tone="slate" subtext="Processed artifacts" />
        <StatCard label="High Risk Evidence" value={highRisk} icon={AlertTriangle} tone="red" subtext="Requires review" />
        <StatCard label="Pending Review" value={pending} icon={Clock} tone="amber" subtext="Open cases" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-1">Risk Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Evidence by risk level</p>
          <RiskDistributionChart data={riskData} />
          <div className="mt-3 flex justify-center gap-4">
            {riskData.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                <span className="text-xs text-slate-400">{r.name} ({r.value})</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-1">Evidence Categories</h3>
          <p className="text-xs text-slate-500 mb-4">Files by type</p>
          <EvidenceCategoriesChart data={categoryData} />
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-medium text-slate-300 mb-1">Investigation Activity</h3>
          <p className="text-xs text-slate-500 mb-4">Events over the past week</p>
          <ActivityChart data={activityData} />
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-1">Case Status</h3>
          <p className="text-xs text-slate-500 mb-4">Investigations by status</p>
          <CaseStatusChart data={statusData} />
        </Card>
      </div>

      {/* Recent + High Risk */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <h3 className="text-sm font-medium text-slate-300">Recent Investigations</h3>
            <Link to="/cases" className="text-xs text-cyan-400 hover:text-cyan-300">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">Case ID</th>
                  <th className="px-5 py-3 font-medium">Case Name</th>
                  <th className="px-5 py-3 font-medium">Priority</th>
                  <th className="px-5 py-3 font-medium">Evidence</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recent.slice(0, 5).map((c) => (
                  <tr key={c.caseId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-mono text-xs text-cyan-400">{c.caseId}</td>
                    <td className="px-5 py-3 text-slate-200 truncate max-w-[180px]">{c.title}</td>
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

        <Card className="overflow-hidden">
          <div className="border-b border-slate-800 px-5 py-4">
            <h3 className="text-sm font-medium text-slate-300">High-Risk Evidence</h3>
          </div>
          <div className="divide-y divide-slate-800/50">
            {evidence
              .filter((e) => e.riskLevel === 'HIGH')
              .slice(0, 5)
              .map((e) => (
                <Link
                  key={e.evidenceId}
                  to={`/evidence/${e.evidenceId}`}
                  className="block px-5 py-3 hover:bg-slate-800/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-200 truncate">{e.filename}</p>
                    <RiskBadge level={e.riskLevel} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {e.evidenceId} · Score {e.riskScore} · {e.caseId}
                  </p>
                </Link>
              ))}
            {evidence.filter((e) => e.riskLevel === 'HIGH').length === 0 && (
              <p className="px-5 py-6 text-sm text-slate-500 text-center">No high-risk evidence</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
