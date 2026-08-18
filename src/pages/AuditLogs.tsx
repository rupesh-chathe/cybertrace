import { useEffect, useState, useMemo } from 'react';
import { Search, ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { LoadingState, EmptyState } from '@/components/common/States';
import { auditService } from '@/services/auditService';
import { formatDateTime } from '@/utils/format';
import type { AuditLog } from '@/types/audit';

const actionColors: Record<string, string> = {
  Login: 'text-sky-400',
  'Case Created': 'text-cyan-400',
  'Case Updated': 'text-cyan-400',
  'Evidence Uploaded': 'text-blue-400',
  'Evidence Analyzed': 'text-amber-400',
  'AI Analysis Completed': 'text-amber-400',
  'Integrity Verified': 'text-emerald-400',
  'Report Generated': 'text-cyan-400',
  'Note Added': 'text-slate-400',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    auditService.getLogs().then((l) => {
      setLogs(l);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
    );
  }, [logs, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="Complete activity trail for all investigation actions." />

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, action, resource, or details..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Loading audit logs..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={ScrollText} title="No logs found" description="No audit entries match your search." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Resource</th>
                  <th className="px-5 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                    <td className="px-5 py-3 text-xs text-slate-300 truncate max-w-[180px]">{log.user}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${actionColors[log.action] ?? 'text-slate-300'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400 font-mono truncate max-w-[180px]">{log.resource}</td>
                    <td className="px-5 py-3 text-xs text-slate-400">{log.details}</td>
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
