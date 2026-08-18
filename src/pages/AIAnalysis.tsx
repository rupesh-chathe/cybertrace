import { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { RiskBadge } from '@/components/common/Badges';
import { LoadingState, EmptyState } from '@/components/common/States';
import { RiskScore } from '@/components/evidence/RiskScore';
import { evidenceService } from '@/services/evidenceService';
import type { Evidence } from '@/types/evidence';

export default function AIAnalysis() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Evidence | null>(null);

  useEffect(() => {
    evidenceService.getEvidence().then((e) => {
      setEvidence(e);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState label="Loading analysis data..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI-Assisted Evidence Analysis"
        subtitle="Automated analysis helps investigators prioritize evidence for manual review."
      />

      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-cyan-400" />
        <p className="text-sm text-cyan-300">AI-assisted prototype analysis — not a substitute for manual forensic review.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Evidence list */}
        <Card className="overflow-hidden lg:col-span-1">
          <div className="border-b border-slate-800 px-4 py-3">
            <h3 className="text-sm font-medium text-slate-300">Evidence Artifacts</h3>
          </div>
          {evidence.length === 0 ? (
            <EmptyState icon={Sparkles} title="No evidence available" />
          ) : (
            <div className="divide-y divide-slate-800/50 max-h-[600px] overflow-y-auto scrollbar-thin">
              {evidence.map((e) => (
                <button
                  key={e.evidenceId}
                  onClick={() => setSelected(e)}
                  className={`block w-full px-4 py-3 text-left transition-colors ${
                    selected?.evidenceId === e.evidenceId ? 'bg-cyan-500/10' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <p className="text-sm text-slate-200 truncate">{e.filename}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{e.evidenceId}</span>
                    <RiskBadge level={e.riskLevel} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Analysis panel */}
        <div className="lg:col-span-2">
          {!selected ? (
            <Card className="p-6">
              <EmptyState
                icon={Sparkles}
                title="Select an evidence artifact"
                description="Choose an artifact from the list to view its AI-assisted analysis."
              />
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{selected.filename}</h3>
                  <p className="text-xs text-slate-500 mt-1">{selected.evidenceId} · {selected.caseId}</p>
                </div>
                <RiskScore score={selected.riskScore} level={selected.riskLevel} size="sm" />
              </div>

              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-5 mb-4">
                <p className="text-xs font-medium text-cyan-300 mb-2">AI Summary</p>
                <p className="text-sm text-slate-300">{selected.aiSummary}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                <div className="rounded-lg border border-slate-800 p-4">
                  <p className="text-xs text-slate-500 mb-2">Risk Level</p>
                  <div className="flex items-center gap-2">
                    <RiskBadge level={selected.riskLevel} />
                    <span className="text-sm text-slate-300">Score: {selected.riskScore}/100</span>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 p-4">
                  <p className="text-xs text-slate-500 mb-2">Integrity</p>
                  <p className="text-sm text-slate-200">{selected.integrity}</p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 p-4 mb-4">
                <p className="text-xs text-slate-500 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Indicators
                </p>
                <div className="space-y-2">
                  {selected.riskIndicators.map((ind, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${
                        ind.severity === 'HIGH' ? 'bg-red-400' : ind.severity === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span className="text-sm text-slate-200 flex-1">{ind.label}</span>
                      <RiskBadge level={ind.severity} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-800 p-4">
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
                  Recommendation
                </p>
                <p className="text-sm text-slate-300">{selected.aiRecommendation}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
