import { useEffect, useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { RiskBadge } from '@/components/common/Badges';
import { LoadingState, EmptyState } from '@/components/common/States';
import { auditService } from '@/services/auditService';
import { demoTimeline } from '@/data/demoTimeline';
import { formatDateTime, formatTime } from '@/utils/format';
import type { TimelineEvent } from '@/types/timeline';
import { GitBranch } from 'lucide-react';

type FilterType = 'All' | 'Low' | 'Medium' | 'High' | 'Authentication' | 'File Activity' | 'System Activity';

const filters: FilterType[] = ['All', 'Low', 'Medium', 'High', 'Authentication', 'File Activity', 'System Activity'];

export default function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  useEffect(() => {
    auditService.getLogs().then(() => {
      setEvents([...demoTimeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return events;
    if (['Low', 'Medium', 'High'].includes(activeFilter)) {
      return events.filter((e) => e.risk === activeFilter.toUpperCase());
    }
    return events.filter((e) => e.type === activeFilter);
  }, [events, activeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader title="Investigation Timeline" subtitle="Chronological view of investigation events and findings." />

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              activeFilter === f
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                : 'border-slate-700 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading timeline..." />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={GitBranch} title="No events found" description="No events match the selected filter." />
        </Card>
      ) : (
        <Card className="p-6">
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-700" />
            {filtered.map((event) => (
              <div key={event.id} className="relative mb-8 last:mb-0 animate-fade-in">
                <div className={`absolute -left-[22px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${
                  event.risk === 'HIGH' ? 'bg-red-400' : event.risk === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500">{formatTime(event.timestamp)}</span>
                      <span className="text-xs text-slate-600">·</span>
                      <span className="text-xs text-slate-400">{event.type}</span>
                    </div>
                    <p className="text-sm text-slate-200">{event.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evidence: {event.evidence} · {formatDateTime(event.timestamp)}
                    </p>
                  </div>
                  <RiskBadge level={event.risk} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
