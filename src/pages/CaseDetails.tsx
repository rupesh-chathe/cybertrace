import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ShieldCheck, AlertTriangle, Clock, FlaskConical } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { StatusBadge, PriorityBadge, RiskBadge, IntegrityBadge } from '@/components/common/Badges';
import { LoadingState, EmptyState } from '@/components/common/States';
import { EvidenceUploader } from '@/components/evidence/EvidenceUploader';
import { RiskBar } from '@/components/evidence/RiskScore';
import { formatDate, formatDateTime } from '@/utils/format';
import { caseService } from '@/services/caseService';
import { evidenceService } from '@/services/evidenceService';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { auditService } from '@/services/auditService';
import { demoTimeline } from '@/data/demoTimeline';
import { reportService } from '@/services/reportService';
import type { InvestigationCase, CaseNote } from '@/types/case';
import type { Evidence } from '@/types/evidence';
import { CaseNotes } from '@/components/cases/CaseNotes';

type Tab = 'overview' | 'evidence' | 'timeline' | 'ai' | 'notes' | 'report';

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'ai', label: 'AI Analysis' },
  { id: 'notes', label: 'Notes' },
  { id: 'report', label: 'Report' },
];

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<InvestigationCase | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      caseService.getCaseById(id),
      evidenceService.getByCaseId(id),
    ]).then(([c, e]) => {
      setCaseData(c);
      setEvidence(e);
      setNotes(caseService.getNotes(id));
      setLoading(false);
    });
  }, [id]);

  const handleEvidenceUploaded = (ev: Evidence) => {
    setEvidence((prev) => [ev, ...prev]);
    if (caseData) {
      caseService.incrementEvidence(caseData.caseId);
      setCaseData({ ...caseData, evidenceCount: caseData.evidenceCount + 1 });
    }
    auditService.log(user?.email ?? 'unknown', 'Evidence Uploaded', `${ev.evidenceId} / ${ev.filename}`, `Uploaded to case ${id}`);
  };

  const handleGenerateReport = async () => {
    if (!caseData) return;
    setGenerating(true);
    const report = await reportService.generateReport(
      caseData,
      evidence,
      demoTimeline.filter((t) => t.evidence && evidence.some((e) => e.filename === t.evidence)),
      await auditService.getLogs(),
      notes.map((n) => ({ author: n.author, content: n.content, timestamp: n.timestamp })),
      user?.name ?? 'Investigator'
    );
    auditService.log(user?.email ?? 'unknown', 'Report Generated', report.reportId, `Forensic report for ${caseData.caseId}`);
    setGenerating(false);
    toast('success', `Report ${report.reportId} generated.`);
    navigate(`/reports/${report.reportId}`);
  };

  if (loading) return <LoadingState label="Loading case..." />;
  if (!caseData) {
    return (
      <Card>
        <EmptyState
          title="Case not found"
          description="The case you are looking for does not exist."
          action={<Link to="/cases" className="text-cyan-400 hover:text-cyan-300">Back to Cases</Link>}
        />
      </Card>
    );
  }

  const highRisk = evidence.filter((e) => e.riskLevel === 'HIGH').length;
  const mediumRisk = evidence.filter((e) => e.riskLevel === 'MEDIUM').length;
  const lowRisk = evidence.filter((e) => e.riskLevel === 'LOW').length;
  const allVerified = evidence.length > 0 && evidence.every((e) => e.integrity === 'VERIFIED');

  const overviewCards = [
    { label: 'Total Evidence', value: evidence.length, icon: FileText, tone: 'text-slate-300' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, tone: 'text-red-400' },
    { label: 'Medium Risk', value: mediumRisk, icon: AlertTriangle, tone: 'text-amber-400' },
    { label: 'Low Risk', value: lowRisk, icon: ShieldCheck, tone: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/cases')}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cases
      </button>

      <PageHeader
        title={caseData.title}
        subtitle={`${caseData.caseId} · ${caseData.investigator}`}
        actions={<EvidenceUploader caseData={caseData} onUploaded={handleEvidenceUploaded} />}
      />

      {/* Case meta */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <StatusBadge status={caseData.status} />
          <PriorityBadge priority={caseData.priority} />
          <span className="text-xs text-slate-500">Created {formatDate(caseData.createdAt)}</span>
          <span className="text-xs text-slate-500">Updated {formatDate(caseData.updatedAt)}</span>
        </div>
        <p className="text-sm text-slate-300">{caseData.description}</p>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-800">
        <nav className="flex gap-1 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {overviewCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${card.tone}`} />
                    <div>
                      <p className="text-2xl font-semibold text-slate-100">{card.value}</p>
                      <p className="text-xs text-slate-400">{card.label}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className={`h-5 w-5 ${allVerified ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div>
                <p className="text-sm font-medium text-slate-200">Integrity Status</p>
                <p className="text-xs text-slate-400">
                  {allVerified
                    ? 'All evidence hashes verified'
                    : evidence.length === 0
                      ? 'No evidence yet'
                      : 'Some evidence pending verification'}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {demoTimeline.slice(0, 4).map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{event.description}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(event.timestamp)}</p>
                  </div>
                  <RiskBadge level={event.risk} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'evidence' && (
        <Card className="overflow-hidden">
          {evidence.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No evidence yet"
              description="Upload evidence to begin analysis."
            />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                    <th className="px-5 py-3 font-medium">Evidence ID</th>
                    <th className="px-5 py-3 font-medium">Filename</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Risk</th>
                    <th className="px-5 py-3 font-medium">Integrity</th>
                    <th className="px-5 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {evidence.map((e) => (
                    <tr key={e.evidenceId} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-5 py-3 font-mono text-xs text-cyan-400">{e.evidenceId}</td>
                      <td className="px-5 py-3 text-slate-200 truncate max-w-[180px]">{e.filename}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{e.type}</td>
                      <td className="px-5 py-3 w-32"><RiskBar score={e.riskScore} level={e.riskLevel} /></td>
                      <td className="px-5 py-3"><IntegrityBadge status={e.integrity} /></td>
                      <td className="px-5 py-3">
                        <Link to={`/evidence/${e.evidenceId}`} className="text-cyan-400 hover:text-cyan-300 text-xs">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'timeline' && (
        <Card className="p-5">
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-700" />
            {demoTimeline.map((event) => (
              <div key={event.id} className="relative mb-6 last:mb-0">
                <div className={`absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-slate-900 ${
                  event.risk === 'HIGH' ? 'bg-red-400' : event.risk === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-slate-200">{event.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDateTime(event.timestamp)} · {event.type} · {event.evidence}
                    </p>
                  </div>
                  <RiskBadge level={event.risk} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-4">
          {evidence.length === 0 ? (
            <Card><EmptyState icon={FlaskConical} title="No evidence to analyze" /></Card>
          ) : (
            evidence.map((e) => (
              <Card key={e.evidenceId} className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{e.filename}</p>
                    <p className="text-xs text-slate-500">{e.evidenceId} · {e.caseId}</p>
                  </div>
                  <RiskBadge level={e.riskLevel} />
                </div>
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-xs font-medium text-cyan-300 mb-2">AI-Assisted Prototype Analysis</p>
                  <p className="text-sm text-slate-300">{e.aiSummary}</p>
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-1">Indicators:</p>
                    <ul className="space-y-1">
                      {e.riskIndicators.map((ind, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            ind.severity === 'HIGH' ? 'bg-red-400' : ind.severity === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                          {ind.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    <span className="text-xs text-slate-500">Recommendation: </span>
                    {e.aiRecommendation}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'notes' && id && (
        <CaseNotes
          caseId={id}
          notes={notes}
          author={user?.name ?? 'Investigator'}
          onChange={(n) => setNotes(n)}
        />
      )}

      {activeTab === 'report' && (
        <Card className="p-6">
          <div className="text-center py-6">
            <FlaskConical className="mx-auto h-10 w-10 text-slate-500 mb-3" />
            <h3 className="text-slate-200 font-medium">Generate Forensic Report</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Compile case information, evidence, timeline, and analysis into a printable forensic report.
            </p>
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
