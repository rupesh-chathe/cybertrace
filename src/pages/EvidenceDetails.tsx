import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  Loader2,
  Fingerprint,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { RiskBadge, IntegrityBadge } from '@/components/common/Badges';
import { LoadingState, EmptyState } from '@/components/common/States';
import { RiskScore } from '@/components/evidence/RiskScore';
import { IntegrityCard } from '@/components/dashboard/StatCard';
import { evidenceService } from '@/services/evidenceService';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { auditService } from '@/services/auditService';
import { formatDateTime } from '@/utils/format';
import type { Evidence } from '@/types/evidence';
import { useEffect } from 'react';

type VerifyState = 'idle' | 'verifying' | 'verified' | 'compromised';

export default function EvidenceDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');

  useEffect(() => {
    if (!id) return;
    evidenceService.getEvidenceById(id).then((e) => {
      setEvidence(e);
      setLoading(false);
    });
  }, [id]);

  const handleVerify = async () => {
    if (!evidence) return;
    setVerifyState('verifying');
    const result = await evidenceService.verifyIntegrity(evidence.evidenceId);
    setVerifyState(result.verified ? 'verified' : 'compromised');
    auditService.log(user?.email ?? 'unknown', 'Integrity Verified', `${evidence.evidenceId} / ${evidence.filename}`, result.verified ? 'SHA-256 hash match confirmed' : 'Hash mismatch detected');
    toast(result.verified ? 'success' : 'error', result.verified ? 'Evidence integrity verified.' : 'Integrity compromised — hash mismatch.');
  };

  if (loading) return <LoadingState label="Loading evidence..." />;
  if (!evidence) {
    return (
      <Card>
        <EmptyState
          title="Evidence not found"
          description="The evidence you are looking for does not exist."
          action={<Link to="/evidence" className="text-cyan-400 hover:text-cyan-300">Back to Evidence</Link>}
        />
      </Card>
    );
  }

  const metadataRows = [
    { label: 'File Size', value: evidence.metadata.fileSize },
    { label: 'Created', value: formatDateTime(evidence.metadata.created) },
    { label: 'Modified', value: formatDateTime(evidence.metadata.modified) },
    { label: 'MIME Type', value: evidence.metadata.mimeType },
    { label: 'Extension', value: evidence.metadata.extension },
  ];

  const showVerified = verifyState === 'verified' || (verifyState === 'idle' && evidence.integrity === 'VERIFIED');
  const showCompromised = verifyState === 'compromised' || (verifyState === 'idle' && evidence.integrity === 'COMPROMISED');

  return (
    <div className="space-y-6">
      <Link to="/evidence" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" />
        Back to Evidence
      </Link>

      <PageHeader title={evidence.filename} subtitle={`${evidence.evidenceId} · ${evidence.caseId} — ${evidence.caseTitle}`} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Risk + Integrity */}
        <div className="space-y-4">
          <Card className="p-5 flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-300 mb-4 self-start">Risk Score</h3>
            <RiskScore score={evidence.riskScore} level={evidence.riskLevel} size="lg" />
            <p className="mt-3 text-xs text-slate-500 text-center">
              {evidence.riskLevel === 'HIGH'
                ? 'Potentially suspicious artifact. Requires investigator review.'
                : evidence.riskLevel === 'MEDIUM'
                  ? 'Review recommended before advancing investigation.'
                  : 'No significant risk indicators detected.'}
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Integrity</h3>
            <div className="flex items-center justify-between mb-3">
              <IntegrityBadge status={evidence.integrity} />
              <button
                onClick={handleVerify}
                disabled={verifyState === 'verifying'}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
              >
                {verifyState === 'verifying' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Verify Integrity
              </button>
            </div>

            {verifyState === 'verifying' && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-xs text-cyan-300">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Computing SHA-256 and comparing...
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-cyan-400 animate-pulse-soft" style={{ width: '70%' }} />
                </div>
              </div>
            )}

            {(showVerified || showCompromised) && verifyState !== 'idle' && (
              <div className="mt-3">
                <IntegrityCard verified={showVerified} />
                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <p className="text-slate-500 mb-0.5">Original Hash</p>
                    <p className="font-mono text-slate-300 break-all">{evidence.sha256}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-0.5">Current Hash</p>
                    <p className="font-mono text-slate-300 break-all">{evidence.sha256}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Details + Metadata + Indicators */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              File Information
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Filename</p>
                <p className="text-sm text-slate-200">{evidence.filename}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Evidence ID</p>
                <p className="text-sm font-mono text-cyan-400">{evidence.evidenceId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Case</p>
                <p className="text-sm text-slate-200">{evidence.caseId} — {evidence.caseTitle}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">File Type</p>
                <p className="text-sm text-slate-200">{evidence.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">File Size</p>
                <p className="text-sm text-slate-200">{evidence.fileSize}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Upload Date</p>
                <p className="text-sm text-slate-200">{formatDateTime(evidence.uploadedAt)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Fingerprint className="h-4 w-4 text-slate-400" />
              SHA-256 Hash
            </h3>
            <p className="font-mono text-xs text-slate-300 break-all bg-slate-950 rounded-lg p-3 border border-slate-800">
              {evidence.sha256}
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Metadata</h3>
            <div className="divide-y divide-slate-800/50">
              {metadataRows.map((row) => (
                <div key={row.label} className="flex justify-between py-2.5">
                  <span className="text-sm text-slate-400">{row.label}</span>
                  <span className="text-sm text-slate-200">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Risk Indicators
            </h3>
            <div className="space-y-2">
              {evidence.riskIndicators.map((ind, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                  <span className={`h-2 w-2 rounded-full ${
                    ind.severity === 'HIGH' ? 'bg-red-400' : ind.severity === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className="text-sm text-slate-200 flex-1">{ind.label}</span>
                  <RiskBadge level={ind.severity} />
                </div>
              ))}
            </div>
          </Card>

          {evidence.aiSummary && (
            <Card className="p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                AI-Assisted Analysis
              </h3>
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="text-xs font-medium text-cyan-300 mb-2">AI-Assisted Prototype Analysis</p>
                <p className="text-sm text-slate-300">{evidence.aiSummary}</p>
                {evidence.aiRecommendation && (
                  <p className="mt-3 text-sm text-slate-300">
                    <span className="text-xs text-slate-500">Recommendation: </span>
                    {evidence.aiRecommendation}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
